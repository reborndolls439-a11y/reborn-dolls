import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { Badge } from "@reborn/ui";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Star } from "lucide-react";
import type { Product, ProductSummary } from "@reborn/types";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug, status: "PUBLISHED" }, select: { name: true, shortDescription: true, seoTitle: true, seoDescription: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } });
  if (!p) return { title: "Product Not Found" };
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.shortDescription || undefined,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

const tabLabels = ["Description", "Specifications", "Care & Shipping", "Reviews"];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const raw = await prisma.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } },
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
    averageRating: raw.reviews.length ? raw.reviews.reduce((s, r) => s + r.rating, 0) / raw.reviews.length : null,
    reviewCount: raw.reviews.length,
  };

  const relatedRaw = await prisma.product.findMany({
    where: { status: "PUBLISHED", categoryId: raw.categoryId ?? undefined, id: { not: raw.id } },
    take: 4, orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, price: true, salePrice: true, badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true, images: { where: { isPrimary: true }, select: { url: true }, take: 1 }, category: { select: { name: true, slug: true } } },
  });
  const related: ProductSummary[] = relatedRaw.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, stockQuantity: p.stockQuantity,
    primaryImage: p.images[0]?.url ?? null, category: p.category,
  }));

  const badgeMap: Record<string, string> = { NEW: "new", FEATURED: "featured", SALE: "sale", LIMITED: "limited", SOLD_OUT: "sold-out" };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-xs text-taupe font-body flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-bloom-rose transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-bloom-rose transition-colors">Shop</Link>
          {product.category && (<><span>/</span><Link href={`/collections/${product.category.slug}`} className="hover:text-bloom-rose transition-colors">{product.category.name}</Link></>)}
          <span>/</span>
          <span className="text-charcoal line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Info + actions */}
          <div className="lg:sticky lg:top-24 self-start">
            {product.badge && (
              <Badge variant={badgeMap[product.badge] as "new" | "featured" | "sale" | "limited" | "sold-out"} className="mb-3">
                {product.badge === "NEW" ? "New Arrival" : product.badge === "FEATURED" ? "Featured" : product.badge === "SALE" ? "On Sale" : product.badge === "LIMITED" ? "Limited Edition" : "Sold Out"}
              </Badge>
            )}
            {product.category && (
              <Link href={`/collections/${product.category.slug}`} className="text-xs text-taupe uppercase tracking-wider font-body hover:text-bloom-rose transition-colors block mb-2">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-heading text-display-sm text-charcoal mb-2">{product.name}</h1>

            {/* Rating */}
            {product.averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill={i < Math.round(product.averageRating!) ? "#C86B7A" : "none"} stroke={i < Math.round(product.averageRating!) ? "#C86B7A" : "#8A7D76"} />
                  ))}
                </div>
                <span className="text-sm text-taupe font-body">{product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})</span>
              </div>
            )}

            {product.shortDescription && <p className="text-taupe font-body leading-relaxed mb-6">{product.shortDescription}</p>}

            <ProductActions product={product} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-charcoal-100 mb-8">
            <div className="flex gap-6 overflow-x-auto">
              {tabLabels.map((tab, i) => (
                <button key={tab} data-tab={i} className="pb-3 text-sm font-medium font-body border-b-2 whitespace-nowrap transition-colors border-bloom-rose text-bloom-rose first:border-bloom-rose [&:not(:first-child)]:border-transparent [&:not(:first-child)]:text-taupe hover:text-bloom-rose">
                  {tab} {tab === "Reviews" && product.reviewCount > 0 ? `(${product.reviewCount})` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-taupe font-body leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {/* Specs */}
              {(product.materials || product.dimensions || product.weight || product.whatsIncluded) && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Specifications</h2>
                  <dl className="space-y-3">
                    {[
                      { label: "Materials", value: product.materials },
                      { label: "Dimensions", value: product.dimensions },
                      { label: "Weight", value: product.weight },
                      { label: "What's Included", value: product.whatsIncluded },
                    ].filter((i) => i.value).map((item) => (
                      <div key={item.label} className="flex gap-4">
                        <dt className="w-32 shrink-0 text-sm font-semibold text-charcoal font-body">{item.label}</dt>
                        <dd className="text-sm text-taupe font-body">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Care & Shipping */}
              {product.careInstructions && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Care & Shipping</h2>
                  <p className="text-sm text-taupe font-body leading-relaxed mb-4">{product.careInstructions}</p>
                  <div className="bg-soft-blush-50 rounded-2xl p-5 space-y-2">
                    <p className="text-sm font-semibold text-charcoal font-body">Shipping</p>
                    <p className="text-sm text-taupe font-body">Free shipping on orders over $150. Standard delivery 5–10 business days. We take extra care packaging every order.</p>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {raw.reviews.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-charcoal mb-6">Customer Reviews</h2>
                  <div className="space-y-6">
                    {raw.reviews.map((review: (typeof raw.reviews)[number]) => (
                      <div key={review.id} className="border-b border-charcoal-50 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-charcoal font-body">{review.user.name || "Verified Customer"}</p>
                            {review.isVerified && <span className="text-xs text-sage font-body">Verified purchase</span>}
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5" fill={i < review.rating ? "#C86B7A" : "none"} stroke={i < review.rating ? "#C86B7A" : "#8A7D76"} />
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="text-sm font-semibold text-charcoal font-body mb-1">{review.title}</p>}
                        <p className="text-sm text-taupe font-body leading-relaxed">{review.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar quick info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-charcoal-100 space-y-4">
                <h3 className="text-sm font-semibold text-charcoal font-body">Quick Info</h3>
                {product.sku && <div className="flex justify-between text-sm font-body"><span className="text-taupe">SKU</span><span className="text-charcoal">{product.sku}</span></div>}
                {product.category && <div className="flex justify-between text-sm font-body"><span className="text-taupe">Category</span><Link href={`/collections/${product.category.slug}`} className="text-bloom-rose hover:underline">{product.category.name}</Link></div>}
                {product.tags?.length > 0 && (
                  <div>
                    <p className="text-sm text-taupe font-body mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-soft-blush-100 text-taupe px-2.5 py-1 rounded-full font-body">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-bloom-rose-50 rounded-2xl p-5 border border-bloom-rose-200">
                <p className="text-sm font-semibold text-charcoal font-body mb-2">Need help choosing?</p>
                <p className="text-xs text-taupe font-body mb-3">Contact us and we'll help you find the perfect piece.</p>
                <Link href="/contact" className="text-xs text-bloom-rose font-semibold font-body hover:underline">Get in touch →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="bg-white py-16">
          <FeaturedProducts products={related} title="You May Also Like" subtitle="More pieces from our collection" viewAllHref="/shop" viewAllLabel="View All" />
        </div>
      )}
    </div>
  );
}
