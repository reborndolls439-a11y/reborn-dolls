import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

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
  const product = await prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, category: { select: { id: true, name: true, slug: true } } } });
  if (!product) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ product: { ...product, price: pd(product.price), salePrice: product.salePrice ? pd(product.salePrice) : null } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const body = await request.json();

    const { images, ...data } = body;

    // Handle stock adjustment logging
    const existing = await prisma.product.findUnique({ where: { id }, select: { stockQuantity: true } });
    const newQty = data.stockQuantity !== undefined ? parseInt(data.stockQuantity) : existing?.stockQuantity;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        salePrice: data.salePrice !== undefined ? (data.salePrice ? parseFloat(data.salePrice) : null) : undefined,
        stockQuantity: newQty,
        categoryId: data.categoryId || null,
        badge: data.badge || null,
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
              url: img.url, alt: img.alt, isPrimary: i === 0, sortOrder: i,
            })),
          },
        }),
      },
      include: { images: true, category: { select: { name: true, slug: true } } },
    });

    if (existing && data.stockQuantity !== undefined && parseInt(data.stockQuantity) !== existing.stockQuantity) {
      await prisma.inventoryLog.create({ data: { productId: id, change: parseInt(data.stockQuantity) - existing.stockQuantity, reason: "Admin adjustment", newQuantity: parseInt(data.stockQuantity) } });
    }

    await prisma.activityLog.create({ data: { userId: admin.id, action: "product_updated", entity: "product", entityId: id } });

    return NextResponse.json({ success: true, product: { ...product, price: pd(product.price), salePrice: product.salePrice ? pd(product.salePrice) : null } });
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
    await prisma.activityLog.create({ data: { userId: admin.id, action: "product_archived", entity: "product", entityId: id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
