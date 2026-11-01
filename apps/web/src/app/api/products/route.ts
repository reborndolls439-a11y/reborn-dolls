import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const badge = searchParams.get("badge");
    const featured = searchParams.get("featured");
    const newArrivals = searchParams.get("new");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (category) where.category = { slug: category };
    if (badge) where.badge = badge;
    if (featured === "true") where.isFeatured = true;
    if (newArrivals === "true") where.isNewArrival = true;
    if (inStock === "true") where.stockQuantity = { gt: 0 };
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    // Sort
    const orderBy: Record<string, unknown>[] = [];
    switch (sort) {
      case "price-asc":
        orderBy.push({ price: "asc" });
        break;
      case "price-desc":
        orderBy.push({ price: "desc" });
        break;
      case "featured":
        orderBy.push({ isFeatured: "desc" }, { sortOrder: "asc" });
        break;
      case "newest":
      default:
        orderBy.push({ createdAt: "desc" });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          badge: true,
          isFeatured: true,
          isNewArrival: true,
          stockQuantity: true,
          category: { select: { name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { url: true, alt: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const serialized = products.map((p) => ({
      ...p,
      price: parseDecimal(p.price),
      salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
      primaryImage: p.images[0]?.url ?? null,
    }));

    return NextResponse.json({
      data: serialized,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}
