import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { name, slug, description, image } = await request.json();
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required." }, { status: 400 });
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
    const category = await prisma.category.create({ data: { name, slug, description, image } });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed." }, { status: 500 }); }
}
