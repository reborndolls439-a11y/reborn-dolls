import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 20;
  const q = sp.q;
  const where: Record<string, unknown> = { role: "CUSTOMER" };
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];

  const [customers, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { _count: { select: { orders: true } } } }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="flex flex-col">
      <AdminHeader title="Customers" subtitle={`${total} total customers`} />
      <div className="p-6 space-y-4">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search by name or email…" className="h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-64" />
        </form>

        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                {["Customer", "Email", "Orders", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bloom-rose-100 flex items-center justify-center shrink-0">
                        <span className="text-bloom-rose text-xs font-semibold">{(c.name || c.email).charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-charcoal">{c.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-taupe">{c.email}</td>
                  <td className="px-5 py-3.5 text-taupe">{c._count.orders}</td>
                  <td className="px-5 py-3.5 text-taupe">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(c.createdAt))}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/customers/${c.id}`} className="text-xs text-bloom-rose font-semibold hover:underline">View</Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-taupe">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div className="flex items-center justify-between text-sm font-body text-taupe">
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose transition-colors">Previous</Link>}
              {page * limit < total && <Link href={`?page=${page + 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose transition-colors">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
