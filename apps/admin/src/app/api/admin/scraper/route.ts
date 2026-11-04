import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    // Fetch the page HTML directly
    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch page (status ${res.status}). Check the URL and try again.` },
          { status: 422 }
        );
      }

      html = await res.text();
    } catch {
      return NextResponse.json(
        { error: "Could not reach the URL. Make sure it's a valid, publicly accessible page." },
        { status: 422 }
      );
    }

    // Parse the HTML for products
    const products = parseProductsFromHtml(html, url);

    if (products.length === 0) {
      return NextResponse.json({
        products: [],
        count: 0,
        message: "No products detected. The page may use JavaScript rendering or non-standard markup.",
      });
    }

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error("[SCRAPER]", error);
    return NextResponse.json({ error: "Scraping failed. Please check the URL and try again." }, { status: 500 });
  }
}

function parseProductsFromHtml(html: string, sourceUrl: string) {
  const products: {
    title: string;
    description: string;
    price: string;
    images: string[];
    sourceUrl: string;
    selected: boolean;
  }[] = [];

  // ─── Extract all image URLs ────────────────────────────────────────────────
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  const allImages: { url: string; alt: string }[] = [];
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    let imgSrc = imgMatch[1];
    if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
    else if (imgSrc.startsWith("/")) imgSrc = new URL(imgSrc, sourceUrl).href;
    else if (!imgSrc.startsWith("http")) continue;

    // Filter out tiny icons, logos, and non-product images
    const alt = imgMatch[2] || "";
    if (
      (imgSrc.includes("product") || imgSrc.includes("doll") || alt.length > 3) &&
      !imgSrc.includes("icon") &&
      !imgSrc.includes("logo") &&
      !imgSrc.includes("sprite") &&
      !imgSrc.includes("avatar") &&
      !imgSrc.includes("banner") &&
      (imgSrc.endsWith(".jpg") || imgSrc.endsWith(".jpeg") || imgSrc.endsWith(".png") || imgSrc.endsWith(".webp") || imgSrc.includes("cloudinary") || imgSrc.includes("shopify") || imgSrc.includes("cdn"))
    ) {
      allImages.push({ url: imgSrc, alt });
    }
  }

  // ─── Extract product links ────────────────────────────────────────────────
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const productLinks: { url: string; text: string }[] = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const text = linkMatch[2].replace(/<[^>]*>/g, "").trim();
    if (
      text.length > 5 &&
      text.length < 200 &&
      (href.includes("product") || href.includes("doll") || href.includes("item") || href.includes("p/"))
    ) {
      const fullUrl = href.startsWith("http")
        ? href
        : new URL(href, sourceUrl).href;
      if (!productLinks.find((p) => p.url === fullUrl)) {
        productLinks.push({ url: fullUrl, text });
      }
    }
  }

  // ─── Extract prices ────────────────────────────────────────────────────────
  const priceRegex = /(?:class=["'][^"']*(?:price|Price|amount|cost)[^"']*["'][^>]*>|itemprop=["']price["'][^>]*content=["']([^"']+)["'][^>]*>|\$[\d,]+(?:\.\d{2})?)/g;
  const prices: string[] = [];
  let priceMatch;
  while ((priceMatch = priceRegex.exec(html)) !== null) {
    const p = priceMatch[1] || priceMatch[0].replace(/<[^>]*>/g, "").trim();
    const cleanPrice = p.match(/\$?[\d,]+(?:\.\d{2})?/);
    if (cleanPrice && !prices.includes(cleanPrice[0])) {
      prices.push(cleanPrice[0]);
    }
  }

  // ─── Build product objects ─────────────────────────────────────────────────
  // Strategy 1: Use product links with associated images
  if (productLinks.length > 0) {
    const maxProducts = Math.min(productLinks.length, 20);
    for (let i = 0; i < maxProducts; i++) {
      const link = productLinks[i];
      const title = link.text.replace(/\s+/g, " ").trim();
      if (title.length < 3) continue;

      // Find images near this product (rough heuristic: cycle through images)
      const productImages = allImages
        .slice(i * 2, i * 2 + 3)
        .map((img) => img.url)
        .filter((url, idx, arr) => arr.indexOf(url) === idx);

      products.push({
        title,
        description: `A beautifully crafted collectible — ${title}.`,
        price: prices[i] || prices[0] || "",
        images: productImages.length > 0 ? productImages : allImages.slice(0, 3).map((img) => img.url),
        sourceUrl: link.url,
        selected: true,
      });
    }
  }

  // Strategy 2: Use image alt texts as product names
  if (products.length === 0 && allImages.length > 0) {
    const seen = new Set<string>();
    for (const img of allImages) {
      const title = img.alt.trim();
      if (title.length < 5 || seen.has(title)) continue;
      seen.add(title);
      products.push({
        title,
        description: `A beautifully crafted collectible — ${title}.`,
        price: "",
        images: [img.url],
        sourceUrl,
        selected: true,
      });
      if (products.length >= 20) break;
    }
  }

  // Strategy 3: Fallback — single product from whatever we found
  if (products.length === 0 && allImages.length > 0) {
    products.push({
      title: "Imported Product",
      description: "Imported from external source.",
      price: prices[0] || "",
      images: allImages.slice(0, 3).map((img) => img.url),
      sourceUrl,
      selected: true,
    });
  }

  return products;
}
