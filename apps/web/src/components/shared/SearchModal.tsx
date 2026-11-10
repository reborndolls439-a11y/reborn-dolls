"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { Modal } from "@reborn/ui";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { api } from "@/lib/api";
interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  primaryImage?: string | null;
  category?: { name: string } | null;
}
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}
const RECENT_KEY = "reborn_recent_searches";
export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
        setRecentSearches(stored);
      } catch { /* ignore */ }
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.get<{ products: SearchResult[] }>("/search", { q, limit: "6" });
      setResults(data.products);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);
  const handleSelect = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
    onClose();
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) handleSelect(query.trim());
  };
  return (
    <Modal open={open} onClose={onClose} size="lg" showClose={false} className="!rounded-3xl">
      <div className="-m-6">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-charcoal-100">
          <Search className="w-5 h-5 text-taupe shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dolls, accessories…"
            className="flex-1 bg-transparent text-charcoal placeholder-taupe text-base font-body focus:outline-none"
            aria-label="Search products"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-taupe hover:text-charcoal transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close search" className="text-taupe hover:text-charcoal transition-colors ml-1">
            <span className="text-xs font-body border border-charcoal-200 rounded px-1.5 py-0.5">ESC</span>
          </button>
        </form>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-skeleton">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-100 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-charcoal-100 rounded w-3/4" />
                    <div className="h-3 bg-charcoal-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Results */}
          {!loading && results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-taupe uppercase tracking-wider mb-3 font-body">Products</p>
              <div className="space-y-1">
                {results.map((product) => (
                  <a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => handleSelect(query)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft-blush-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                      {product.primaryImage && (
                        <img src={product.primaryImage} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate font-body group-hover:text-bloom-rose transition-colors">{product.name}</p>
                      {product.category && <p className="text-xs text-taupe font-body">{product.category.name}</p>}
                    </div>
                    <p className="text-sm font-semibold text-bloom-rose shrink-0">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </a>
                ))}
              </div>
              <a
                href={`/search?q=${encodeURIComponent(query)}`}
                className="flex items-center justify-center gap-2 mt-3 py-2.5 text-sm text-bloom-rose font-medium hover:underline font-body"
                onClick={onClose}
              >
                See all results for "{query}" <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
          {/* No results */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-charcoal font-medium font-body mb-1">No results for "{query}"</p>
              <p className="text-sm text-taupe font-body">Try different keywords or browse our collections.</p>
            </div>
          )}
          {/* Recent searches */}
          {!loading && query.length < 2 && recentSearches.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-taupe uppercase tracking-wider mb-3 font-body">Recent Searches</p>
              <div className="space-y-1">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-soft-blush-50 text-left transition-colors"
                  >
                    <Clock className="w-4 h-4 text-taupe shrink-0" />
                    <span className="text-sm text-charcoal font-body">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Empty state */}
          {!loading && query.length < 2 && recentSearches.length === 0 && (
            <div className="py-8 text-center">
              <Search className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
              <p className="text-sm text-taupe font-body">Start typing to search our collection</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
