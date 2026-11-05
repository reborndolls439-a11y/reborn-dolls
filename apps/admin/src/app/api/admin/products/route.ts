import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await request.json();
    const { name, description, shortDescription, price, salePrice, sku, categoryId, additionalCategoryIds, status, badge,
      isFeatured, isNewArrival, stockQuantity, lowStockThreshold, materials, dimensions, weight,
      whatsIncluded, careInstructions, seoTitle, seoDescription, tags, images } = body;

    if (!name || !price) return NextResponse.json({ error: "Name and price are required." }, { status: 400 });

    // Ensure unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const product = await prisma.product.create({
      data: {
        name, slug, description: description || "", shortDescription, price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku: sku || null, categoryId: categoryId || null,
        status: status || "DRAFT", badge: badge || null,
        isFeatured: isFeatured || false, isNewArrival: isNewArrival !== false,
        stockQuantity: parseInt(stockQuantity) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        materials, dimensions, weight, whatsIncluded, careInstructions,
        seoTitle, seoDescription, tags: tags || [],
        additionalCategories: additionalCategoryIds?.length
          ? { connect: additionalCategoryIds.map((id: string) => ({ id })) }
          : undefined,
        images: images?.length ? {
          create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
            url: img.url, alt: img.alt || name, isPrimary: i === 0, sortOrder: i,
          })),
        } : undefined,
      },
      include: {
        images: true,
        category: { select: { name: true, slug: true } },
        additionalCategories: { select: { id: true, name: true, slug: true } },
      },
    });

    await prisma.activityLog.create({ data: { userId: admin.id, action: "product_created", entity: "product", entityId: product.id, metadata: { name } } });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (e) {
    console.error("[PRODUCT_CREATE]", e);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
