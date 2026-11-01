"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@reborn/ui";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "@/store/uiStore";
import type { ProductSummary } from "@reborn/types";

interface FeaturedProductsProps {
  products: ProductSummary[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function FeaturedProducts({
  products,
  title = "Featured Collection",
  subtitle = "Handpicked favourites from our curated range",
  viewAllHref = "/shop?badge=FEATURED",
  viewAllLabel = "View All Featured",
}: FeaturedProductsProps) {
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.primaryImage ?? null,
      slug: product.slug,
      quantity: 1,
      stockQuantity: product.stockQuantity,
    });
    toast.success("Added to cart", product.name);
  };

  const handleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    toggle(product);
    const wishlisted = isWishlisted(productId);
    toast.info(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      product.name
    );
  };

  if (!products.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">
              Featured
            </p>
            <h2 className="font-heading text-display-sm text-charcoal">{title}</h2>
            <p className="text-taupe font-body mt-2">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-2 text-sm text-bloom-rose font-medium hover:gap-3 transition-all font-body"
          >
            {viewAllLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.salePrice}
              badge={product.badge}
              image={product.primaryImage}
              category={product.category?.name}
              stockQuantity={product.stockQuantity}
              isWishlisted={isWishlisted(product.id)}
              onWishlistToggle={handleWishlist}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={viewAllHref}
            className="text-sm text-bloom-rose font-medium font-body"
          >
            {viewAllLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}
