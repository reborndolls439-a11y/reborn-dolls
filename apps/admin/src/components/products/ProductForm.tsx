"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Plus, X, Upload, ArrowLeft } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { cn } from "@reborn/ui";

interface Category { id: string; name: string; slug: string; }

interface ProductImage { id?: string; url: string; alt?: string; isPrimary?: boolean; }

interface ProductFormData {
  name: string; description: string; shortDescription: string;
  price: string; salePrice: string; sku: string;
  categoryId: string; status: string; badge: string;
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
  categoryId: "", status: "DRAFT", badge: "",
  isFeatured: false, isNewArrival: true,
  stockQuantity: "0", lowStockThreshold: "5",
  materials: "", dimensions: "", weight: "",
  whatsIncluded: "", careInstructions: "",
  seoTitle: "", seoDescription: "",
  tags: "", images: [],
};

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData> & { images?: ProductImage[] };
  categories: Category[];
}

export function ProductForm({ productId, initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "seo">("basic");

  const set = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setCheck = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.checked }));

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, { url: imageUrl.trim(), isPrimary: f.images.length === 0 }] }));
    setImageUrl("");
  };

  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

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
        <h1 className="font-heading text-lg font-bold text-charcoal flex-1">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
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
            className={cn("px-4 py-3 text-sm font-medium font-body border-b-2 transition-colors", activeTab === tab.id ? "border-bloom-rose text-bloom-rose" : "border-transparent text-taupe hover:text-charcoal")}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <>
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Product Information</h2>
                <Input label="Product name" value={form.name} onChange={set("name")} required placeholder="e.g. Aurora Reborn Baby Girl" />
                <Input label="Short description" value={form.shortDescription} onChange={set("shortDescription")} placeholder="One-line summary shown on product cards" />
                <div>
                  <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Full description <span className="text-bloom-rose">*</span></label>
                  <textarea value={form.description} onChange={set("description")} rows={8} required
                    placeholder="Full product description. HTML is supported."
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y" />
                </div>
              </div>

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

              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
                <h2 className="font-heading text-sm font-semibold text-charcoal">Categorisation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Category</label>
                    <select value={form.categoryId} onChange={set("categoryId")} className="h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-full bg-white">
                      <option value="">No category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
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
                <Input label="Tags (comma-separated)" value={form.tags} onChange={set("tags")} placeholder="e.g. reborn, baby girl, featured" />
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
                <div className="flex gap-2">
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste an image URL (Cloudinary, Unsplash, etc.)"
                    className="flex-1 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
                  <button type="button" onClick={addImage} className="h-9 px-4 bg-bloom-rose text-white rounded-xl text-sm font-medium hover:bg-bloom-rose-600 transition-colors flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-soft-blush-100">
                          <img src={img.url} alt={img.alt || `Image ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }} />
                        </div>
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-bloom-rose text-white px-1.5 py-0.5 rounded-full font-body">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length === 0 && (
                  <div className="border-2 border-dashed border-charcoal-200 rounded-xl p-8 text-center">
                    <Upload className="w-8 h-8 text-taupe-300 mx-auto mb-2" />
                    <p className="text-sm text-taupe font-body">Paste image URLs above to add product images</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
              <h2 className="font-heading text-sm font-semibold text-charcoal">Specifications & Care</h2>
              <Input label="Materials" value={form.materials} onChange={set("materials")} placeholder="e.g. Vinyl, mohair, glass eyes, weighted body" />
              <Input label="Dimensions" value={form.dimensions} onChange={set("dimensions")} placeholder={`e.g. 19" length, 5 lbs weight`} />
              <Input label="Weight" value={form.weight} onChange={set("weight")} placeholder="e.g. 5 lbs" />
              <div>
                <label className="block text-sm font-medium text-charcoal font-body mb-1.5">What's included</label>
                <textarea value={form.whatsIncluded} onChange={set("whatsIncluded")} rows={3} placeholder="e.g. Doll, outfit, blanket, certificate of authenticity"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Care instructions</label>
                <textarea value={form.careInstructions} onChange={set("careInstructions")} rows={3} placeholder="e.g. Spot clean only. Keep away from direct sunlight."
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
              </div>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
              <h2 className="font-heading text-sm font-semibold text-charcoal">Search Engine Optimisation</h2>
              <Input label="SEO title" value={form.seoTitle} onChange={set("seoTitle")} placeholder="Leave blank to use product name" hint="Recommended: 50–60 characters" />
              <div>
                <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Meta description</label>
                <textarea value={form.seoDescription} onChange={set("seoDescription")} rows={4} placeholder="Brief description for search engines and social sharing…"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
                <p className="mt-1 text-xs text-taupe font-body">{form.seoDescription.length}/160 characters — Recommended: 150–160</p>
              </div>

              {/* Preview */}
              {(form.seoTitle || form.name) && (
                <div className="bg-charcoal-50 rounded-xl p-4 mt-2">
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body mb-2">Search Preview</p>
                  <p className="text-blue-700 text-sm font-medium truncate">{form.seoTitle || form.name}</p>
                  <p className="text-green-700 text-xs">reborndolls.com › products › {form.name ? form.name.toLowerCase().replace(/\s+/g, "-") : "..."}</p>
                  <p className="text-charcoal-500 text-xs mt-0.5 line-clamp-2">{form.seoDescription || form.shortDescription || form.description.replace(/<[^>]+>/g, "").slice(0, 160)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
