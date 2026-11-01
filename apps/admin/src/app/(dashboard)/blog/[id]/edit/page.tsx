"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", featuredImage: "",
    status: "DRAFT", tags: "", seoTitle: "", seoDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.post;
        setForm({
          title: p.title || "",
          excerpt: p.excerpt || "",
          content: p.content || "",
          featuredImage: p.featuredImage || "",
          status: p.status || "DRAFT",
          tags: (p.tags || []).join(", "),
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
        setLoading(false);
      });
  }, [id]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed."); return; }
      router.push("/blog");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    router.push("/blog");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-taupe font-body">Loading…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6 shrink-0">
        <button type="button" onClick={() => router.push("/blog")} className="text-taupe hover:text-charcoal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-bold text-charcoal flex-1">Edit Article</h1>
        <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium font-body hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
        <select value={form.status} onChange={set("status")} className="h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose bg-white">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-5">
          {/* Main fields */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <Input label="Title" value={form.title} onChange={set("title")} required placeholder="Article title" />
            <Input label="Excerpt" value={form.excerpt} onChange={set("excerpt")} placeholder="Brief summary shown on blog listings" />
            <Input label="Featured image URL" value={form.featuredImage} onChange={set("featuredImage")} placeholder="https://…" />
            {form.featuredImage && (
              <div className="aspect-video rounded-xl overflow-hidden bg-soft-blush-100 max-w-sm">
                <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
            <Input label="Tags (comma-separated)" value={form.tags} onChange={set("tags")} placeholder="e.g. care guide, collecting, tips" />
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
            <label className="block text-sm font-medium text-charcoal font-body mb-1.5">
              Content <span className="text-bloom-rose">*</span>
              <span className="ml-2 text-xs text-taupe font-normal">(HTML supported)</span>
            </label>
            <textarea
              value={form.content}
              onChange={set("content")}
              rows={20}
              required
              placeholder="Write your article content here…"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y font-mono"
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-sm font-semibold text-charcoal">SEO</h2>
            <Input label="SEO title (optional)" value={form.seoTitle} onChange={set("seoTitle")} placeholder="Defaults to article title" hint="Recommended: 50–60 characters" />
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Meta description (optional)</label>
              <textarea value={form.seoDescription} onChange={set("seoDescription")} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none"
                placeholder="Brief description for search engines…" />
              <p className="mt-1 text-xs text-taupe font-body">{form.seoDescription.length}/160</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
