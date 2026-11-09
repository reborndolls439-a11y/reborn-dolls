"use client";

import React, { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Drawer, Pagination } from "@reborn/ui";
import { FilterPanel } from "./FilterPanel";
import { ProductGrid } from "./ProductGrid";
import { api } from "@/lib/api";
import type { ProductSummary, PaginationMeta } from "@reborn/types";

interface Category { slug: string; name: string; }

interface ShopClientProps {
  initialProducts: ProductSummary[];
  initialMeta: PaginationMeta;
  categories: Category[];
  initialFilters: Record<string, string>;
}

export function ShopClient({ initialProducts, initialMeta, categories, initialFilters }: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Always read filter state from the URL — this is the single source of truth.
  // When the user navigates back, the URL still has the filters so state persists.
  const getFiltersFromUrl = useCallback(() => ({
    category: searchParams.get("category") || "",
    badge: searchParams.get("badge") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    inStock: searchParams.get("inStock") === "true",
    sort: searchParams.get("sort") || "newest",
  }), [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromUrl);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Sync filter state when URL changes (e.g. back button)
  useEffect(() => {
    setFilters(getFiltersFromUrl());
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams, getFiltersFromUrl]);

  const fetchProducts = useCallback(async (f: typeof filters, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: p, limit: 12,
        ...(f.category && { category: f.category }),
        ...(f.badge && { badge: f.badge }),
        ...(f.minPrice && { minPrice: f.minPrice }),
        ...(f.maxPrice && { maxPrice: f.maxPrice }),
        ...(f.inStock && { inStock: "true" }),
        sort: f.sort,
      };
      const data = await api.get<{ data: ProductSummary[]; meta: PaginationMeta }>("/products", params);
      setProducts(data.data);
      setMeta(data.meta);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // Whenever URL params change, fetch new products
  useEffect(() => {
    fetchProducts(getFiltersFromUrl(), Number(searchParams.get("page")) || 1);
  }, [searchParams]); // eslint-disable-line

  // Push a filter change to the URL — the effect above will then fetch
  const applyFilter = useCallback((key: keyof typeof filters, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    // Reset to page 1 on filter change (except sort)
    if (key !== "sort") params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const handlePageChange = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  const activeFilterCount = [filters.category, filters.badge, filters.minPrice, filters.maxPrice, filters.inStock].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-taupe font-body">
          {loading ? "Loading…" : `${meta.total} product${meta.total !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-3">
          {/* Active filter chips on mobile */}
          {filters.category && (
            <span className="hidden sm:flex items-center gap-1 text-xs bg-bloom-rose-50 text-bloom-rose border border-bloom-rose-200 px-2.5 py-1 rounded-full font-body">
              {categories.find(c => c.slug === filters.category)?.name || filters.category}
            </span>
          )}
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 h-9 px-4 rounded-full border border-charcoal-200 text-sm font-medium font-body hover:border-bloom-rose hover:text-bloom-rose transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-bloom-rose text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel
            filters={filters}
            onFilterChange={applyFilter}
            onClearAll={handleClearAll}
            categories={categories}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />
          {!loading && meta.totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" side="left">
        <div className="p-4">
          <FilterPanel
            filters={filters}
            onFilterChange={(k, v) => { applyFilter(k, v); setMobileFiltersOpen(false); }}
            onClearAll={() => { handleClearAll(); setMobileFiltersOpen(false); }}
            categories={categories}
          />
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="mt-6 w-full h-11 bg-bloom-rose text-white rounded-full text-sm font-semibold font-body"
          >
            Show {meta.total} results
          </button>
        </div>
      </Drawer>
    </div>
  );
}
