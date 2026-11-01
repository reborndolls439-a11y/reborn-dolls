import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@reborn/ui";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

const statusOpts = ["", "PENDING", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const statusLabels: Record<string, string> = { "": "All", PENDING: "Pending", PAYMENT_CONFIRMED: "Confirmed", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled", REFUNDED: "Refunded" };
const statusVariant: Record<string, string> = { PENDING: "warning", PAYMENT_CONFIRMED: "info", PROCESSING: "info", SHIPPED: "success", DELIVERED: "success", CANCELLED: "error", REFUNDED: "default" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; q?: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 20;
  const status = sp.status;
  const q = sp.q;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) where.OR = [{ orderNumber: { contains: q, mode: "insensitive" } }, { guestEmail: { contains: q, mode: "insensitive" } }, { guestName: { contains: q, mode: "insensitive" } }];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { shippingAddress: true, user: { select: { name: true, email: true } }, items: { select: { id: true } } } }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="flex flex-col">
      <AdminHeader title="Orders" subtitle={`${total} total orders`} />
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search order #, email…" className="h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-56" />
            {status && <input type="hidden" name="status" value={status} />}
          </form>
          <div className="flex flex-wrap gap-2">
            {statusOpts.map((s) => (
              <Link key={s} href={`?${s ? `status=${s}` : ""}${q ? `&q=${q}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium font-body border transition-colors ${(status || "") === s ? "bg-bloom-rose text-white border-bloom-rose" : "border-charcoal-200 text-charcoal hover:border-bloom-rose hover:text-bloom-rose"}`}>
                {statusLabels[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                {["Order", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {orders.map((order) => {
                const customerName = order.user?.name || order.guestName || "Guest";
                const customerEmail = order.user?.email || order.guestEmail || "";
                return (
                  <tr key={order.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-charcoal">#{order.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-charcoal">{customerName}</p>
                      <p className="text-xs text-taupe">{customerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-taupe">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(order.createdAt))}</td>
                    <td className="px-5 py-3.5 text-taupe">{order.items.length}</td>
                    <td className="px-5 py-3.5 font-bold text-charcoal">${pd(order.total).toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={(statusVariant[order.status] || "default") as "success" | "warning" | "info" | "error" | "default"}>{statusLabels[order.status] || order.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/orders/${order.id}`} className="text-xs text-bloom-rose font-semibold hover:underline">Manage</Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-taupe">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div className="flex items-center justify-between text-sm font-body text-taupe">
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Previous</Link>}
              {page * limit < total && <Link href={`?page=${page + 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
