import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function parsePrice(priceStr: string): number {
  const clean = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { products, category: categorySlug } = await request.json();
    if (!products?.length) return NextResponse.json({ error: "No products provided." }, { status: 400 });

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });

    let imported = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const baseSlug = slugify(product.title);
        // Ensure unique slug
        let slug = baseSlug;
        let attempt = 0;
        while (await prisma.product.findUnique({ where: { slug } })) {
          attempt++;
          slug = `${baseSlug}-${attempt}`;
        }

        const priceValue = parsePrice(product.price);

        await prisma.product.create({
          data: {
            name: product.title,
            slug,
            description: product.description || `<p>${product.description}</p>`,
            shortDescription: product.description?.slice(0, 200),
            price: priceValue > 0 ? priceValue : 99.99,
            status: "DRAFT", // imported as draft — admin reviews before publishing
            badge: "NEW",
            isNewArrival: true,
            stockQuantity: 10,
            categoryId: category?.id ?? null,
            sourceUrl: product.sourceUrl,
            tags: [categorySlug],
            images: product.images?.length
              ? {
                  create: product.images.map((url: string, i: number) => ({
                    url,
                    isPrimary: i === 0,
                    sortOrder: i,
                  })),
                }
              : undefined,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: admin.id,
            action: "product_imported",
            entity: "product",
            metadata: { sourceUrl: product.sourceUrl, title: product.title },
          },
        });

        imported++;
      } catch (err) {
        console.error("[SCRAPER_IMPORT] Failed to import product:", product.title, err);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      message: `${imported} product${imported !== 1 ? "s" : ""} imported as drafts. Review and publish from the Products page.`,
    });
  } catch (error) {
    console.error("[SCRAPER_IMPORT]", error);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}
