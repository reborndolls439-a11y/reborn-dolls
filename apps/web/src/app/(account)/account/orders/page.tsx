import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@reborn/db";
import type { Prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: { take: 1 }; shippingAddress: true } }>;
import { Badge, EmptyState } from "@reborn/ui";
import { formatDate, formatPrice, parseDecimal, getOrderStatusLabel } from "@/lib/utils";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { take: 1 }, shippingAddress: true },
  });

  const statusVariantMap: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
    PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info",
    SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default",
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-charcoal">My Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <EmptyState icon={<Package />} title="No orders yet" description="When you place an order, it will appear here." action={<Link href="/shop" className="text-sm text-bloom-rose font-semibold font-body hover:underline">Start Shopping</Link>} />
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: OrderWithItems) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block bg-white rounded-2xl border border-charcoal-100 p-5 hover:border-bloom-rose-200 hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-charcoal font-body">Order #{order.orderNumber}</p>
                  <p className="text-xs text-taupe font-body mt-0.5">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariantMap[order.status] || "default"}>{getOrderStatusLabel(order.status)}</Badge>
                  <span className="font-bold text-charcoal font-heading">{formatPrice(parseDecimal(order.total))}</span>
                </div>
              </div>
              {order.trackingNumber && (
                <p className="text-xs text-sage font-body">Tracking: {order.shippingCarrier ? `${order.shippingCarrier} — ` : ""}{order.trackingNumber}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
