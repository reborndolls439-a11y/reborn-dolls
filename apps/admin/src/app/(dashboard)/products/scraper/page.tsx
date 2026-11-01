"use client";

import React, { useState } from "react";
import { Scissors, Search, Download, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface ScrapedProduct {
  title: string; description: string; price: string; images: string[];
  materials?: string; dimensions?: string; sourceUrl: string; selected: boolean;
}

export default function ScraperPage() {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("reborn-dolls");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(""); setResults([]); setImportStatus(null);
    try {
      const res = await fetch("/api/admin/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");
      setResults((data.products || []).map((p: Omit<ScrapedProduct, "selected">) => ({ ...p, selected: true })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scraping failed. Check the URL and try again.");
    } finally { setLoading(false); }
  };

  const handleImport = async () => {
    const selected = results.filter((p) => p.selected);
    if (!selected.length) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/scraper/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selected, category }),
      });
      const data = await res.json();
      setImportStatus({ success: data.imported || 0, failed: data.failed || 0 });
      setResults([]);
    } catch { setImportStatus({ success: 0, failed: selected.length }); }
    finally { setImporting(false); }
  };

  const toggleSelect = (i: number) => setResults((r) => r.map((p, idx) => idx === i ? { ...p, selected: !p.selected } : p));
  const selectAll = () => setResults((r) => r.map((p) => ({ ...p, selected: true })));
  const selectNone = () => setResults((r) => r.map((p) => ({ ...p, selected: false })));
  const selectedCount = results.filter((p) => p.selected).length;

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Import Products via Scraper</h1>
      </div>
      <div className="p-6 max-w-4xl">
        {/* Info banner */}
        <div className="bg-soft-blush-50 border border-bloom-rose-200 rounded-2xl p-4 mb-6 flex gap-3">
          <Scissors className="w-5 h-5 text-bloom-rose shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-charcoal font-body">Browserless-powered scraper</p>
            <p className="text-sm text-taupe font-body mt-0.5">Enter the URL of any product listing page. We'll extract product names, descriptions, prices, and images, then allow you to review and import selected items.</p>
          </div>
        </div>

        {/* Scrape form */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 mb-6">
          <form onSubmit={handleScrape} className="space-y-4">
            <Input
              label="Product listing URL"
              type="url"
              placeholder="https://example.com/category/reborn-dolls"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              hint="Enter the URL of a product listing or category page to scrape."
              required
            />
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Assign to Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-full bg-white">
                <option value="reborn-dolls">Reborn Dolls</option>
                <option value="silicone-dolls">Silicone Dolls</option>
                <option value="cuddle-babies">Cuddle Babies</option>
                <option value="doll-clothing">Doll Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="limited-edition">Limited Edition</option>
              </select>
            </div>
            <Button type="submit" variant="primary" loading={loading} leftIcon={loading ? undefined : <Search className="w-4 h-4" />}>
              {loading ? "Scraping…" : "Scrape Products"}
            </Button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        {/* Import success */}
        {importStatus && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-charcoal font-body">Import complete</p>
              <p className="text-sm text-taupe font-body">{importStatus.success} imported successfully{importStatus.failed > 0 ? `, ${importStatus.failed} failed` : ""}.</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl border border-charcoal-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
              <h2 className="font-heading text-base font-semibold text-charcoal">{results.length} products found</h2>
              <div className="flex items-center gap-3">
                <button onClick={selectAll} className="text-xs text-bloom-rose font-body hover:underline">Select all</button>
                <button onClick={selectNone} className="text-xs text-taupe font-body hover:underline">Select none</button>
                <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleImport} loading={importing} disabled={selectedCount === 0}>
                  Import {selectedCount > 0 ? `(${selectedCount})` : ""}
                </Button>
              </div>
            </div>
            <div className="divide-y divide-charcoal-50">
              {results.map((product, i) => (
                <div key={i} className="flex gap-4 p-4">
                  <input type="checkbox" checked={product.selected} onChange={() => toggleSelect(i)} className="mt-1 w-4 h-4 accent-bloom-rose shrink-0" />
                  {product.images[0] && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal font-body text-sm line-clamp-1">{product.title}</p>
                    <p className="text-xs text-taupe font-body mt-0.5 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {product.price && <span className="text-xs font-bold text-bloom-rose">{product.price}</span>}
                      <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-taupe hover:text-bloom-rose transition-colors">
                        <ExternalLink className="w-3 h-3" /> Source
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
