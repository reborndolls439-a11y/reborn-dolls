"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X, Upload, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { cn } from "@reborn/ui";

interface Category { id: string; name: string; slug: string; }
interface ProductImage { id?: string; url: string; alt?: string; isPrimary?: boolean; }

interface ProductFormData {
  name: string; description: string; shortDescription: string;
  price: string; salePrice: string; sku: string;
  categoryId: string; additionalCategoryIds: string[];
  status: string; badge: string;
  isFeatured: boolean; isNewArrival: boolean;
  stockQuantity: string; lowStockThreshold: string;
  materials: string; dimensions: string; weight: string;
  whatsIncluded: string; careInstructions: string;
  seoTitle: string; seoDescription: string;
  tags: string; images: ProductImage[];
}

const EMPTY: ProductFormData = {
  name: "", description: "", shortDescription: "",
  price: "", salePrice: "", sku: "",
  categoryId: "", additionalCategoryIds: [], status: "DRAFT", badge: "",
  isFeatured: false, isNewArrival: true,
  stockQuantity: "0", lowStockThreshold: "5",
  materials: "", dimensions: "", weight: "",
  whatsIncluded: "", careInstructions: "",
  seoTitle: "", seoDescription: "",
  tags: "", images: [],
};

const STORAGE_KEY = "reborn_product_form_draft";

type AIField = "description" | "shortDescription" | "seoTitle" | "seoDescription" | "tags" | "materials" | "careInstructions" | "whatsIncluded";

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData> & { images?: ProductImage[] };
  categories: Category[];
}

