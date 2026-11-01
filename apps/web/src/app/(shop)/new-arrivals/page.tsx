import { Metadata } from "next";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { ShopClient } from "@/components/shop/ShopClient";
import type { ProductSummary, PaginationMeta } from "@reborn/types";

export const metadata: Metadata = { title: "New Arrivals", description: "The latest additions to our curated reborn doll collection." };

export default async function NewArrivalsPage({ searchParams }: { searchParams: Promise<{ page?: string; sort?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 12;
  const where = { status: "PUBLISHED" as const, isNewArrival: true };
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy: [{ createdAt: "desc" }], skip: (page - 1) * limit, take: limit,
      select: { id: true, name: true, slug: true, price: true, salePrice: true, badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } } } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
  ]);
  const mapped: ProductSummary[] = products.map((p: (typeof products)[number]) => ({
    id: p.id, name: p.name, slug: p.slug, price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, stockQuantity: p.stockQuantity,
    primaryImage: p.images[0]?.url ?? null, category: p.category,
  }));
  const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 };
  return (
    <>
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Just In</p>
          <h1 className="font-heading text-display-sm text-charcoal">New Arrivals</h1>
        </div>
      </div>
      <ShopClient initialProducts={mapped} initialMeta={meta} categories={categories} initialFilters={{ new: "true" }} />
    </>
  );
}
