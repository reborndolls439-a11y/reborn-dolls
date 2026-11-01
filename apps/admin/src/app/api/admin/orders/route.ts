import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 20;
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (q) where.OR = [{ orderNumber: { contains: q, mode: "insensitive" } }, { guestEmail: { contains: q, mode: "insensitive" } }, { guestName: { contains: q, mode: "insensitive" } }];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
        include: { items: true, shippingAddress: true, user: { select: { name: true, email: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({ ...o, total: pd(o.total), subtotal: pd(o.subtotal), shippingCost: pd(o.shippingCost), tax: pd(o.tax), items: o.items.map((i) => ({ ...i, price: pd(i.price), subtotal: pd(i.subtotal) })) })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed." }, { status: 500 }); }
}
