import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { ShopClient } from "@/components/shop/ShopClient";
import type { ProductSummary, PaginationMeta } from "@reborn/types";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Collection Not Found" };
  return { title: cat.seoTitle || cat.name, description: cat.seoDescription || cat.description || undefined };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;
  const orderBy: Record<string, unknown>[] =
    sp.sort === "price-asc" ? [{ price: "asc" }] :
    sp.sort === "price-desc" ? [{ price: "desc" }] :
    [{ createdAt: "desc" }];

  const where = { status: "PUBLISHED" as const, OR: [{ categoryId: category.id }, { additionalCategories: { some: { id: category.id } } }] };

  const [products, total, allCategories] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true,
        badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
  ]);

  const mapped: ProductSummary[] = products.map((p: (typeof products)[number]) => ({
    id: p.id, name: p.name, slug: p.slug,
    price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
    stockQuantity: p.stockQuantity, primaryImage: p.images[0]?.url ?? null, category: p.category,
  }));

  const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 };

  return (
    <>
      <div className="relative bg-charcoal overflow-hidden">
        {category.image && (
          <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-white/60 font-body mb-4" aria-label="Breadcrumb">
            <span><a href="/" className="hover:text-white transition-colors">Home</a></span>
            <span className="mx-2">/</span>
            <span><a href="/shop" className="hover:text-white transition-colors">Shop</a></span>
            <span className="mx-2">/</span>
            <span className="text-white">{category.name}</span>
          </nav>
          <p className="text-xs font-semibold text-bloom-rose-300 uppercase tracking-widest font-body mb-2">Collection</p>
          <h1 className="font-heading text-display-sm text-white">{category.name}</h1>
          {category.description && <p className="text-white/70 font-body mt-3 max-w-xl">{category.description}</p>}
        </div>
      </div>
      <ShopClient
        initialProducts={mapped}
        initialMeta={meta}
        categories={allCategories}
        initialFilters={{ category: slug, ...(sp as Record<string, string>) }}
      />
    </>
  );
}
