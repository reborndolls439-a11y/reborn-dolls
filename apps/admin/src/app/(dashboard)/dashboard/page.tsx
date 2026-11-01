import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatCard, Badge } from "@reborn/ui";
import { ShoppingBag, Users, Package, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";
import { formatPrice, formatDate, getOrderStatusLabel } from "@/lib/utils";
import { AdminHeader } from "@/components/layout/AdminHeader";

function parseDecimalLocal(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders, totalCustomers, totalProducts,
    monthRevenue, recentOrders, lowStockProducts,
    unreadNotifications, openChats,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED", "REFUNDED"] } }, _sum: { total: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { shippingAddress: true, items: { take: 1 } } }),
    prisma.product.findMany({ where: { stockQuantity: { lte: 5 }, status: "PUBLISHED" }, take: 5, select: { id: true, name: true, stockQuantity: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } }),
    prisma.adminNotification.count({ where: { isRead: false } }),
    prisma.conversation.count({ where: { status: "OPEN" } }),
  ]);

  const revenue = parseDecimalLocal(monthRevenue._sum.total);

  const statusVariantMap: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
    PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info",
    SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default",
  };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Dashboard" subtitle={`Welcome back, ${admin.name || admin.email}`} unread={unreadNotifications} />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Revenue this month" value={formatPrice(revenue)} icon={<DollarSign />} accent="rose" />
          <StatCard title="Total orders" value={totalOrders} icon={<ShoppingBag />} accent="sage" />
          <StatCard title="Customers" value={totalCustomers} icon={<Users />} accent="taupe" />
          <StatCard title="Live products" value={totalProducts} icon={<Package />} accent="charcoal" />
        </div>

        {/* Alerts row */}
        {(lowStockProducts.length > 0 || openChats > 0) && (
          <div className="flex flex-wrap gap-3">
            {lowStockProducts.length > 0 && (
              <Link href="/products?filter=low-stock" className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-body text-amber-700 hover:bg-amber-100 transition-colors">
                <AlertTriangle className="w-4 h-4" />
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} running low on stock
              </Link>
            )}
            {openChats > 0 && (
              <Link href="/chat" className="flex items-center gap-2 bg-bloom-rose-50 border border-bloom-rose-200 rounded-xl px-4 py-2.5 text-sm font-body text-bloom-rose hover:bg-bloom-rose-100 transition-colors">
                {openChats} open support conversation{openChats > 1 ? "s" : ""}
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-charcoal-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
              <h2 className="font-heading text-base font-semibold text-charcoal">Recent Orders</h2>
              <Link href="/orders" className="text-xs text-bloom-rose font-body hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="divide-y divide-charcoal-50">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-charcoal-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal font-body">#{order.orderNumber}</p>
                    <p className="text-xs text-taupe font-body truncate">
                      {order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : order.guestName || "Guest"}
                      {" · "}{formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusVariantMap[order.status] || "default"} className="shrink-0">{getOrderStatusLabel(order.status)}</Badge>
                  <span className="text-sm font-bold text-charcoal shrink-0">{formatPrice(parseDecimalLocal(order.total))}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-white rounded-2xl border border-charcoal-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
              <h2 className="font-heading text-base font-semibold text-charcoal">Low Stock</h2>
              <Link href="/products" className="text-xs text-bloom-rose font-body hover:underline">Manage</Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-taupe font-body">All products well-stocked ✓</div>
            ) : (
              <div className="divide-y divide-charcoal-50">
                {lowStockProducts.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-charcoal-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                      {p.images[0] && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal font-body line-clamp-1">{p.name}</p>
                    </div>
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${p.stockQuantity === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {p.stockQuantity === 0 ? "Out" : `${p.stockQuantity} left`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


