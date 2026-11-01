import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@reborn/types";

interface WishlistItem {
  productId: string;
  product: ProductSummary;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: ProductSummary) => void;
  removeItem: (productId: string) => void;
  toggle: (product: ProductSummary) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const already = get().items.some((i) => i.productId === product.id);
        if (!already) {
          set({
            items: [
              ...get().items,
              { productId: product.id, product, addedAt: new Date().toISOString() },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      toggle: (product) => {
        const store = get();
        if (store.isWishlisted(product.id)) {
          store.removeItem(product.id);
        } else {
          store.addItem(product);
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "reborn-wishlist",
    }
  )
);
