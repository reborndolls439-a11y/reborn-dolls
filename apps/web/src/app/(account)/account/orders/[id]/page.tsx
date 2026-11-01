import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@reborn/db";
import type { Prisma } from "@reborn/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { Badge } from "@reborn/ui";
import { formatDate, formatPrice, parseDecimal, getOrderStatusLabel } from "@/lib/utils";

type OrderItem = Prisma.OrderItemGetPayload<Record<string, never>>;

const statusVariant: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
  PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info",
  SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default",
};

const statusSteps = ["PENDING", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true, shippingAddress: true },
  });

  if (!order) notFound();

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-taupe hover:text-charcoal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-charcoal">Order #{order.orderNumber}</h1>
          <p className="text-sm text-taupe font-body">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[order.status] || "default"}>
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Progress tracker */}
      {!["CANCELLED", "REFUNDED"].includes(order.status) && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
          <h2 className="font-heading text-base font-semibold text-charcoal mb-5">Order Progress</h2>
          <div className="flex items-center">
            {statusSteps.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                      ${done ? "bg-bloom-rose text-white" : "bg-charcoal-100 text-taupe"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 text-center max-w-[60px] font-body leading-tight
                      ${active ? "text-bloom-rose font-semibold" : done ? "text-charcoal" : "text-taupe"}`}>
                      {getOrderStatusLabel(step)}
                    </p>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < currentStepIndex ? "bg-bloom-rose" : "bg-charcoal-100"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 flex items-start gap-3">
          <Truck className="w-5 h-5 text-sage shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-charcoal font-body text-sm">Your order has shipped</p>
            <p className="text-sm text-taupe font-body mt-0.5">
              {order.shippingCarrier && <span>{order.shippingCarrier} — </span>}
              Tracking: <strong>{order.trackingNumber}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-charcoal-100">
        <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-bloom-rose" /> Items Ordered
        </h2>
        <div className="divide-y divide-charcoal-50">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal font-body">{item.productName}</p>
                <p className="text-sm text-taupe font-body">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-charcoal font-body shrink-0">{formatPrice(parseDecimal(item.subtotal))}</p>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="px-5 py-4 border-t border-charcoal-100 space-y-2 text-sm font-body">
          <div className="flex justify-between text-taupe"><span>Subtotal</span><span>{formatPrice(parseDecimal(order.subtotal))}</span></div>
          <div className="flex justify-between text-taupe">
            <span>Shipping</span>
            <span>{parseDecimal(order.shippingCost) === 0 ? <span className="text-green-600">Free</span> : formatPrice(parseDecimal(order.shippingCost))}</span>
          </div>
          {parseDecimal(order.tax) > 0 && (
            <div className="flex justify-between text-taupe"><span>Tax</span><span>{formatPrice(parseDecimal(order.tax))}</span></div>
          )}
          <div className="flex justify-between font-bold text-charcoal text-base pt-2 border-t border-charcoal-100">
            <span>Total</span><span>{formatPrice(parseDecimal(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <h2 className="font-heading text-base font-semibold text-charcoal mb-3">Shipping Address</h2>
          <p className="text-sm text-taupe font-body leading-relaxed">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </p>
        </div>
      )}

      {/* Need help */}
      <div className="bg-soft-blush-50 border border-bloom-rose-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-medium text-charcoal font-body mb-1">Need help with this order?</p>
        <Link href="/account/support" className="text-sm text-bloom-rose font-semibold font-body hover:underline">Contact Support →</Link>
      </div>
    </div>
  );
}

