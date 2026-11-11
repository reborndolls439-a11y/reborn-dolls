import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    const HEADERS = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // ─── Strategy 0: Shopify API (most accurate) ──────────────────────────────
    // Shopify stores expose /products.json — gives individual title, price,
    // description and images per product. Far more reliable than HTML scraping.
    let products = await scrapeShopify(url, HEADERS);
    let usedBrowserless = false;

    // ─── Strategy 1: Stream-parse (fast, low-memory) ─────────────────────────
    if (products.length === 0) products = await streamScrape(url, HEADERS);

    // ─── Strategy 2: Full HTML fetch + parse ─────────────────────────────────
    if (products.length === 0) {
      let html = "";
      try {
        const res = await fetch(url, {
          headers: HEADERS,
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) html = await res.text();
      } catch { /* continue to Browserless */ }

      if (html.length > 0) {
        products = parseJsonLd(html, url);
        if (products.length === 0) products = parseProductsFromHtml(html, url);
      }
    }

    // ─── Strategy 3: Browserless fallback ────────────────────────────────────
    if (products.length === 0) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";

      if (browserlessToken) {
        try {
          const blRes = await fetch(`${browserlessUrl}/content?token=${browserlessToken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
            body: JSON.stringify({ url, waitUntil: "networkidle0", timeout: 30000 }),
            signal: AbortSignal.timeout(45000),
          });
          if (blRes.ok) {
            const html = await blRes.text();
            usedBrowserless = true;
            products = parseJsonLd(html, url);
            if (products.length === 0) products = parseProductsFromHtml(html, url);
          }
        } catch { /* Browserless failed */ }
      }
    }

    if (products.length === 0) {
      return NextResponse.json({
        products: [],
        count: 0,
        message: "No products could be extracted from this page. The site may require JavaScript rendering.",
      });
    }

    return NextResponse.json({ products, count: products.length, method: usedBrowserless ? "browserless" : "direct" });
  } catch (error) {
    console.error("[SCRAPER]", error);
    return NextResponse.json({ error: "Scraping failed. Please try again." }, { status: 500 });
  }
}

// ─── SHOPIFY API SCRAPER ──────────────────────────────────────────────────────
// Detects Shopify stores by probing /products.json. If found, paginates through
// all products (250 per page) up to the 100-product limit.
async function scrapeShopify(url: string, headers: Record<string, string>): Promise<Product[]> {
  try {
    const { origin, pathname } = new URL(url);

    // Derive collection handle from URL if present (e.g. /collections/baby-dolls)
    const collectionMatch = pathname.match(/\/collections\/([^/?#]+)/);
    const collectionHandle = collectionMatch?.[1];

    // Build the products.json endpoint — collection-scoped if possible
    const apiBase = collectionHandle
      ? `${origin}/collections/${collectionHandle}/products.json`
      : `${origin}/products.json`;

    const products: Product[] = [];
    let page = 1;

    while (products.length < 100) {
      const res = await fetch(`${apiBase}?limit=250&page=${page}`, {
        headers: { ...headers, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return []; // Not a Shopify store or endpoint not available

      const data = await res.json() as { products?: ShopifyProduct[] };
      const batch = data.products;
      if (!batch || batch.length === 0) break;

      for (const p of batch) {
        if (products.length >= 100) break;

        // Strip HTML from body_html
        const description = p.body_html
          ? p.body_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500)
          : "";

        // Price: use the lowest variant price
        const price = p.variants?.length
          ? `£${parseFloat(p.variants.reduce((min, v) => parseFloat(v.price) < parseFloat(min.price) ? v : min).price).toFixed(2)}`
          : "";

        // Images: all image srcs, up to 5
        const images = (p.images || []).slice(0, 5).map((img) => img.src);

        products.push({
          title: p.title,
          description,
          price,
          images,
          sourceUrl: `${origin}/products/${p.handle}`,
          selected: true,
        });
      }

      if (batch.length < 250) break; // Last page
      page++;
    }

    return products;
  } catch {
    return []; // Not Shopify — fall through to other strategies
  }
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  variants: { price: string }[];
  images: { src: string }[];
}

// ─── STREAM SCRAPER ──────────────────────────────────────────────────────────
// Reads the response body as a stream, collects JSON-LD blocks without
// buffering the full HTML. Stops once we have 20 products or the body ends.
async function streamScrape(url: string, headers: Record<string, string>) {
  const products: Product[] = [];

  try {
    const res = await fetch(url, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok || !res.body) return products;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const MAX_BUFFER = 600_000; // Stop after 600KB regardless

    while (products.length < 100 && buffer.length < MAX_BUFFER) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Extract and parse any complete JSON-LD blocks found so far
      const extracted = extractJsonLdFromChunk(buffer, url);
      for (const p of extracted) {
        if (!products.find((existing) => existing.sourceUrl === p.sourceUrl)) {
          products.push(p);
        }
      }

      // Stop early only after 300KB if we already have products
      if (products.length > 0 && buffer.length > 300_000) break;
    }

    // Cleanup: cancel the stream if we stopped early
    try { await reader.cancel(); } catch { /* ignore */ }
  } catch { /* stream failed */ }

  return products;
}

// Extracts all complete JSON-LD product blocks from a partial HTML string
function extractJsonLdFromChunk(html: string, sourceUrl: string): Product[] {
  const products: Product[] = [];
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const product = data["@type"] === "IndividualProduct" || data["@type"] === "Product" ? data : null;
      if (!product) continue;

      const title = product.name || "Imported Product";
      const image = product.image || "";
      const description = product.description || "";
      const offers = product.offers || {};
      const price = offers.price ? `${offers.price} ${offers.priceCurrency || ""}`.trim() : "";
      const productUrl = offers.url || sourceUrl;
      const seller = offers.seller?.name || "";
      const condition = offers.itemCondition?.replace("https://schema.org/", "") || "";

      let fullDesc = description;
      if (seller) fullDesc += ` — Sold by ${seller}`;
      if (condition) fullDesc += ` (${condition})`;

      products.push({
        title,
        description: fullDesc || `A beautifully crafted collectible — ${title}.`,
        price,
        images: image ? [image] : [],
        sourceUrl: productUrl,
        selected: true,
      });
    } catch { /* skip malformed JSON */ }
  }

  // Enrich with carousel images sharing same user folder
  if (products.length > 0) {
    const allImages = extractImages(html, sourceUrl);
    for (const product of products) {
      if (product.images.length >= 1 && allImages.length > 1) {
        const baseUser = product.images[0].match(/user\/(\d+)\//)?.[1];
        if (baseUser) {
          const related = allImages.filter((img) => img.includes(`user/${baseUser}/`) && img !== product.images[0]);
          product.images = [product.images[0], ...related.slice(0, 4)];
        }
      }
    }
  }

  return products;
}

// ─── FULL HTML JSON-LD PARSER ─────────────────────────────────────────────────
function parseJsonLd(html: string, sourceUrl: string): Product[] {
  return extractJsonLdFromChunk(html, sourceUrl);
}

// ─── IMAGE EXTRACTOR (handles src and data-src) ───────────────────────────────
function extractImages(html: string, sourceUrl: string): string[] {
  const images: string[] = [];
  const imgRegex = /<(?:img|source)[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let imgSrc = match[1];
    if (imgSrc.includes("loader.gif") || imgSrc === "") continue;

    if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
    else if (imgSrc.startsWith("/")) imgSrc = new URL(imgSrc, sourceUrl).href;
    else if (!imgSrc.startsWith("http")) continue;

    const skip = ["icon", "logo", "sprite", "avatar", "banner", "favicon", "loader", "placeholder", "shield", "background"];
    if (skip.some((s) => imgSrc.toLowerCase().includes(s))) continue;

    if (!images.includes(imgSrc)) images.push(imgSrc);
  }

  return images;
}

// ─── HTML FALLBACK PARSER (image-only links, alt text) ────────────────────────
function parseProductsFromHtml(html: string, sourceUrl: string): Product[] {
  const products: Product[] = [];
  const allImages = extractImages(html, sourceUrl);

  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const productItems: { url: string; text: string; innerHtml: string }[] = [];
  let linkMatch;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const innerHtml = linkMatch[2];
    const text = innerHtml.replace(/<[^>]*>/g, "").trim();

    if (href.includes("/item/") || href.includes("product") || href.includes("doll") || href.includes("item")) {
      const fullUrl = href.startsWith("http") ? href : new URL(href, sourceUrl).href;
      if (!productItems.find((p) => p.url === fullUrl)) {
        productItems.push({ url: fullUrl, text, innerHtml });
      }
    }
  }

  const priceRegex = /(?:\$[\d,]+(?:\.\d{2})?|£[\d,]+(?:\.\d{2})?|[\d,]+\s*(?:USD|EUR|GBP))/g;
  const prices: string[] = [];
  let priceMatch;
  while ((priceMatch = priceRegex.exec(html)) !== null) {
    const p = priceMatch[0].trim();
    if (!prices.includes(p)) prices.push(p);
  }

  const seen = new Set<string>();
  for (const item of productItems) {
    let title = item.text.replace(/\s+/g, " ").trim();

    if (title.length < 3) {
      const altMatch = item.innerHtml.match(/(?:alt|title)=["']([^"']{3,})["']/i);
      if (altMatch) title = altMatch[1];
      else {
        const idMatch = item.url.match(/item\/(\d+)/);
        title = idMatch ? `Reborn Doll #${idMatch[1]}` : "Imported Product";
      }
    }

    if (seen.has(title)) continue;
    seen.add(title);

    const itemImages = extractImages(item.innerHtml, sourceUrl);
    const itemId = item.url.match(/item\/(\d+)/)?.[1];
    const relatedImages = itemId ? allImages.filter((img) => img.includes(itemId)) : [];
    const finalImages = itemImages.length > 0 ? itemImages.slice(0, 5) : relatedImages.length > 0 ? relatedImages.slice(0, 5) : allImages.slice(0, 3);

    products.push({ title, description: `A beautifully crafted collectible — ${title}.`, price: prices[0] || "", images: finalImages, sourceUrl: item.url, selected: true });
    if (products.length >= 100) break;
  }

  return products;
}

interface Product {
  title: string;
  description: string;
  price: string;
  images: string[];
  sourceUrl: string;
  selected: boolean;
}
