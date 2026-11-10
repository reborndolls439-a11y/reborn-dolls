"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Button, EmptyState } from "@reborn/ui";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/uiStore";
import { useFormatPrice } from "@/hooks/useFormatPrice";
export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { formatPrice } = useFormatPrice();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-charcoal">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <EmptyState icon={<Heart />} title="Your wishlist is empty" description="Save pieces you love and come back to them anytime."
            action={<Link href="/shop"><Button variant="primary" size="sm">Browse Collection</Button></Link>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const p = item.product;
            return (
              <div key={item.productId} className="bg-white rounded-2xl border border-charcoal-100 p-4 flex gap-4">
                <Link href={`/products/${p.slug}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-soft-blush-100">
                    {p.primaryImage && <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${p.slug}`}>
                    <p className="text-sm font-semibold text-charcoal font-body hover:text-bloom-rose transition-colors line-clamp-2">{p.name}</p>
                  </Link>
                  <p className="text-sm font-bold text-bloom-rose mt-1">{formatPrice(p.salePrice ?? p.price)}</p>
                  {p.stockQuantity === 0 && <p className="text-xs text-taupe font-body">Out of stock</p>}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => moveToCart(item.productId)} disabled={p.stockQuantity === 0} className="flex items-center gap-1 text-xs text-bloom-rose font-semibold font-body hover:underline disabled:opacity-40">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="flex items-center gap-1 text-xs text-taupe font-body hover:text-red-500 transition-colors ml-2">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
