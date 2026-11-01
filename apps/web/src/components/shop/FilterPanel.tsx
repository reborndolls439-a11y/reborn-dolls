"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  category: string;
  badge: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sort: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | boolean) => void;
  onClearAll: () => void;
  categories: { slug: string; name: string }[];
  className?: string;
}

const badges = [
  { value: "", label: "All" },
  { value: "NEW", label: "New Arrivals" },
  { value: "FEATURED", label: "Featured" },
  { value: "SALE", label: "On Sale" },
  { value: "LIMITED", label: "Limited Edition" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-charcoal-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-charcoal font-body">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-taupe" />
        ) : (
          <ChevronDown className="w-4 h-4 text-taupe" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  categories,
  className,
}: FilterPanelProps) {
  const hasActiveFilters =
    filters.category ||
    filters.badge ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock;

  return (
    <aside className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-charcoal" />
          <h3 className="text-sm font-semibold text-charcoal font-body">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-bloom-rose hover:underline font-body"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Sort (mobile + desktop) */}
      <Section title="Sort By">
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sort === opt.value}
                onChange={() => onFilterChange("sort", opt.value)}
                className="w-4 h-4 accent-bloom-rose"
              />
              <span className="text-sm text-charcoal font-body group-hover:text-bloom-rose transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Category */}
      {categories.length > 0 && (
        <Section title="Category">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value=""
                checked={filters.category === ""}
                onChange={() => onFilterChange("category", "")}
                className="w-4 h-4 accent-bloom-rose"
              />
              <span className="text-sm text-charcoal font-body group-hover:text-bloom-rose transition-colors">
                All Categories
              </span>
            </label>
            {categories.map((cat) => (
              <label
                key={cat.slug}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={filters.category === cat.slug}
                  onChange={() => onFilterChange("category", cat.slug)}
                  className="w-4 h-4 accent-bloom-rose"
                />
                <span className="text-sm text-charcoal font-body group-hover:text-bloom-rose transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Badge */}
      <Section title="Product Type">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <button
              key={badge.value}
              onClick={() => onFilterChange("badge", badge.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium font-body border transition-all",
                filters.badge === badge.value
                  ? "bg-bloom-rose text-white border-bloom-rose"
                  : "border-charcoal-200 text-charcoal hover:border-bloom-rose hover:text-bloom-rose"
              )}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Price range */}
      <Section title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
            placeholder="Min $"
            min="0"
            className="w-full h-9 px-3 text-sm rounded-lg border border-charcoal-200 font-body focus:outline-none focus:border-bloom-rose"
          />
          <span className="text-taupe">—</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            placeholder="Max $"
            min="0"
            className="w-full h-9 px-3 text-sm rounded-lg border border-charcoal-200 font-body focus:outline-none focus:border-bloom-rose"
          />
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange("inStock", e.target.checked)}
            className="w-4 h-4 accent-bloom-rose rounded"
          />
          <span className="text-sm text-charcoal font-body">In Stock Only</span>
        </label>
      </Section>
    </aside>
  );
}
