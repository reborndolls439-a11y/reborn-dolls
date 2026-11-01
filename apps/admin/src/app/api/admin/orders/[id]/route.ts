import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { sendOrderStatusUpdate } from "@/lib/email";

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
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, shippingAddress: true, user: { select: { name: true, email: true } } } });
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ order: { ...order, total: pd(order.total), subtotal: pd(order.subtotal), shippingCost: pd(order.shippingCost), tax: pd(order.tax) } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, shippingCarrier, internalNotes } = body;

    const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(shippingCarrier !== undefined && { shippingCarrier }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    // Log activity
    await prisma.activityLog.create({ data: { userId: admin.id, action: "order_updated", entity: "order", entityId: id, metadata: { status, trackingNumber } } });

    // Send status update email if status changed
    if (status && status !== order.status) {
      const customerEmail = order.user?.email || order.guestEmail;
      const customerName = order.user?.name || order.guestName || "Customer";
      if (customerEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";
        sendOrderStatusUpdate(customerEmail, customerName, order.orderNumber, status, trackingNumber).catch(console.error);
      }

      // Create notification
      await prisma.adminNotification.create({
        data: { type: "ORDER_UPDATE", title: "Order Status Updated", message: `Order #${order.orderNumber} → ${status}`, link: `/admin/orders/${id}` },
      });
    }

    return NextResponse.json({ success: true, order: { ...updated, total: pd(updated.total) } });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Update failed." }, { status: 500 }); }
}
