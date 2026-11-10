"use client";

import React from "react";
import { ProductCard, ProductCardSkeleton } from "@reborn/ui";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "@/store/uiStore";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { ProductSummary } from "@reborn/types";
import { EmptyState } from "@reborn/ui";
import { Search } from "lucide-react";

interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, loading = false, skeletonCount = 12 }: ProductGridProps) {
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { formatPrice } = useFormatPrice();

  const handleAddToCart = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    addItem({ productId: p.id, name: p.name, price: p.price, salePrice: p.salePrice, image: p.primaryImage ?? null, slug: p.slug, stockQuantity: p.stockQuantity });
    toast.success("Added to cart", p.name);
  };

  const handleWishlist = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const was = isWishlisted(productId);
    toggle(p);
    toast.info(was ? "Removed from wishlist" : "Added to wishlist", p.name);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={<Search />}
        title="No products found"
        description="Try adjusting your filters or search terms to find what you're looking for."
        size="md"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          priceFormatter={formatPrice}
          name={p.name}
          slug={p.slug}
          price={p.price}
          salePrice={p.salePrice}
          badge={p.badge}
          image={p.primaryImage}
          category={p.category?.name}
          stockQuantity={p.stockQuantity}
          isWishlisted={isWishlisted(p.id)}
          onWishlistToggle={handleWishlist}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
