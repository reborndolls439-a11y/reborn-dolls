import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@reborn/db";
import type { Prisma } from "@reborn/db";
import { formatPrice, formatDate, parseDecimal } from "@/lib/utils";
import { CheckCircle2, Package, Mail } from "lucide-react";

type OrderItem = Prisma.OrderItemGetPayload<Record<string, never>>;

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-charcoal mb-3">Order Not Found</h1>
          <Link href="/shop" className="text-bloom-rose hover:underline font-body">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const total = parseDecimal(order.total);
  const customerName = order.guestName || "Customer";
  const customerEmail = order.guestEmail;

  return (
    <div className="min-h-screen bg-ivory py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-heading text-display-sm text-charcoal mb-2">Order Confirmed!</h1>
          <p className="text-taupe font-body">Thank you{order.guestName ? `, ${order.guestName.split(" ")[0]}` : ""}! Your order has been received.</p>
          <div className="mt-3 inline-block bg-bloom-rose-50 border border-bloom-rose-200 rounded-full px-4 py-1">
            <span className="text-sm font-semibold text-bloom-rose font-body">Order #{order.orderNumber}</span>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-3xl p-6 border border-charcoal-100 mb-6">
          <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">What happens next?</h2>
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Confirmation email sent", desc: customerEmail ? `We've sent details to ${customerEmail}` : "Check your email for order details." },
              { icon: Package, title: "We'll be in touch", desc: "Our team will contact you shortly to confirm payment and arrange delivery." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-bloom-rose-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-bloom-rose" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">{item.title}</p>
                  <p className="text-sm text-taupe font-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 border border-charcoal-100 mb-6">
          <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Order Details</h2>
          <div className="space-y-3 mb-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal font-body">{item.productName}</p>
                  <p className="text-xs text-taupe font-body">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-charcoal font-body">{formatPrice(parseDecimal(item.subtotal))}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-charcoal-100 pt-4 space-y-2 text-sm font-body">
            <div className="flex justify-between text-taupe"><span>Subtotal</span><span>{formatPrice(parseDecimal(order.subtotal))}</span></div>
            <div className="flex justify-between text-taupe"><span>Shipping</span><span>{parseDecimal(order.shippingCost) === 0 ? "Free" : formatPrice(parseDecimal(order.shippingCost))}</span></div>
            <div className="flex justify-between font-bold text-charcoal text-base pt-2 border-t border-charcoal-100"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-3xl p-6 border border-charcoal-100 mb-8">
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-3">Shipping To</h2>
            <p className="text-sm text-taupe font-body leading-relaxed">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop" className="flex-1 h-12 flex items-center justify-center bg-white border border-charcoal-200 rounded-full text-sm font-semibold font-body text-charcoal hover:border-bloom-rose hover:text-bloom-rose transition-colors">
            Continue Shopping
          </Link>
          {order.userId && (
            <Link href="/account/orders" className="flex-1 h-12 flex items-center justify-center bg-bloom-rose rounded-full text-sm font-semibold font-body text-white hover:bg-bloom-rose-600 transition-colors">
              View My Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
