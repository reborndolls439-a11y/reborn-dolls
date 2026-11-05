import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { Badge } from "@reborn/ui";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTabs } from "@/components/product/ProductTabs";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Star } from "lucide-react";
import type { Product, ProductSummary } from "@reborn/types";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { name: true, shortDescription: true, seoTitle: true, seoDescription: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
  });
  if (!p) return { title: "Product Not Found" };
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.shortDescription || undefined,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

const badgeMap: Record<string, string> = {
  NEW: "new", FEATURED: "featured", SALE: "sale", LIMITED: "limited", SOLD_OUT: "sold-out",
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const raw = await prisma.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!raw) notFound();

  const product: Product & { averageRating: number | null; reviewCount: number } = {
    ...raw,
    price: parseDecimal(raw.price),
    salePrice: raw.salePrice ? parseDecimal(raw.salePrice) : null,
    status: raw.status,
    badge: raw.badge,
    tags: raw.tags,
    averageRating: raw.reviews.length
      ? raw.reviews.reduce((s: number, r: (typeof raw.reviews)[number]) => s + r.rating, 0) / raw.reviews.length
      : null,
    reviewCount: raw.reviews.length,
  };

  const relatedRaw = await prisma.product.findMany({
    where: { status: "PUBLISHED", categoryId: raw.categoryId ?? undefined, id: { not: raw.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, price: true, salePrice: true,
      badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
      images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });

  const related: ProductSummary[] = relatedRaw.map((p: (typeof relatedRaw)[number]) => ({
    id: p.id, name: p.name, slug: p.slug,
    price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
    stockQuantity: p.stockQuantity, primaryImage: p.images[0]?.url ?? null, category: p.category,
  }));

  return (
    <div className="min-h-screen bg-ivory">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-xs text-taupe font-body flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-bloom-rose transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-bloom-rose transition-colors">Shop</Link>
          {product.category && (
            <><span>/</span>
            <Link href={`/collections/${product.category.slug}`} className="hover:text-bloom-rose transition-colors">
              {product.category.name}
            </Link></>
          )}
          <span>/</span>
          <span className="text-charcoal line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:sticky lg:top-24 self-start">
            {product.badge && (
              <Badge variant={badgeMap[product.badge] as "new" | "featured" | "sale" | "limited" | "sold-out"} className="mb-3">
                {product.badge === "NEW" ? "New Arrival"
                  : product.badge === "FEATURED" ? "Featured"
                  : product.badge === "SALE" ? "On Sale"
                  : product.badge === "LIMITED" ? "Limited Edition"
                  : "Sold Out"}
              </Badge>
            )}
            {product.category && (
              <Link href={`/collections/${product.category.slug}`} className="text-xs text-taupe uppercase tracking-wider font-body hover:text-bloom-rose transition-colors block mb-2">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-heading text-display-sm text-charcoal mb-2">{product.name}</h1>

            {product.averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4"
                      fill={i < Math.round(product.averageRating!) ? "#C86B7A" : "none"}
                      stroke={i < Math.round(product.averageRating!) ? "#C86B7A" : "#8A7D76"} />
                  ))}
                </div>
                <span className="text-sm text-taupe font-body">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {product.shortDescription && (
              <p className="text-taupe font-body leading-relaxed mb-6">{product.shortDescription}</p>
            )}

            <ProductActions product={product} />
          </div>
        </div>

        {/* Interactive tabs — client component */}
        <ProductTabs
          product={product}
          reviews={raw.reviews.map((r: (typeof raw.reviews)[number]) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            isVerified: r.isVerified,
            user: { name: r.user.name },
          }))}
        />
      </div>

      {related.length > 0 && (
        <div className="bg-white py-16">
          <FeaturedProducts
            products={related}
            title="You May Also Like"
            subtitle="More pieces from our collection"
            viewAllHref="/shop"
            viewAllLabel="View All"
          />
        </div>
      )}
    </div>
  );
}
