import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";
import { parseDecimal } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true, shippingAddress: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order,
        subtotal: parseDecimal(order.subtotal),
        shippingCost: parseDecimal(order.shippingCost),
        tax: parseDecimal(order.tax),
        total: parseDecimal(order.total),
        items: order.items.map((i) => ({
          ...i,
          price: parseDecimal(i.price),
          subtotal: parseDecimal(i.subtotal),
        })),
      },
    });
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return NextResponse.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}
