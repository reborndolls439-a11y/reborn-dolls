import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
      additionalCategories: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({
    product: {
      ...product,
      price: pd(product.price),
      salePrice: product.salePrice ? pd(product.salePrice) : null,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const body = await request.json();

    // Destructure only known fields — never spread unknown payload into Prisma
    const {
      name, description, shortDescription, price, salePrice, sku,
      categoryId, additionalCategoryIds, status, badge,
      isFeatured, isNewArrival, stockQuantity, lowStockThreshold,
      materials, dimensions, weight, whatsIncluded, careInstructions,
      seoTitle, seoDescription, tags, images,
    } = body;

    // Stock logging
    const existing = await prisma.product.findUnique({ where: { id }, select: { stockQuantity: true } });
    const newQty = stockQuantity !== undefined ? parseInt(stockQuantity) : existing?.stockQuantity;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(status !== undefined && { status }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isNewArrival !== undefined && { isNewArrival }),
        ...(stockQuantity !== undefined && { stockQuantity: newQty }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
        ...(materials !== undefined && { materials }),
        ...(dimensions !== undefined && { dimensions }),
        ...(weight !== undefined && { weight }),
        ...(whatsIncluded !== undefined && { whatsIncluded }),
        ...(careInstructions !== undefined && { careInstructions }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim()).filter(Boolean) }),
        // Replace additional categories
        ...(additionalCategoryIds !== undefined && {
          additionalCategories: {
            set: (additionalCategoryIds as string[]).map((catId) => ({ id: catId })),
          },
        }),
        // Replace images
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: (images as { url: string; alt?: string; isPrimary?: boolean }[]).map((img, i) => ({
              url: img.url,
              alt: img.alt || name || "",
              isPrimary: img.isPrimary ?? i === 0,
              sortOrder: i,
            })),
          },
        }),
      },
      include: {
        images: true,
        category: { select: { name: true, slug: true } },
        additionalCategories: { select: { id: true, name: true, slug: true } },
      },
    });

    // Log inventory change
    if (existing && stockQuantity !== undefined && parseInt(stockQuantity) !== existing.stockQuantity) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          change: parseInt(stockQuantity) - existing.stockQuantity,
          reason: "Admin adjustment",
          newQuantity: parseInt(stockQuantity),
        },
      });
    }

    await prisma.activityLog.create({
      data: { userId: admin.id, action: "product_updated", entity: "product", entityId: id },
    });

    return NextResponse.json({
      success: true,
      product: { ...product, price: pd(product.price), salePrice: product.salePrice ? pd(product.salePrice) : null },
    });
  } catch (e) {
    console.error("[PRODUCT_UPDATE]", e);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    await prisma.activityLog.create({
      data: { userId: admin.id, action: "product_archived", entity: "product", entityId: id },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
