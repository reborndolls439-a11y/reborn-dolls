import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "8"));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const skip = (page - 1) * limit;
    const full = searchParams.get("full") === "true";

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], categories: [], total: 0 });
    }

    const searchTerm = q.split(" ").filter(Boolean).join(" & ");

    const [products, categories, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: full ? limit : 6,
        skip: full ? skip : 0,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, name: true, slug: true, price: true, salePrice: true,
          badge: true, stockQuantity: true,
          shortDescription: true,
          images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
      }),

      full
        ? []
        : prisma.category.findMany({
            where: {
              isActive: true,
              name: { contains: q, mode: "insensitive" },
            },
            take: 3,
            select: { id: true, name: true, slug: true, image: true },
          }),

      full
        ? prisma.product.count({
            where: {
              status: "PUBLISHED",
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { shortDescription: { contains: q, mode: "insensitive" } },
              ],
            },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        price: parseDecimal(p.price),
        salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
        primaryImage: p.images[0]?.url ?? null,
      })),
      categories,
      total,
      totalPages: full ? Math.ceil(total / limit) : 0,
    });
  } catch (error) {
    console.error("[SEARCH]", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
