"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import type { Product } from "@reborn/types";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  user: { name: string | null };
}

interface ProductTabsProps {
  product: Product & { averageRating?: number | null; reviewCount?: number };
  reviews: Review[];
}

const TABS = ["Description", "Specifications", "Care & Shipping", "Reviews"] as const;

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [active, setActive] = useState(0);

  const hasSpecs = !!(product.materials || product.dimensions || product.weight || product.whatsIncluded);
  const hasCare = !!product.careInstructions;
  const hasReviews = reviews.length > 0;

  return (
    <div className="mt-16">
      {/* Tab bar */}
      <div className="border-b border-charcoal-100 mb-8">
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(i)}
              className={`pb-3 text-sm font-medium font-body border-b-2 whitespace-nowrap transition-colors ${
                active === i
                  ? "border-bloom-rose text-bloom-rose"
                  : "border-transparent text-taupe hover:text-bloom-rose"
              }`}
            >
              {tab}
              {tab === "Reviews" && hasReviews ? ` (${reviews.length})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">

          {/* ── Description ── */}
          {active === 0 && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Description</h2>
              <div
                className="prose prose-sm max-w-none text-taupe font-body leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* ── Specifications ── */}
          {active === 1 && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Specifications</h2>
              {hasSpecs ? (
                <dl className="space-y-3">
                  {[
                    { label: "Materials", value: product.materials },
                    { label: "Dimensions", value: product.dimensions },
                    { label: "Weight", value: product.weight },
                    { label: "What&apos;s Included", value: product.whatsIncluded },
                  ]
                    .filter((i) => i.value)
                    .map((item) => (
                      <div key={item.label} className="flex gap-4 py-3 border-b border-charcoal-50 last:border-b-0">
                        <dt className="w-36 shrink-0 text-sm font-semibold text-charcoal font-body">{item.label}</dt>
                        <dd className="text-sm text-taupe font-body">{item.value}</dd>
                      </div>
                    ))}
                </dl>
              ) : (
                <p className="text-sm text-taupe font-body">No specifications provided for this product.</p>
              )}
            </div>
          )}

          {/* ── Care & Shipping ── */}
          {active === 2 && (
            <div className="space-y-6">
              {hasCare ? (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">Care Instructions</h2>
                  <p className="text-sm text-taupe font-body leading-relaxed">{product.careInstructions}</p>
                </div>
              ) : null}
              <div className="bg-soft-blush-50 rounded-2xl p-6 space-y-4">
                <h2 className="font-heading text-xl font-semibold text-charcoal">Shipping</h2>
                <div className="space-y-3">
                  {[
                    { icon: "🚚", title: "Free shipping over $150", desc: "Standard orders over $150 ship free worldwide." },
                    { icon: "📦", title: "Premium packaging", desc: "Every doll is wrapped in tissue paper and packed in a protective box." },
                    { icon: "⏱️", title: "Delivery time", desc: "Standard delivery 5–10 business days. Tracking provided." },
                    { icon: "↩️", title: "Returns", desc: "30-day returns on unused items in original packaging." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-charcoal font-body">{item.title}</p>
                        <p className="text-xs text-taupe font-body">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Reviews ── */}
          {active === 3 && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-charcoal mb-6">
                Customer Reviews
                {hasReviews && (
                  <span className="ml-2 text-sm font-normal text-taupe">
                    ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h2>
              {hasReviews ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-charcoal-50 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-charcoal font-body">
                            {review.user.name || "Verified Customer"}
                          </p>
                          {review.isVerified && (
                            <span className="text-xs text-green-600 font-body">Verified purchase</span>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5"
                              fill={i < review.rating ? "#C86B7A" : "none"}
                              stroke={i < review.rating ? "#C86B7A" : "#8A7D76"}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-sm font-semibold text-charcoal font-body mb-1">{review.title}</p>
                      )}
                      <p className="text-sm text-taupe font-body leading-relaxed">{review.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-taupe font-body">No reviews yet for this product.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar quick info (always visible) ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-charcoal-100 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal font-body">Quick Info</h3>
            {product.sku && (
              <div className="flex justify-between text-sm font-body">
                <span className="text-taupe">SKU</span>
                <span className="text-charcoal">{product.sku}</span>
              </div>
            )}
            {product.category && (
              <div className="flex justify-between text-sm font-body">
                <span className="text-taupe">Category</span>
                <a href={`/collections/${product.category.slug}`} className="text-bloom-rose hover:underline">
                  {product.category.name}
                </a>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="text-sm text-taupe font-body mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-soft-blush-100 text-taupe px-2.5 py-1 rounded-full font-body">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-bloom-rose-50 rounded-2xl p-5 border border-bloom-rose-200">
            <p className="text-sm font-semibold text-charcoal font-body mb-2">Need help choosing?</p>
            <p className="text-xs text-taupe font-body mb-3">
              Contact us and we&apos;ll help you find the perfect piece.
            </p>
            <a href="/contact" className="text-xs text-bloom-rose font-semibold font-body hover:underline">
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
