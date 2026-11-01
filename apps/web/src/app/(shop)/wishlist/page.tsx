"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button, EmptyState } from "@reborn/ui";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/store/uiStore";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const moveToCart = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    const p = item.product;
    addItem({ productId: p.id, name: p.name, price: p.price, salePrice: p.salePrice, image: p.primaryImage ?? null, slug: p.slug, stockQuantity: p.stockQuantity });
    removeItem(productId);
    toast.success("Moved to cart", p.name);
  };

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-display-sm text-charcoal mb-8">
          My Wishlist <span className="text-taupe text-xl">({items.length} item{items.length !== 1 ? "s" : ""})</span>
        </h1>

        {items.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title="Your wishlist is empty"
            description="Save products you love and come back to them anytime."
            action={<Link href="/shop"><Button variant="primary">Browse Collection</Button></Link>}
            size="lg"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const p = item.product;
              return (
                <div key={item.productId} className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:shadow-card transition-shadow">
                  <Link href={`/products/${p.slug}`} className="block aspect-square overflow-hidden bg-soft-blush-100">
                    {p.primaryImage && <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="font-heading text-sm font-semibold text-charcoal hover:text-bloom-rose transition-colors line-clamp-2 mb-1">{p.name}</h3>
                    </Link>
                    <p className="text-bloom-rose font-bold">{formatPrice(p.salePrice ?? p.price)}</p>
                    {p.stockQuantity === 0 && <p className="text-xs text-taupe font-body mt-1">Out of stock</p>}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="primary" className="flex-1" leftIcon={<ShoppingCart className="w-3.5 h-3.5" />} disabled={p.stockQuantity === 0} onClick={() => moveToCart(item.productId)}>
                        Add to Cart
                      </Button>
                      <button onClick={() => removeItem(item.productId)} className="w-9 h-9 rounded-full border border-charcoal-200 flex items-center justify-center text-taupe hover:text-red-500 hover:border-red-300 transition-colors" aria-label="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
