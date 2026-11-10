"use client";

import { useCurrencyStore, type Currency } from "@/store/currencyStore";

const CURRENCIES: { code: Currency; label: string; flag: string }[] = [
  { code: "GBP", label: "GBP", flag: "🇬🇧" },
  { code: "USD", label: "USD", flag: "🇺🇸" },
  { code: "EUR", label: "EUR", flag: "🇪🇺" },
];

export function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div className={`flex items-center gap-0.5 rounded-full p-0.5 ${className}`} style={{ background: "var(--surface)" }}>
      {CURRENCIES.map((c) => (
        <button
          key={c.code}
          onClick={() => setCurrency(c.code)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-medium transition-all ${
            currency === c.code
              ? "text-[var(--primary-text)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
          style={currency === c.code ? { background: "var(--primary)" } : {}}
          aria-label={`Switch to ${c.label}`}
        >
          <span className="text-[10px]">{c.flag}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
