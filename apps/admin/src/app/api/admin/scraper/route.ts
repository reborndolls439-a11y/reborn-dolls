import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { url, category } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";
    const browserlessToken = process.env.BROWSERLESS_TOKEN;

    if (!browserlessToken) {
      return NextResponse.json({ error: "Browserless API token not configured." }, { status: 503 });
    }

    // Use Browserless to scrape the page
    const scrapeRes = await fetch(`${browserlessUrl}/scrape?token=${browserlessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        elements: [
          // Generic selectors that work on most e-commerce sites
          { selector: "h1, h2, .product-title, .product-name, [class*='title'], [class*='name']" },
          { selector: "img[src*='product'], img[src*='doll'], .product-image img, [class*='product'] img" },
          { selector: "[class*='price'], [class*='Price'], .price, [itemprop='price']" },
          { selector: "[class*='description'], [class*='Description'], .description, [itemprop='description']" },
          { selector: "a[href*='product'], a[href*='doll'], .product a, [class*='product-card'] a" },
        ],
      }),
    });

    if (!scrapeRes.ok) {
      const errText = await scrapeRes.text();
      console.error("[SCRAPER] Browserless error:", errText);
      return NextResponse.json({ error: "Failed to scrape the page. Check the URL and try again." }, { status: 422 });
    }

    const scrapeData = await scrapeRes.json();

    // Parse scraped data into product objects
    const products = parseScrapedProducts(scrapeData, url);

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error("[SCRAPER]", error);
    return NextResponse.json({ error: "Scraping failed. Please check the URL and try again." }, { status: 500 });
  }
}

interface ScrapedElement {
  results?: { html?: string; text?: string; attributes?: { name: string; value: string }[] }[];
}

function parseScrapedProducts(data: ScrapedElement[], sourceUrl: string) {
  // Extract raw elements
  const titles: string[] = [];
  const images: string[] = [];
  const prices: string[] = [];
  const descriptions: string[] = [];
  const links: string[] = [];

  for (const element of data) {
    const results = element.results || [];
    for (const r of results) {
      const text = r.text?.trim();
      const html = r.html || "";

      // Extract image src
      const imgMatch = html.match(/src=["']([^"']+)["']/);
      if (imgMatch?.[1] && !images.includes(imgMatch[1])) {
        const imgSrc = imgMatch[1];
        if (imgSrc.startsWith("http") && (imgSrc.includes(".jpg") || imgSrc.includes(".png") || imgSrc.includes(".webp"))) {
          images.push(imgSrc);
        }
      }

      // Extract href
      const hrefMatch = html.match(/href=["']([^"']+)["']/);
      if (hrefMatch?.[1]) {
        const link = hrefMatch[1].startsWith("http")
          ? hrefMatch[1]
          : new URL(hrefMatch[1], sourceUrl).href;
        if (!links.includes(link)) links.push(link);
      }

      if (!text) continue;

      // Classify text
      if (/^\$[\d,]+(\.\d{2})?/.test(text) || /^[\d,]+(\.\d{2})?\s*(USD|usd|\$)/.test(text)) {
        prices.push(text);
      } else if (text.length > 100) {
        descriptions.push(text);
      } else if (text.length > 3 && text.length < 120 && !text.includes("<")) {
        titles.push(text);
      }
    }
  }

  // Build product objects — group by detected products
  const products = [];
  const maxProducts = Math.min(titles.length, 20);

  for (let i = 0; i < maxProducts; i++) {
    const title = titles[i];
    if (!title || title.length < 5) continue;

    products.push({
      title,
      description: descriptions[i] || descriptions[0] || `${title} — a beautifully crafted collectible doll.`,
      price: prices[i] || prices[0] || "",
      images: images.filter((_, idx) => idx === i || (i === 0 && idx < 3)).slice(0, 3),
      sourceUrl: links[i] || sourceUrl,
      selected: true,
    });
  }

  // Fallback: if no titles found, return a single product from whatever we scraped
  if (products.length === 0 && (titles.length > 0 || images.length > 0)) {
    products.push({
      title: titles[0] || "Imported Product",
      description: descriptions[0] || "Imported from external source.",
      price: prices[0] || "",
      images: images.slice(0, 3),
      sourceUrl,
      selected: true,
    });
  }

  return products;
}
