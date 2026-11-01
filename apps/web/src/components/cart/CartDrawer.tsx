"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Drawer, Button, EmptyState } from "@reborn/ui";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();
  const FREE_SHIPPING = 150;
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title={`Cart ${itemCount > 0 ? `(${itemCount})` : ""}`}
      side="right"
      size="md"
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-body">
              <span className="text-taupe">Subtotal</span>
              <span className="font-semibold text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            {remaining > 0 && (
              <p className="text-xs text-center text-taupe font-body bg-soft-blush-50 rounded-lg py-2">
                Add <strong>{formatPrice(remaining)}</strong> more for free shipping
              </p>
            )}
            <Link href="/checkout" onClick={closeCart}>
              <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={closeCart} className="block text-center text-sm text-taupe hover:text-charcoal font-body transition-colors">
              View full cart
            </Link>
          </div>
        ) : null
      }
    >
      <div className="p-4 h-full">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart />}
            title="Your cart is empty"
            description="Add some beautiful pieces to your cart to get started."
            action={
              <Link href="/shop" onClick={closeCart}>
                <Button variant="primary" size="sm">Shop Now</Button>
              </Link>
            }
            size="md"
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <Link href={`/products/${item.slug}`} onClick={closeCart} className="shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-soft-blush-100">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} onClick={closeCart}>
                    <p className="text-sm font-semibold text-charcoal font-body leading-snug hover:text-bloom-rose transition-colors line-clamp-2">{item.name}</p>
                  </Link>
                  <p className="text-sm font-bold text-bloom-rose mt-1">{formatPrice(item.salePrice ?? item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-charcoal hover:bg-soft-blush-50" aria-label="Decrease">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold font-body">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stockQuantity} className="w-7 h-7 flex items-center justify-center text-charcoal hover:bg-soft-blush-50 disabled:opacity-30" aria-label="Increase">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-taupe hover:text-red-500 transition-colors" aria-label="Remove item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
