import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@reborn/ui";
import { Plus, Scissors } from "lucide-react";

function parseDecimalLocal(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 20;
  const q = sp.q;

  const where: Record<string, unknown> = q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      include: { images: { where: { isPrimary: true }, take: 1 }, category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const statusVariant: Record<string, string> = { PUBLISHED: "success", DRAFT: "warning", ARCHIVED: "default" };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Products" subtitle={`${total} total products`} />
      <div className="p-6">
        {/* Actions */}
        <div className="flex items-center justify-between mb-5">
          <form className="flex items-center gap-2">
            <input name="q" defaultValue={q} placeholder="Search products…" className="h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-64" />
          </form>
          <div className="flex gap-2">
            <Link href="/products/scraper" className="flex items-center gap-2 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-medium font-body text-charcoal hover:border-bloom-rose hover:text-bloom-rose transition-colors">
              <Scissors className="w-4 h-4" /> Import / Scrape
            </Link>
            <Link href="/products/new" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-bloom-rose text-white text-sm font-medium font-body hover:bg-bloom-rose-600 transition-colors">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                {["Product", "SKU", "Price", "Stock", "Status", "Category", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                        {p.images[0] && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-charcoal line-clamp-1 max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-taupe">{p.sku || "—"}</td>
                  <td className="px-5 py-3 font-semibold">${parseDecimalLocal(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stockQuantity === 0 ? "bg-red-100 text-red-600" : p.stockQuantity <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={(statusVariant[p.status] || "default") as "success" | "warning" | "default"}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-taupe">{p.category?.name || "—"}</td>
                  <td className="px-5 py-3">
                    <Link href={`/products/${p.id}/edit`} className="text-xs text-bloom-rose font-semibold hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-taupe">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between mt-4 text-sm font-body text-taupe">
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Previous</Link>}
              {page * limit < total && <Link href={`?page=${page + 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
