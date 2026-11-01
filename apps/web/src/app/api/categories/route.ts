import { NextResponse } from "next/server";
import { prisma } from "@reborn/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: { where: { status: "PUBLISHED" } } } },
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}
