import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Plus, Scissors } from "lucide-react";
import { ProductsTable } from "@/components/products/ProductsTable";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 20;
  const q = sp.q;

  const where: Record<string, unknown> = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
    : {};

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Serialise for the client component
  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: pd(p.price),
    stockQuantity: p.stockQuantity,
    status: p.status,
    image: p.images[0]?.url ?? null,
    categoryName: p.category?.name ?? null,
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Products" subtitle={`${total} total products`} />

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <form className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name or SKU…"
              className="h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-64"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-charcoal-100 text-charcoal text-sm font-body hover:bg-charcoal-200 transition-colors"
            >
              Search
            </button>
            {q && (
              <Link
                href="/products"
                className="h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body text-taupe hover:border-bloom-rose hover:text-bloom-rose transition-colors flex items-center"
              >
                Clear
              </Link>
            )}
          </form>

          <div className="flex gap-2">
            <Link
              href="/products/scraper"
              className="flex items-center gap-2 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-medium font-body text-charcoal hover:border-bloom-rose hover:text-bloom-rose transition-colors"
            >
              <Scissors className="w-4 h-4" /> Import
            </Link>
            <Link
              href="/products/new"
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-bloom-rose text-white text-sm font-medium font-body hover:bg-bloom-rose-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Table with selection + delete */}
        <ProductsTable products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm font-body text-taupe">
            <span>
              Page {page} of {totalPages} &middot; {total} products
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}${q ? `&q=${q}` : ""}`}
                  className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}${q ? `&q=${q}` : ""}`}
                  className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
