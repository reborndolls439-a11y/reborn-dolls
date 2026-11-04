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

    // ─── Strategy 2: Browserless fallback (waits for full JS render) ─────────
    if (!html) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";

      if (browserlessToken) {
        // Try /content with waitUntil to let JS render fully
        try {
          const blRes = await fetch(`${browserlessUrl}/content?token=${browserlessToken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
            body: JSON.stringify({
              url,
              waitUntil: "networkidle0",
              timeout: 30000,
            }),
            signal: AbortSignal.timeout(45000),
          });

          if (blRes.ok) {
            html = await blRes.text();
            usedBrowserless = true;
          }
        } catch {
          // /content failed
        }

        // If /content returned too little HTML, try /function with a wait script
        if (html.length < 100000) {
          try {
            const fnRes = await fetch(`${browserlessUrl}/function?token=${browserlessToken}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
              body: JSON.stringify({
                code: `
                  module.exports = async ({ page, context }) => {
                    await page.goto(context.url, { waitUntil: 'networkidle0', timeout: 30000 });
                    await page.waitForTimeout(3000);
                    const html = await page.content();
                    return { data: html, type: 'text/html' };
                  };
                `,
                context: { url },
              }),
              signal: AbortSignal.timeout(45000),
            });

            if (fnRes.ok) {
              const fnData = await fnRes.text();
              if (fnData.length > html.length) {
                html = fnData;
                usedBrowserless = true;
              }
            }
          } catch {
            // /function also failed
          }
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
    let products = parseJsonLd(html, url);

    if (products.length === 0) {
      products = parseProductsFromHtml(html, url);
    }

    if (products.length === 0) {
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

// ─── JSON-LD parser (structured data in <script> tags) ───────────────────────
function parseJsonLd(html: string, sourceUrl: string) {
  const products: {
    title: string; description: string; price: string;
    images: string[]; sourceUrl: string; selected: boolean;
  }[] = [];

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

      if (products.length >= 20) break;
    } catch { continue; }
  }

  // Enrich with additional carousel images sharing the same user folder
  if (products.length > 0) {
    const allImages = extractImages(html, sourceUrl);
    for (const product of products) {
      if (product.images.length === 1 && allImages.length > 1) {
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

// ─── Extract image URLs (handles src AND data-src for lazy loading) ───────────
function extractImages(html: string, sourceUrl: string): string[] {
  const images: string[] = [];
  const imgRegex = /<(?:img|source)[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let imgSrc = match[1];
    if (imgSrc.includes("loader.gif") || imgSrc.includes("loader.") || imgSrc === "") continue;

    if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
    else if (imgSrc.startsWith("/")) imgSrc = new URL(imgSrc, sourceUrl).href;
    else if (!imgSrc.startsWith("http")) continue;

    const skip = ["icon", "logo", "sprite", "avatar", "banner", "favicon", "loader", "placeholder", "shield", "background"];
    if (skip.some((s) => imgSrc.toLowerCase().includes(s))) continue;

    if (!images.includes(imgSrc)) images.push(imgSrc);
  }

  return images;
}

// ─── HTML fallback parser (handles image-only links) ─────────────────────────
function parseProductsFromHtml(html: string, sourceUrl: string) {
  const products: {
    title: string; description: string; price: string;
    images: string[]; sourceUrl: string; selected: boolean;
  }[] = [];

  const allImages = extractImages(html, sourceUrl);

  // Find ALL <a> tags with product-related href patterns
  // Don't require text content — some links wrap images only
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const productItems: { url: string; text: string; innerHtml: string }[] = [];
  let linkMatch;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const innerHtml = linkMatch[2];
    const text = innerHtml.replace(/<[^>]*>/g, "").trim();

    if (
      href.includes("/item/") ||
      href.includes("product") ||
      href.includes("doll") ||
      href.includes("item")
    ) {
      const fullUrl = href.startsWith("http") ? href : new URL(href, sourceUrl).href;
      if (!productItems.find((p) => p.url === fullUrl)) {
        productItems.push({ url: fullUrl, text, innerHtml });
      }
    }
  }

  // Extract prices
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
  const seen = new Set<string>();
  for (const item of productItems) {
    let title = item.text.replace(/\s+/g, " ").trim();

    // If no text (image-only link), try alt text or extract from URL
    if (title.length < 3) {
      const altMatch = item.innerHtml.match(/(?:alt|title)=["']([^"']{3,})["']/i);
      if (altMatch) {
        title = altMatch[1];
      } else {
        const idMatch = item.url.match(/item\/(\d+)/);
        title = idMatch ? `Reborn Doll #${idMatch[1]}` : "Imported Product";
      }
    }

    if (seen.has(title)) continue;
    seen.add(title);

    // Extract images from within this specific link's HTML
    const itemImages = extractImages(item.innerHtml, sourceUrl);

    // If no images inside link, try finding images by item ID
    const itemId = item.url.match(/item\/(\d+)/)?.[1];
    const relatedImages = itemId
      ? allImages.filter((img) => img.includes(itemId))
      : [];

    const finalImages = itemImages.length > 0
      ? itemImages.slice(0, 5)
      : relatedImages.length > 0
        ? relatedImages.slice(0, 5)
        : allImages.slice(0, 3);

    products.push({
      title,
      description: `A beautifully crafted collectible — ${title}.`,
      price: prices[0] || "",
      images: finalImages,
      sourceUrl: item.url,
      selected: true,
    });

    if (products.length >= 20) break;
  }

  // Fallback: use image alt texts as product names
  if (products.length === 0 && allImages.length > 0) {
    const seen2 = new Set<string>();
    for (const img of allImages) {
      const altMatch = html.match(new RegExp(`data-src=["']${img.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*alt=["']([^"']*)["']`));
      const title = altMatch?.[1]?.trim() || "";
      if (title.length < 5 || seen2.has(title)) continue;
      seen2.add(title);
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
