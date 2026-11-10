"use client";

import { useCurrencyStore, RATES, type Currency } from "@/store/currencyStore";

/**
 * Returns a formatPrice function that converts from GBP base price
 * to the user's selected currency.
 */
export function useFormatPrice() {
  const currency = useCurrencyStore((s) => s.currency);

  const formatPrice = (gbpAmount: number): string => {
    const converted = gbpAmount * RATES[currency];
    const locale = currency === "USD" ? "en-US" : currency === "EUR" ? "de-DE" : "en-GB";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(converted);
  };

  return { formatPrice, currency };
}

/**
 * Returns the formatted free shipping threshold.
 * Pass the GBP threshold, returns formatted in user's currency.
 */
export function useFreeShippingThreshold(gbpThreshold: number): string {
  const { formatPrice } = useFormatPrice();
  return formatPrice(gbpThreshold);
}
