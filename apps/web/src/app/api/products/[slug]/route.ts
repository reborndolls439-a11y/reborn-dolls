import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Related products (same category, excluding current)
    const related = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        categoryId: product.categoryId ?? undefined,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true,
        badge: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    });

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;

    return NextResponse.json({
      product: {
        ...product,
        price: parseDecimal(product.price),
        salePrice: product.salePrice ? parseDecimal(product.salePrice) : null,
        averageRating: avgRating,
        reviewCount: product.reviews.length,
      },
      related: related.map((r) => ({
        ...r,
        price: parseDecimal(r.price),
        salePrice: r.salePrice ? parseDecimal(r.salePrice) : null,
        primaryImage: r.images[0]?.url ?? null,
      })),
    });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}
