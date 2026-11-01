import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { parseDecimal } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [] });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { addedAt: "desc" },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, salePrice: true,
            badge: true, stockQuantity: true,
            images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: parseDecimal(item.product.price),
          salePrice: item.product.salePrice ? parseDecimal(item.product.salePrice) : null,
          primaryImage: item.product.images[0]?.url ?? null,
        },
      })),
    });
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return NextResponse.json({ error: "Failed to fetch wishlist." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "Product ID required." }, { status: 400 });

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[WISHLIST_ADD]", error);
    return NextResponse.json({ error: "Failed to add to wishlist." }, { status: 500 });
  }
}
