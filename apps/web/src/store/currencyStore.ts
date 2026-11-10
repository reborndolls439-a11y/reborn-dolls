import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "GBP" | "USD" | "EUR";

interface CurrencyStore {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

// Exchange rates (approximate — update periodically)
export const RATES: Record<Currency, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
};

export const SYMBOLS: Record<Currency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: "GBP",
      setCurrency: (c) => set({ currency: c }),
    }),
    { name: "reborn-currency" }
  )
);

// Convert from GBP base price to selected currency
export function convertFromGBP(gbpPrice: number, target: Currency): number {
  return gbpPrice * RATES[target];
}
