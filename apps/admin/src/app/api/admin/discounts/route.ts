import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons: coupons.map((c) => ({ ...c, value: Number(c.value), minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null })) });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await request.json();
    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
    const coupon = await prisma.coupon.create({ data: { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } });
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed." }, { status: 500 }); }
}
