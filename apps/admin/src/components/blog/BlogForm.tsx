"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Trash2, Sparkles, Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface BlogFormData {
  title: string; excerpt: string; content: string;
  featuredImage: string; status: string; tags: string;
  seoTitle: string; seoDescription: string;
}

interface BlogFormProps {
  postId?: string;
  initialData?: Partial<BlogFormData>;
}

type AIField = "excerpt" | "content" | "seoTitle" | "seoDescription" | "tags";

const EMPTY: BlogFormData = {
  title: "", excerpt: "", content: "", featuredImage: "",
  status: "DRAFT", tags: "", seoTitle: "", seoDescription: "",
};

export function BlogForm({ postId, initialData }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!postId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BlogFormData>({ ...EMPTY, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState<AIField | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = (k: keyof BlogFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // ─── Featured image upload from device ──────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("Image must be under 10MB."); return; }

    setUploadingImage(true);
    setUploadError("");

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
        body: JSON.stringify({ file: base64, folder: "reborn-dolls/blog" }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setForm((f) => ({ ...f, featuredImage: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = () => setForm((f) => ({ ...f, featuredImage: "" }));

  // ─── AI Generate ────────────────────────────────────────────────────────────
  const generateAI = useCallback(async (field: AIField) => {
    if (!form.title.trim()) { alert("Enter a blog post title first."); return; }
    setGenerating(field);
    setError("");

    const prompts: Record<AIField, string> = {
      excerpt: `Write a 1–2 sentence blog post excerpt (max 160 characters) for a reborn doll collecting blog post titled "${form.title}". Make it engaging and click-worthy. Return ONLY the excerpt text, nothing else.`,
      content: `Write a full, well-structured HTML blog post for a premium UK reborn doll e-commerce store.\nTitle: "${form.title}"\n${form.excerpt ? `Excerpt: ${form.excerpt}` : ""}\n${form.tags ? `Topics: ${form.tags}` : ""}\n\nWrite 4–6 paragraphs using <h2> for section headers and <p> for body text. Include practical advice relevant to reborn doll collectors in the UK.\nReturn ONLY the HTML body content, no <html>, <head> or <body> tags.`,
      seoTitle: `Write an SEO page title (50–60 characters) for a blog post titled "${form.title}" on a UK reborn doll store called "UK Reborn Dolls". Return ONLY the title string.`,
      seoDescription: `Write an SEO meta description (around 155 characters) for a blog post titled "${form.title}". ${form.excerpt ? `Excerpt: ${form.excerpt}` : ""} Return ONLY the meta description string.`,
      tags: `Generate 6–10 relevant comma-separated lowercase tags for a reborn doll blog post titled "${form.title}". ${form.excerpt ? `Excerpt: ${form.excerpt}` : ""} Return ONLY the comma-separated tags.`,
    };

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: "custom",
          context: { name: form.title },
          customPrompt: prompts[field],
          maxTokens: field === "content" ? 2000 : 400,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "AI generation failed."); return; }
      if (data.result) setForm((f) => ({ ...f, [field]: data.result.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setGenerating(null);
    }
  }, [form.title, form.excerpt, form.tags]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content is required."); return; }
    setSaving(true); setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featuredImage: form.featuredImage || null,
      excerpt: form.excerpt || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };

    try {
      const url = isEdit ? `/api/admin/blog/${postId}` : "/api/admin/blog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed."); return; }
      router.push("/blog");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
    router.push("/blog");
  };

  // ─── AI button ───────────────────────────────────────────────────────────────
  const AIBtn = ({ field, label = "AI Generate" }: { field: AIField; label?: string }) => (
    <button
      type="button"
      onClick={() => generateAI(field)}
      disabled={generating === field || !form.title}
      className="flex items-center gap-1 text-xs text-bloom-rose font-body hover:text-bloom-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      title={!form.title ? "Enter a title first" : `Generate with AI`}
    >
      {generating === field ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {generating === field ? "Generating…" : label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-3 px-6 shrink-0">
        <button type="button" onClick={() => router.push("/blog")} className="text-taupe hover:text-charcoal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-bold text-charcoal flex-1">{isEdit ? "Edit Article" : "New Article"}</h1>
        {isEdit && (
          <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium font-body hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}
        <select value={form.status} onChange={set("status")} className="h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose bg-white">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
          {isEdit ? "Save Changes" : "Publish"}
        </Button>
      </div>

      {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body">{error}</div>}

      {/* AI hint */}
      <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 bg-bloom-rose-50 border border-bloom-rose-200 rounded-xl">
        <Sparkles className="w-4 h-4 text-bloom-rose shrink-0" />
        <p className="text-xs text-taupe font-body">Enter a title, then click <span className="text-bloom-rose font-semibold">AI Generate</span> to auto-fill any field.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-5">

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <Input label="Title" value={form.title} onChange={set("title")} required placeholder="Article title" />

            {/* Excerpt + AI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-charcoal font-body">Excerpt</label>
                <AIBtn field="excerpt" />
              </div>
              <textarea value={form.excerpt} onChange={set("excerpt")} rows={2}
                placeholder="Brief summary shown on blog listings"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
            </div>

            {/* Featured image — device upload ONLY */}
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Featured Image</label>
              {form.featuredImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-soft-blush-100 max-w-sm group">
                  <img src={form.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/90 text-charcoal text-sm font-body hover:bg-white transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Change
                    </button>
                    <button type="button" onClick={removeImage}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-500 text-white text-sm font-body hover:bg-red-600 transition-colors">
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImage}
                  className="w-full max-w-sm flex flex-col items-center justify-center gap-2 h-36 border-2 border-dashed border-charcoal-200 rounded-xl hover:border-bloom-rose hover:bg-bloom-rose-50/20 transition-colors text-taupe disabled:opacity-50">
                  {uploadingImage
                    ? <><Loader2 className="w-6 h-6 animate-spin text-bloom-rose" /><span className="text-sm font-body">Uploading…</span></>
                    : <><div className="w-10 h-10 rounded-full bg-bloom-rose-50 flex items-center justify-center"><Upload className="w-5 h-5 text-bloom-rose" /></div>
                       <span className="text-sm font-body">Click to upload featured image</span>
                       <span className="text-xs text-taupe font-body">PNG, JPG, WebP up to 10MB</span></>}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploadError && <p className="mt-1.5 text-xs text-red-600 font-body">{uploadError}</p>}
            </div>

            {/* Tags + AI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-charcoal font-body">Tags (comma-separated)</label>
                <AIBtn field="tags" />
              </div>
              <input value={form.tags} onChange={set("tags")} placeholder="e.g. care guide, collecting, tips"
                className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
            </div>
          </div>

          {/* Content + AI */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-charcoal font-body">
                Content <span className="text-bloom-rose">*</span>
                <span className="ml-2 text-xs text-taupe font-normal">(HTML supported)</span>
              </label>
              <AIBtn field="content" label="AI Write Full Article" />
            </div>
            <textarea value={form.content} onChange={set("content")} rows={20} required
              placeholder="Write your article content here. HTML tags like <h2>, <p>, <ul>, <strong> are supported."
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y font-mono" />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-sm font-semibold text-charcoal">SEO</h2>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-charcoal font-body">SEO title</label>
                <AIBtn field="seoTitle" />
              </div>
              <input value={form.seoTitle} onChange={set("seoTitle")} placeholder="Defaults to article title"
                className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
              <p className="mt-1 text-xs text-taupe font-body">{form.seoTitle.length}/60 chars</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-charcoal font-body">Meta description</label>
                <AIBtn field="seoDescription" />
              </div>
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
