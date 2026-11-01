import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@reborn/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "reborn-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
