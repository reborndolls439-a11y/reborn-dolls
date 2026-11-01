import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { parseDecimal, formatDate, getOrderStatusLabel } from "@/lib/utils";
import { Badge } from "@reborn/ui";

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orderCount, wishlistCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { items: true } }),
  ]);

  type RecentOrder = (typeof recentOrders)[number];

  const statusVariantMap: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
    PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info",
    SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!</h1>
        <p className="text-taupe font-body mt-1">Here's a quick overview of your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Orders", value: orderCount, href: "/account/orders" },
          { icon: Heart, label: "Wishlist", value: wishlistCount, href: "/account/wishlist" },
          { icon: MessageCircle, label: "Messages", value: 0, href: "/account/support" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-4 border border-charcoal-100 hover:border-bloom-rose-200 hover:shadow-card transition-all group">
            <stat.icon className="w-5 h-5 text-bloom-rose mb-2" />
            <p className="font-heading text-xl font-bold text-charcoal">{stat.value}</p>
            <p className="text-xs text-taupe font-body">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-heading text-base font-semibold text-charcoal">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-bloom-rose font-body hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-charcoal-50">
            {recentOrders.map((order: RecentOrder) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-charcoal-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">#{order.orderNumber}</p>
                  <p className="text-xs text-taupe font-body">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariantMap[order.status] || "default"}>{getOrderStatusLabel(order.status)}</Badge>
                  <span className="text-sm font-semibold text-charcoal font-body">${parseDecimal(order.total).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
