import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@reborn/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Computed
  itemCount: number;
  subtotal: number;

  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, item) => {
          const price = item.salePrice ?? item.price;
          return sum + price * item.quantity;
        }, 0);
      },

      addItem: (incoming) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === incoming.productId);
        const qty = incoming.quantity ?? 1;

        if (existing) {
          const newQty = Math.min(
            existing.quantity + qty,
            incoming.stockQuantity
          );
          set({
            items: items.map((i) =>
              i.productId === incoming.productId
                ? { ...i, quantity: newQty }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [...items, { ...incoming, quantity: qty }],
            isOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "reborn-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
