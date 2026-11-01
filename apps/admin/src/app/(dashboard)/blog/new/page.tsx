"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button, Input } from "@reborn/ui";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", featuredImage: "", status: "DRAFT", tags: "", seoTitle: "", seoDescription: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed."); return; }
      router.push("/blog");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6 shrink-0">
        <button type="button" onClick={() => router.push("/blog")} className="text-taupe hover:text-charcoal transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading text-lg font-bold text-charcoal flex-1">New Article</h1>
        <select value={form.status} onChange={set("status")} className="h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose bg-white">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save</Button>
      </div>
      {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body">{error}</div>}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-5">
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <Input label="Title" value={form.title} onChange={set("title")} required placeholder="Article title" />
            <Input label="Excerpt" value={form.excerpt} onChange={set("excerpt")} placeholder="Brief summary shown on blog listings" />
            <Input label="Featured image URL" value={form.featuredImage} onChange={set("featuredImage")} placeholder="https://..." />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={set("tags")} placeholder="e.g. care guide, collecting, tips" />
          </div>
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
            <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Content (HTML supported) <span className="text-bloom-rose">*</span></label>
            <textarea value={form.content} onChange={set("content")} rows={16} required placeholder="Write your article content here. HTML is supported."
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y" />
          </div>
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-sm font-semibold text-charcoal">SEO</h2>
            <Input label="SEO title (optional)" value={form.seoTitle} onChange={set("seoTitle")} />
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Meta description (optional)</label>
              <textarea value={form.seoDescription} onChange={set("seoDescription")} rows={3} className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
