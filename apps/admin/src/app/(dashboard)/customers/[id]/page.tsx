import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@reborn/ui";
import { ArrowLeft, Mail, Package, Heart, Calendar } from "lucide-react";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

const statusVariant: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
  PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info",
  SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { select: { id: true } } },
      },
      _count: { select: { orders: true, wishlist: true } },
    },
  });

  if (!customer) notFound();

  const totalSpent = await prisma.order.aggregate({
    where: { userId: id, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    _sum: { total: true },
  });

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6">
        <Link href="/customers" className="text-taupe hover:text-charcoal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-lg font-bold text-charcoal">{customer.name || customer.email}</h1>
        </div>
        <a href={`mailto:${customer.email}`} className="flex items-center gap-2 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-medium font-body text-charcoal hover:border-bloom-rose hover:text-bloom-rose transition-colors">
          <Mail className="w-4 h-4" /> Email Customer
        </a>
      </div>

      <div className="p-6 space-y-5 max-w-4xl">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-bloom-rose-100 flex items-center justify-center shrink-0">
              <span className="font-heading text-2xl font-bold text-bloom-rose">
                {(customer.name || customer.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-semibold text-charcoal">{customer.name || "No name"}</h2>
              <p className="text-taupe font-body text-sm mt-0.5">{customer.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-taupe font-body">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(customer.createdAt))}</span>
                <Badge variant={customer.isActive ? "success" : "error"}>{customer.isActive ? "Active" : "Suspended"}</Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-charcoal-100">
            {[
              { icon: Package, label: "Total Orders", value: customer._count.orders },
              { icon: Package, label: "Total Spent", value: `$${pd(totalSpent._sum.total).toFixed(2)}` },
              { icon: Heart, label: "Wishlist Items", value: customer._count.wishlist },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-2xl font-bold text-charcoal">{stat.value}</p>
                <p className="text-xs text-taupe font-body mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order history */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <h3 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">Order History</h3>
          {customer.orders.length === 0 ? (
            <div className="py-10 text-center text-sm text-taupe font-body">No orders yet.</div>
          ) : (
            <div className="divide-y divide-charcoal-50">
              {customer.orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-charcoal-50 transition-colors">
                  <div>
                    <p className="font-semibold text-charcoal font-body text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-taupe font-body mt-0.5">
                      {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(order.createdAt))}
                      {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[order.status] || "default"}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="font-bold text-charcoal font-body text-sm">${pd(order.total).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
