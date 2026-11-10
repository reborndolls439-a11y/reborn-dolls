import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ success: true, category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;

    // Remove category from all products that use it as primary
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // Remove from many-to-many additional categories
    await prisma.category.update({
      where: { id },
      data: { additionalProducts: { set: [] } },
    });

    // Hard delete the category
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[CATEGORY_DELETE]", e);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
