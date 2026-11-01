import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { StatCard } from "@reborn/ui";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export default async function AnalyticsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalRevenue, thisMonthRev, lastMonthRev, totalOrders, thisMonthOrders, totalCustomers, thisMonthCustomers, topProducts] = await Promise.all([
    prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED","REFUNDED"] } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: thisMonth }, status: { notIn: ["CANCELLED","REFUNDED"] } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: lastMonth, lte: lastMonthEnd }, status: { notIn: ["CANCELLED","REFUNDED"] } }, _sum: { total: true } }),
    prisma.order.count({ where: { status: { notIn: ["CANCELLED","REFUNDED"] } } }),
    prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thisMonth } } }),
    prisma.orderItem.groupBy({ by: ["productName"], _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { subtotal: "desc" } }, take: 5 }),
  ]);

  const thisRev = pd(thisMonthRev._sum.total);
  const lastRev = pd(lastMonthRev._sum.total);
  const revTrend = lastRev > 0 ? Math.round(((thisRev - lastRev) / lastRev) * 100) : 0;

  return (
    <div className="flex flex-col">
      <AdminHeader title="Analytics" subtitle="Store performance overview" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`$${pd(totalRevenue._sum.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DollarSign />} accent="rose" />
          <StatCard title="This Month" value={`$${thisRev.toFixed(2)}`} icon={<TrendingUp />} trend={revTrend} trendLabel="vs last month" accent="rose" />
          <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingBag />} accent="sage" />
          <StatCard title="Total Customers" value={totalCustomers} icon={<Users />} accent="taupe" />
        </div>

        {/* This month summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body mb-2">New orders this month</p>
            <p className="font-heading text-3xl font-bold text-charcoal">{thisMonthOrders}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body mb-2">New customers this month</p>
            <p className="font-heading text-3xl font-bold text-charcoal">{thisMonthCustomers}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body mb-2">Avg. order value</p>
            <p className="font-heading text-3xl font-bold text-charcoal">
              ${totalOrders > 0 ? (pd(totalRevenue._sum.total) / totalOrders).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">Top Selling Products</h2>
          <div className="divide-y divide-charcoal-50">
            {topProducts.map((p, i) => (
              <div key={p.productName} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-6 text-sm font-bold text-taupe font-body">{i + 1}</span>
                <p className="flex-1 text-sm font-medium text-charcoal font-body line-clamp-1">{p.productName}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-charcoal font-body">${pd(p._sum.subtotal).toFixed(2)}</p>
                  <p className="text-xs text-taupe font-body">{p._sum.quantity} sold</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <div className="px-5 py-8 text-center text-sm text-taupe font-body">No sales data yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
