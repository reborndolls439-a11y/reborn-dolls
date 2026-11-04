import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    // ─── Strategy 1: Direct HTML fetch ──────────────────────────────────────
    let html = "";
    let usedBrowserless = false;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        html = await res.text();
      }
    } catch {
      // Direct fetch failed, continue to Browserless
    }

    // ─── Strategy 2: Browserless fallback ────────────────────────────────────
    if (!html) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";

      if (browserlessToken) {
        try {
          const blRes = await fetch(`${browserlessUrl}/content?token=${browserlessToken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(30000),
          });

          if (blRes.ok) {
            html = await blRes.text();
            usedBrowserless = true;
          }
        } catch {
          // Browserless also failed
        }
      }
    }

    if (!html) {
      return NextResponse.json(
        { error: "Could not fetch the page. The site may block automated requests." },
        { status: 422 }
      );
    }

    // ─── Parse products ───────────────────────────────────────────────────────
    // Try JSON-LD structured data first (most reliable), then fall back to HTML
    let products = parseJsonLd(html, url);
    const foundJsonLd = products.length > 0;

    if (products.length === 0) {
      products = parseProductsFromHtml(html, url);
    }

    if (products.length === 0) {
      // Build a helpful message about what happened
      const htmlSize = html.length;
      const hasJsonLd = html.includes("application/ld+json");
      const hasImages = html.includes("data-src=") || html.includes("<img");
      const fetchMethod = usedBrowserless ? "Browserless" : "direct fetch";

      const debugInfo = [
        `Fetched ${htmlSize.toLocaleString()} chars via ${fetchMethod}.`,
        hasJsonLd ? "JSON-LD tags found but no products parsed." : "No JSON-LD tags found.",
        hasImages ? "Images found in HTML." : "No images found in HTML.",
      ].join(" ");

      return NextResponse.json({
        products: [],
        count: 0,
        message: `No products could be extracted. ${debugInfo}`,
      });
    }

    return NextResponse.json({
      products,
      count: products.length,
      method: usedBrowserless ? "browserless" : "direct",
    });
  } catch (error) {
    console.error("[SCRAPER]", error);
    return NextResponse.json(
      { error: "Scraping failed. Please check the URL and try again." },
      { status: 500 }
    );
  }
}

// ─── JSON-LD parser (structured data embedded in <script> tags) ──────────────
function parseJsonLd(html: string, sourceUrl: string) {
  const products: {
    title: string;
    description: string;
    price: string;
    images: string[];
    sourceUrl: string;
    selected: boolean;
  }[] = [];

  // Match all <script type="application/ld+json"> blocks
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const raw = match[1].trim();
      const data = JSON.parse(raw);

      // Handle IndividualProduct or Product types
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

      // Build description with extra details
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

      if (products.length >= 20) break;
    } catch {
      // Skip malformed JSON
      continue;
    }
  }

  // Also collect extra images from the product's image carousel
  // (JSON-LD only has the primary image, but the page may have more)
  if (products.length > 0) {
    const allImages = extractImages(html, sourceUrl);
    for (const product of products) {
      if (product.images.length === 1 && allImages.length > 1) {
        // Find images that share a similar path prefix (same product folder)
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

// ─── Extract image URLs (handles both src and data-src for lazy loading) ──────
function extractImages(html: string, sourceUrl: string): string[] {
  const images: string[] = [];

  // Match both src="..." and data-src="..." attributes
  const imgRegex = /<(?:img|source)[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let imgSrc = match[1];

    // Skip loader/placeholder images
    if (imgSrc.includes("loader.gif") || imgSrc.includes("loader.") || imgSrc === "") continue;

    if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
    else if (imgSrc.startsWith("/")) imgSrc = new URL(imgSrc, sourceUrl).href;
    else if (!imgSrc.startsWith("http")) continue;

    // Filter out icons, logos, sprites
    const skip = ["icon", "logo", "sprite", "avatar", "banner", "favicon", "loader", "placeholder", "shield", "background"];
    if (skip.some((s) => imgSrc.toLowerCase().includes(s))) continue;

    if (!images.includes(imgSrc)) images.push(imgSrc);
  }

  return images;
}

// ─── HTML fallback parser ─────────────────────────────────────────────────────
function parseProductsFromHtml(html: string, sourceUrl: string) {
  const products: {
    title: string;
    description: string;
    price: string;
    images: string[];
    sourceUrl: string;
    selected: boolean;
  }[] = [];

  const allImages = extractImages(html, sourceUrl);

  // Extract product links (handles /item/ patterns and generic product/doll/item links)
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const productLinks: { url: string; text: string }[] = [];
  let linkMatch;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const text = linkMatch[2].replace(/<[^>]*>/g, "").trim();

    if (
      text.length > 2 &&
      text.length < 200 &&
      (href.includes("/item/") || href.includes("product") || href.includes("doll") || href.includes("item"))
    ) {
      const fullUrl = href.startsWith("http") ? href : new URL(href, sourceUrl).href;
      if (!productLinks.find((p) => p.url === fullUrl)) {
        productLinks.push({ url: fullUrl, text });
      }
    }
  }

  // Extract prices (handles $, £, and other currency patterns)
  const priceRegex = /(?:class=["'][^"']*(?:price|Price|amount|cost)[^"']*["'][^>]*>|\$[\d,]+(?:\.\d{2})?|£[\d,]+(?:\.\d{2})?|[\d,]+(?:\.\d{2})?\s*(?:USD|XAF|EUR|GBP))/g;
  const prices: string[] = [];
  let priceMatch;
  while ((priceMatch = priceRegex.exec(html)) !== null) {
    const p = priceMatch[0].replace(/<[^>]*>/g, "").trim();
    const cleanPrice = p.match(/[$£]?[\d,]+(?:\.\d{2})?|[\d,]+\s*(?:USD|XAF|EUR|GBP)/);
    if (cleanPrice && !prices.includes(cleanPrice[0])) {
      prices.push(cleanPrice[0]);
    }
  }

  // Build products from links
  if (productLinks.length > 0) {
    const seen = new Set<string>();
    for (const link of productLinks) {
      const title = link.text.replace(/\s+/g, " ").trim();
      if (title.length < 3 || seen.has(title)) continue;
      seen.add(title);

      // Find related images by user folder pattern (e.g., user/9470/)
      const userFolder = link.url.match(/item\/(\d+)/)?.[1];
      const productImages = userFolder
        ? allImages.filter((img) => img.includes(userFolder))
        : allImages.slice(0, 3);

      products.push({
        title,
        description: `A beautifully crafted collectible — ${title}.`,
        price: prices[0] || "",
        images: productImages.length > 0 ? productImages.slice(0, 5) : allImages.slice(0, 3),
        sourceUrl: link.url,
        selected: true,
      });

      if (products.length >= 20) break;
    }
  }

  // Fallback: use image alt texts
  if (products.length === 0 && allImages.length > 0) {
    const seen = new Set<string>();
    for (const img of allImages) {
      const altMatch = html.match(new RegExp(`data-src=["']${img.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*alt=["']([^"']*)["']`));
      const title = altMatch?.[1]?.trim() || "";
      if (title.length < 5 || seen.has(title)) continue;
      seen.add(title);
      products.push({
        title,
        description: `A beautifully crafted collectible — ${title}.`,
        price: "",
        images: [img],
        sourceUrl,
        selected: true,
      });
      if (products.length >= 20) break;
    }
  }

  return products;
}
