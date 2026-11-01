import { Metadata } from "next";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { ShopClient } from "@/components/shop/ShopClient";
import type { ProductSummary, PaginationMeta } from "@reborn/types";

interface Props { searchParams: Promise<{ q?: string; page?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: "${q}"` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = 12;

  if (!q?.trim()) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="font-heading text-display-sm text-charcoal mb-3">Search Products</h1>
          <p className="text-taupe font-body">Use the search bar above to find exactly what you're looking for.</p>
        </div>
      </div>
    );
  }

  const where = {
    status: "PUBLISHED" as const,
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { shortDescription: { contains: q, mode: "insensitive" as const } },
      { tags: { has: q.toLowerCase() } },
    ],
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: { id: true, name: true, slug: true, price: true, salePrice: true, badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 }, category: { select: { name: true, slug: true } } } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
  ]);

  const mapped: ProductSummary[] = products.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, stockQuantity: p.stockQuantity,
    primaryImage: p.images[0]?.url ?? null, category: p.category,
  }));
  const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 };

  return (
    <>
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">
            {total > 0 ? `${total} result${total !== 1 ? "s" : ""} for` : "No results for"} <span className="text-bloom-rose italic">"{q}"</span>
          </h1>
        </div>
      </div>
      <ShopClient initialProducts={mapped} initialMeta={meta} categories={categories} initialFilters={{}} />
    </>
  );
}
