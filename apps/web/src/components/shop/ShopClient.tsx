"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Grid3X3, LayoutList } from "lucide-react";
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

  const [filters, setFilters] = useState({
    category: initialFilters.category || "",
    badge: initialFilters.badge || "",
    minPrice: initialFilters.minPrice || "",
    maxPrice: initialFilters.maxPrice || "",
    inStock: initialFilters.inStock === "true",
    sort: initialFilters.sort || "newest",
  });
  const [page, setPage] = useState(Number(initialFilters.page) || 1);

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

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.badge) params.set("badge", filters.badge);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.inStock) params.set("inStock", "true");
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (page > 1) params.set("page", String(page));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    fetchProducts(filters, page);
  }, [filters, page]); // eslint-disable-line

  const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters({ category: "", badge: "", minPrice: "", maxPrice: "", inStock: false, sort: "newest" });
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.badge, filters.minPrice, filters.maxPrice, filters.inStock].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-taupe font-body">
            {loading ? "Loading…" : `${meta.total} product${meta.total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            onFilterChange={handleFilterChange}
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
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
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
