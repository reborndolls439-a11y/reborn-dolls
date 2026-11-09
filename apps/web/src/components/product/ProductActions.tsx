"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart, Share2, Minus, Plus } from "lucide-react";
import { Button, Badge } from "@reborn/ui";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "@/store/uiStore";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@reborn/types";

interface ProductActionsProps {
  product: Product & { averageRating?: number | null; reviewCount?: number };
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const isSoldOut = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discount = product.salePrice ? getDiscountPercentage(product.price, product.salePrice) : null;
  const effectivePrice = product.salePrice ?? product.price;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem({ productId: product.id, name: product.name, price: product.price, salePrice: product.salePrice, image: product.images[0]?.url ?? null, slug: product.slug, quantity, stockQuantity: product.stockQuantity });
    toast.success("Added to cart!", `${quantity}× ${product.name}`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/cart";
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="font-heading text-3xl font-bold text-charcoal">
          {formatPrice(effectivePrice)}
        </span>
        {product.salePrice && (
          <>
            <span className="text-xl text-taupe line-through font-body">{formatPrice(product.price)}</span>
            <Badge variant="sale">-{discount}%</Badge>
          </>
        )}
      </div>

      {/* Stock status */}
      {isSoldOut ? (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-charcoal-300" />
          <span className="text-sm text-taupe font-body">Currently out of stock</span>
        </div>
      ) : isLowStock ? (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-sm text-amber-700 font-body font-medium">Only {product.stockQuantity} left, order soon</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-sm text-green-700 font-body">In stock and ready to ship</span>
        </div>
      )}

      {/* Quantity */}
      {!isSoldOut && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-charcoal font-body">Quantity</span>
          <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-soft-blush-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold font-body">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-soft-blush-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          leftIcon={<ShoppingCart className="w-5 h-5" />}
          onClick={handleAddToCart}
          disabled={isSoldOut}
        >
          {isSoldOut ? "Out of Stock" : "Add to Cart"}
        </Button>
        {!isSoldOut && (
          <Button variant="outline" size="lg" className="flex-1" onClick={handleBuyNow}>
            Buy Now
          </Button>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => { toggle({ id: product.id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice, badge: product.badge, isFeatured: product.isFeatured, isNewArrival: product.isNewArrival, stockQuantity: product.stockQuantity, primaryImage: product.images[0]?.url ?? null, category: product.category }); toast.info(wishlisted ? "Removed from wishlist" : "Saved to wishlist"); }}
          className={cn("flex items-center gap-2 text-sm font-medium font-body transition-colors", wishlisted ? "text-bloom-rose" : "text-taupe hover:text-bloom-rose")}
        >
          <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          {wishlisted ? "Saved" : "Save to Wishlist"}
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-taupe hover:text-charcoal font-body transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Trust micro-copy */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-charcoal-100">
        {[
          { icon: "🚚", text: "Free shipping over $150" },
          { icon: "🔒", text: "Secure checkout" },
          { icon: "📦", text: "Premium packaging" },
          { icon: "↩️", text: "30-day returns" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            <span className="text-base">{item.icon}</span>
            <span className="text-xs text-taupe font-body">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
