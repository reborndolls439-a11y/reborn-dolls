"use client";

import { useFormatPrice } from "@/hooks/useFormatPrice";

/**
 * Renders a price in the user's selected currency.
 * All amounts are stored in GBP and converted at render time.
 *
 * Usage: <Price amount={199.99} /> or <Price amount={price} className="..." />
 */
export function Price({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const { formatPrice } = useFormatPrice();
  return <span className={className}>{formatPrice(amount)}</span>;
}
