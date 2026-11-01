import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();
    if (!code) return NextResponse.json({ error: "Coupon code required." }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 400 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }
    const minAmount = coupon.minOrderAmount ? parseDecimal(coupon.minOrderAmount) : 0;
    if (orderTotal < minAmount) {
      return NextResponse.json({
        error: `Minimum order amount of $${minAmount.toFixed(2)} required for this coupon.`,
      }, { status: 400 });
    }

    const value = parseDecimal(coupon.value);
    const discount =
      coupon.type === "PERCENTAGE"
        ? Math.min((orderTotal * value) / 100, orderTotal)
        : Math.min(value, orderTotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value,
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return NextResponse.json({ error: "Failed to validate coupon." }, { status: 500 });
  }
}
