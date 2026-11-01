import { create } from "zustand";
import type { ToastItem } from "@reborn/ui";

interface UIStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Quick view
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { ...toast, id }] });
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),

  quickViewProductId: null,
  setQuickViewProductId: (id) => set({ quickViewProductId: id }),
}));

// Convenience toast helper — import this anywhere
export const toast = {
  success: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "info", title, message }),
};