export function ProductForm({ productId, initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>(() => {
    if (initialData) return { ...EMPTY, ...initialData };
    if (!productId && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...EMPTY, ...JSON.parse(saved) };
      } catch { /* ignore */ }
    }
    return EMPTY;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "seo">("basic");
  const [generating, setGenerating] = useState<AIField | null>(null);

  // Persist draft to localStorage
  useEffect(() => {
    if (!productId && typeof window !== "undefined") {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    }
  }, [form, productId]);

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  };

  const set = (k: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const setCheck = (k: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.checked }));

  // ─── AI Generate ──────────────────────────────────────────────────────────
  const generateAI = useCallback(async (field: AIField) => {
    if (!form.name.trim()) {
      alert("Please enter a product name first.");
      return;
    }
    setGenerating(field);
    try {
      const categoryName = categories.find((c) => c.id === form.categoryId)?.name || "";
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          context: {
            name: form.name,
            shortDescription: form.shortDescription,
            description: form.description.replace(/<[^>]*>/g, "").slice(0, 300),
            materials: form.materials,
            dimensions: form.dimensions,
            category: categoryName,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setForm((f) => ({ ...f, [field]: data.result }));
      }
    } catch { /* ignore */ }
    finally { setGenerating(null); }
  }, [form, categories]);

  // ─── AI button component ──────────────────────────────────────────────────
  const AIButton = ({ field, label = "Generate" }: { field: AIField; label?: string }) => (
    <button
      type="button"
      onClick={() => generateAI(field)}
      disabled={generating === field || !form.name}
      className="flex items-center gap-1 text-xs text-bloom-rose font-body hover:text-bloom-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      title={form.name ? `Generate ${label} with AI` : "Enter a product name first"}
    >
      {generating === field
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <Sparkles className="w-3 h-3" />}
      {generating === field ? "Generating…" : label}
    </button>
  );

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: ProductImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "reborn-dolls/products" }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push({ url: data.url, alt: file.name.replace(/\.[^/.]+$/, ""), isPrimary: form.images.length + uploaded.length === 0 });
        }
      } catch { /* skip */ }
    }
    if (uploaded.length > 0) setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, { url: imageUrl.trim(), isPrimary: f.images.length === 0 }] }));
    setImageUrl("");
  };

  const removeImage = (i: number) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  const setPrimary = (i: number) => setForm((f) => ({ ...f, images: f.images.map((img, idx) => ({ ...img, isPrimary: idx === i })) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price) { setError("Price is required."); return; }
    setSaving(true); setError("");
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    try {
      const url = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed."); return; }
      clearDraft();
      router.push("/products");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: "basic" as const, label: "Basic Info" },
    { id: "details" as const, label: "Details & Specs" },
    { id: "seo" as const, label: "SEO" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6 shrink-0">
        <button type="button" onClick={() => router.push("/products")} className="text-taupe hover:text-charcoal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-bold text-charcoal flex-1">{isEdit ? "Edit Product" : "New Product"}</h1>
        <div className="flex items-center gap-2">
          <select value={form.status} onChange={set("status")} className="h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose bg-white">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">{error}</div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-charcoal-100 px-6 flex gap-1 shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={cn("px-4 py-3 text-sm font-medium font-body border-b-2 transition-colors",
              activeTab === tab.id ? "border-bloom-rose text-bloom-rose" : "border-transparent text-taupe hover:text-charcoal")}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">

          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <>
              {/* Product Info */}
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Product Information</h2>

                <Input label="Product name" value={form.name} onChange={set("name")} required placeholder="e.g. Aurora Reborn Baby Girl" />

                {/* Short description + AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-charcoal font-body">Short description</label>
                    <AIButton field="shortDescription" label="AI Generate" />
                  </div>
                  <input
                    value={form.shortDescription}
                    onChange={set("shortDescription")}
                    placeholder="One-line summary shown on product cards"
                    className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose"
                  />
                </div>

                {/* Full description + AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-charcoal font-body">Full description <span className="text-bloom-rose">*</span></label>
                    <AIButton field="description" label="AI Generate" />
                  </div>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={8}
                    required
                    placeholder="Full product description. HTML is supported."
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y"
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Pricing & Inventory</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price ($)" type="number" step="0.01" min="0" value={form.price} onChange={set("price")} required placeholder="0.00" />
                  <Input label="Sale price ($)" type="number" step="0.01" min="0" value={form.salePrice} onChange={set("salePrice")} placeholder="Leave blank if not on sale" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" value={form.sku} onChange={set("sku")} placeholder="e.g. RD-AURORA-001" />
                  <Input label="Stock quantity" type="number" min="0" value={form.stockQuantity} onChange={set("stockQuantity")} required />
                </div>
                <Input label="Low stock alert threshold" type="number" min="0" value={form.lowStockThreshold} onChange={set("lowStockThreshold")} hint="You'll be alerted when stock falls below this number." />
              </div>

              {/* Categorisation */}
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Categorisation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Primary Category</label>
                    <select value={form.categoryId} onChange={set("categoryId")} className="h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-full bg-white">
                      <option value="">No primary category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-taupe font-body">Used for breadcrumbs and product card display.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Badge</label>
                    <select value={form.badge} onChange={set("badge")} className="h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-full bg-white">
                      <option value="">No badge</option>
                      <option value="NEW">New</option>
                      <option value="FEATURED">Featured</option>
                      <option value="SALE">Sale</option>
                      <option value="LIMITED">Limited Edition</option>
                      <option value="SOLD_OUT">Sold Out</option>
                    </select>
                  </div>
                </div>

                {/* Multi-category checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-charcoal font-body mb-1.5">
                    Also appears in
                    <span className="ml-1.5 text-xs text-taupe font-normal">(select all collections this product should appear in)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-charcoal-200 max-h-40 overflow-y-auto">
                    {categories.map((c) => {
                      const checked = form.additionalCategoryIds.includes(c.id);
                      return (
                        <label key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? "bg-bloom-rose-50 text-bloom-rose" : "hover:bg-charcoal-50 text-charcoal"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setForm((f) => ({
                                ...f,
                                additionalCategoryIds: e.target.checked
                                  ? [...f.additionalCategoryIds, c.id]
                                  : f.additionalCategoryIds.filter((id) => id !== c.id),
                              }));
                            }}
                            className="w-3.5 h-3.5 accent-bloom-rose"
                          />
                          <span className="text-sm font-body">{c.name}</span>
                        </label>
                      );
                    })}
                    {categories.length === 0 && (
                      <p className="text-xs text-taupe font-body col-span-full p-2">No categories yet.</p>
                    )}
                  </div>
                </div>

                {/* Tags + AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-charcoal font-body">Tags (comma-separated)</label>
                    <AIButton field="tags" label="AI Generate" />
                  </div>
                  <input
                    value={form.tags}
                    onChange={set("tags")}
                    placeholder="e.g. reborn, baby girl, featured, silicone"
                    className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={setCheck("isFeatured")} className="w-4 h-4 accent-bloom-rose rounded" />
                    <span className="text-sm font-body text-charcoal">Featured product</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.isNewArrival} onChange={setCheck("isNewArrival")} className="w-4 h-4 accent-bloom-rose rounded" />
                    <span className="text-sm font-body text-charcoal">New arrival</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Product Images</h2>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-2 h-36 border-2 border-dashed border-charcoal-200 rounded-xl hover:border-bloom-rose hover:bg-bloom-rose-50/30 transition-colors text-taupe disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-bloom-rose" /><span className="text-sm font-body">Uploading…</span></>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-bloom-rose-50 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-bloom-rose" />
                      </div>
                      <span className="text-sm font-body">Click to upload images from your device</span>
                      <span className="text-xs text-taupe font-body">Select multiple — PNG, JPG, WebP up to 10MB each</span>
                    </>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />

                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-soft-blush-100">
                          <img src={img.url} alt={img.alt || `Image ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                          <X className="w-3 h-3" />
                        </button>
                        {img.isPrimary ? (
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-bloom-rose text-white px-1.5 py-0.5 rounded-full font-body">Primary</span>
                        ) : (
                          <button type="button" onClick={() => setPrimary(i)}
                            className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full font-body opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bloom-rose" aria-label="Set as primary">
                            Set primary
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-charcoal-50">
                  <p className="text-xs text-taupe font-body mb-2">Or paste an image URL:</p>
                  <div className="flex gap-2">
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..."
                      className="flex-1 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
                    <button type="button" onClick={addImageUrl} className="h-9 px-4 bg-charcoal-100 text-charcoal rounded-xl text-sm font-medium hover:bg-charcoal-200 transition-colors flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add URL
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
              <h2 className="font-heading text-sm font-semibold text-charcoal">Specifications & Care</h2>

              {/* Materials + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-charcoal font-body">Materials</label>
                  <AIButton field="materials" label="AI Generate" />
                </div>
                <input value={form.materials} onChange={set("materials")} placeholder="e.g. Vinyl, mohair, glass eyes, weighted body"
                  className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
              </div>

              <Input label="Dimensions" value={form.dimensions} onChange={set("dimensions")} placeholder={`e.g. 19" length, 5 lbs weight`} />
              <Input label="Weight" value={form.weight} onChange={set("weight")} placeholder="e.g. 5 lbs" />

              {/* What's included + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-charcoal font-body">What&apos;s included</label>
                  <AIButton field="whatsIncluded" label="AI Generate" />
                </div>
                <textarea value={form.whatsIncluded} onChange={set("whatsIncluded")} rows={3}
                  placeholder="e.g. Doll, outfit, blanket, certificate of authenticity"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
              </div>

              {/* Care instructions + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-charcoal font-body">Care instructions</label>
                  <AIButton field="careInstructions" label="AI Generate" />
                </div>
                <textarea value={form.careInstructions} onChange={set("careInstructions")} rows={3}
                  placeholder="e.g. Spot clean only. Keep away from direct sunlight."
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
              </div>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
              <h2 className="font-heading text-sm font-semibold text-charcoal">Search Engine Optimisation</h2>

              {/* AI hint */}
              <div className="flex items-center gap-2 px-3 py-2 bg-bloom-rose-50 border border-bloom-rose-200 rounded-xl">
                <Sparkles className="w-4 h-4 text-bloom-rose shrink-0" />
                <p className="text-xs text-taupe font-body">Enter a product name on the Basic tab, then use the AI Generate buttons below to auto-fill SEO fields.</p>
              </div>

              {/* SEO Title + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-charcoal font-body">SEO title</label>
                  <AIButton field="seoTitle" label="AI Generate" />
                </div>
                <input value={form.seoTitle} onChange={set("seoTitle")} placeholder="Leave blank to use product name"
                  className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
                <p className="mt-1 text-xs text-taupe font-body">{form.seoTitle.length}/60 chars — Recommended: 50–60</p>
              </div>

              {/* Meta description + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-charcoal font-body">Meta description</label>
                  <AIButton field="seoDescription" label="AI Generate" />
                </div>
                <textarea value={form.seoDescription} onChange={set("seoDescription")} rows={4}
                  placeholder="Brief description for search engines and social sharing…"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
                <p className="mt-1 text-xs text-taupe font-body">{form.seoDescription.length}/160 chars — Recommended: 150–160</p>
              </div>

              {/* Search preview */}
              {(form.seoTitle || form.name) && (
                <div className="bg-charcoal-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body mb-2">Search Preview</p>
                  <p className="text-blue-700 text-sm font-medium truncate">{form.seoTitle || form.name}</p>
                  <p className="text-green-700 text-xs">reborndolls.com › products › {form.name ? form.name.toLowerCase().replace(/\s+/g, "-") : "..."}</p>
                  <p className="text-charcoal-500 text-xs mt-0.5 line-clamp-2">
                    {form.seoDescription || form.shortDescription || form.description.replace(/<[^>]+>/g, "").slice(0, 160)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
