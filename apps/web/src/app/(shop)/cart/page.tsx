"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button, EmptyState } from "@reborn/ui";
import { useCartStore, useCartSubtotal, useCartItemCount } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 9.99;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = useCartSubtotal();
  const itemCount = useCartItemCount();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <EmptyState
            icon={<ShoppingBag />}
            title="Your cart is empty"
            description="Browse our collection and add something beautiful."
            action={<Link href="/shop"><Button variant="primary">Shop Now</Button></Link>}
            size="lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-display-sm text-charcoal mb-8">
          Shopping Cart <span className="text-taupe text-xl">({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-3xl p-5 border border-charcoal-100 flex gap-5">
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-soft-blush-100">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h2 className="font-heading text-base font-semibold text-charcoal hover:text-bloom-rose transition-colors line-clamp-2">{item.name}</h2>
                  </Link>
                  <p className="text-bloom-rose font-bold text-lg mt-1">{formatPrice(item.salePrice ?? item.price)}</p>
                  {item.salePrice && (
                    <p className="text-taupe text-sm line-through">{formatPrice(item.price)}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease" className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-soft-blush-50 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold font-body">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stockQuantity} aria-label="Increase" className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-soft-blush-50 transition-colors disabled:opacity-40">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-charcoal font-body">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</p>
                      <button onClick={() => removeItem(item.productId)} aria-label="Remove" className="text-taupe hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-charcoal-100 sticky top-24">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between text-taupe"><span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-taupe">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shippingCost)}</span>
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-bloom-rose bg-soft-blush-50 rounded-xl py-2.5 px-3 text-center">
                    Add <strong>{formatPrice(remaining)}</strong> more for free shipping
                  </p>
                )}
                <div className="border-t border-charcoal-100 pt-3 flex justify-between font-bold text-charcoal text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="mt-5 block">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/shop" className="block text-center mt-3 text-sm text-taupe hover:text-charcoal font-body transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
