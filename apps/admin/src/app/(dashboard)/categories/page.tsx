"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface Category { id: string; name: string; slug: string; description: string | null; isActive: boolean; _count?: { products: number } }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", slug: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => { setCategories(d.categories || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const url = editing ? `/api/admin/categories/${editing}` : "/api/admin/categories";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setAdding(false); setEditing(null); setForm({ name: "", description: "", slug: "" });
    load(); setSaving(false);
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || "", slug: cat.slug });
    setAdding(false);
  };

  const cancelEdit = () => { setEditing(null); setAdding(false); setForm({ name: "", description: "", slug: "" }); };

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Categories</h1>
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setAdding(true); setEditing(null); setForm({ name: "", description: "", slug: "" }); }}>
          Add Category
        </Button>
      </div>
      <div className="p-6 max-w-2xl space-y-3">
        {/* Add form */}
        {(adding || editing) && (
          <div className="bg-bloom-rose-50 border border-bloom-rose-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-charcoal">{editing ? "Edit Category" : "New Category"}</h3>
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint="Auto-generated from name" />
            <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" leftIcon={<Save className="w-3.5 h-3.5" />} loading={saving} onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" leftIcon={<X className="w-3.5 h-3.5" />} onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl border border-charcoal-100 divide-y divide-charcoal-50">
          {loading && <div className="py-10 text-center text-sm text-taupe font-body">Loading…</div>}
          {!loading && categories.length === 0 && <div className="py-10 text-center text-sm text-taupe font-body">No categories yet.</div>}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal font-body">{cat.name}</p>
                <p className="text-xs text-taupe font-body">/collections/{cat.slug} {cat._count ? `· ${cat._count.products} products` : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-lg border border-charcoal-200 flex items-center justify-center text-taupe hover:text-bloom-rose hover:border-bloom-rose transition-colors">
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
