"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Save, X, Upload, Image as ImageIcon } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", slug: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "reborn-dolls/categories" }),
        });
        const data = await res.json();
        if (data.url) {
          setForm((f) => ({ ...f, image: data.url }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const url = editing ? `/api/admin/categories/${editing}` : "/api/admin/categories";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setAdding(false); setEditing(null); setForm({ name: "", description: "", slug: "", image: "" });
    load(); setSaving(false);
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || "", slug: cat.slug, image: cat.image || "" });
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditing(null); setAdding(false);
    setForm({ name: "", description: "", slug: "", image: "" });
  };

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Categories</h1>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => { setAdding(true); setEditing(null); setForm({ name: "", description: "", slug: "", image: "" }); }}
        >
          Add Category
        </Button>
      </div>

      <div className="p-6 max-w-2xl space-y-3">
        {/* Add/Edit form */}
        {(adding || editing) && (
          <div className="bg-bloom-rose-50 border border-bloom-rose-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-charcoal">
              {editing ? "Edit Category" : "New Category"}
            </h3>

            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
              required
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              hint="Auto-generated from name"
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">
                Cover Image
              </label>

              {/* Preview */}
              {form.image ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-soft-blush-100 mb-2 group">
                  <img src={form.image} alt="Category cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* File upload button */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center gap-1.5 h-32 border-2 border-dashed border-charcoal-200 rounded-xl hover:border-bloom-rose hover:bg-bloom-rose-50/30 transition-colors text-taupe disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-bloom-rose border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-body">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span className="text-xs font-body">Upload from device</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* URL paste */}
              <div className="flex gap-2 mt-2">
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="or paste an image URL"
                  className="flex-1 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose"
                />
                {!form.image && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="h-9 px-4 bg-charcoal-100 text-charcoal rounded-xl text-sm font-medium hover:bg-charcoal-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" /> Browse
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="primary" leftIcon={<Save className="w-3.5 h-3.5" />} loading={saving} onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" leftIcon={<X className="w-3.5 h-3.5" />} onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl border border-charcoal-100 divide-y divide-charcoal-50">
          {loading && <div className="py-10 text-center text-sm text-taupe font-body">Loading…</div>}
          {!loading && categories.length === 0 && (
            <div className="py-10 text-center text-sm text-taupe font-body">No categories yet.</div>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-taupe-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal font-body">{cat.name}</p>
                <p className="text-xs text-taupe font-body">
                  /collections/{cat.slug}
                  {cat._count ? ` · ${cat._count.products} products` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(cat)}
                  className="w-8 h-8 rounded-lg border border-charcoal-200 flex items-center justify-center text-taupe hover:text-bloom-rose hover:border-bloom-rose transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
