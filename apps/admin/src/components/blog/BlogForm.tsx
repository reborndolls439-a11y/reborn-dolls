"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Trash2, Sparkles, Loader2, Upload } from "lucide-react";
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

  const set = (k: keyof BlogFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // ─── AI Generate ────────────────────────────────────────────────────────────
  const generateAI = useCallback(async (field: AIField) => {
    if (!form.title.trim()) { alert("Enter a blog post title first."); return; }
    setGenerating(field);
    setError("");
    try {
      const prompts: Record<AIField, string> = {
        excerpt: `Write a 1–2 sentence blog post excerpt (max 160 characters) for a reborn doll collecting blog post titled "${form.title}". Make it engaging and click-worthy. Return ONLY the excerpt text.`,

        content: `Write a full, well-structured HTML blog post for a premium reborn doll e-commerce store. 
Title: "${form.title}"
${form.excerpt ? `Excerpt: ${form.excerpt}` : ""}
${form.tags ? `Tags/topics: ${form.tags}` : ""}

Write 4–6 paragraphs using <h2> for sections and <p> for paragraphs. Include practical advice or storytelling relevant to reborn doll collectors. 
Return ONLY the HTML content (no <html> or <body> tags).`,

        seoTitle: `Write an SEO title (50–60 characters) for a blog post titled "${form.title}" on a reborn doll store called "Reborn Dolls". Return ONLY the title string.`,

        seoDescription: `Write an SEO meta description (around 155 characters) for a blog post titled "${form.title}".
${form.excerpt ? `Post excerpt: ${form.excerpt}` : ""}
Return ONLY the meta description string.`,

        tags: `Generate 6–10 relevant tags (comma-separated, lowercase) for a reborn doll blog post titled "${form.title}".
${form.excerpt ? `Excerpt: ${form.excerpt}` : ""}
Return ONLY the comma-separated tags.`,
      };

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompts[field] }],
          temperature: 0.7,
          max_tokens: field === "content" ? 2000 : 400,
        }),
      });

      // Use the admin's server-side route to avoid exposing API keys
      const serverRes = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: "custom",
          context: { name: form.title, description: form.excerpt },
          customPrompt: prompts[field],
          maxTokens: field === "content" ? 2000 : 400,
        }),
      });

      if (!serverRes.ok) {
        const data = await serverRes.json();
        setError(data.error || "AI generation failed.");
        return;
      }
      const data = await serverRes.json();
      if (data.result) setForm((f) => ({ ...f, [field]: data.result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setGenerating(null);
    }
  }, [form]);

  // ─── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingImage(true);
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
      if (res.ok && data.url) setForm((f) => ({ ...f, featuredImage: data.url }));
    } catch { /* ignore */ }
    finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const url = isEdit ? `/api/admin/blog/${postId}` : "/api/admin/blog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed."); return; }
      router.push("/blog");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
    router.push("/blog");
  };

  // ─── AI button helper ────────────────────────────────────────────────────────
  const AIBtn = ({ field, label = "AI Generate" }: { field: AIField; label?: string }) => (
    <button
      type="button"
      onClick={() => generateAI(field)}
      disabled={generating === field || !form.title}
      className="flex items-center gap-1 text-xs text-bloom-rose font-body hover:text-bloom-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      title={form.title ? `Generate with AI` : "Enter a title first"}
    >
      {generating === field
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <Sparkles className="w-3 h-3" />}
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
          {isEdit ? "Save Changes" : "Save"}
        </Button>
      </div>

      {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body">{error}</div>}

      {/* AI hint */}
      <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 bg-bloom-rose-50 border border-bloom-rose-200 rounded-xl">
        <Sparkles className="w-4 h-4 text-bloom-rose shrink-0" />
        <p className="text-xs text-taupe font-body">Enter a title, then use the <span className="text-bloom-rose font-semibold">AI Generate</span> buttons to auto-fill fields.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-5">

          {/* Main fields */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">

            <Input label="Title" value={form.title} onChange={set("title")} required placeholder="Article title" />

            {/* Excerpt + AI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-charcoal font-body">Excerpt</label>
                <AIBtn field="excerpt" />
              </div>
              <textarea value={form.excerpt} onChange={set("excerpt")} rows={2} placeholder="Brief summary shown on blog listings"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
            </div>

            {/* Featured image */}
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Featured Image</label>
              <div className="flex gap-2 mb-2">
                <input value={form.featuredImage} onChange={set("featuredImage")} placeholder="https://... or upload below"
                  className="flex-1 h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImage}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body text-charcoal hover:border-bloom-rose hover:text-bloom-rose transition-colors disabled:opacity-50">
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              {form.featuredImage && (
                <div className="aspect-video rounded-xl overflow-hidden bg-soft-blush-100 max-w-sm">
                  <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
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
            <textarea value={form.content} onChange={set("content")} rows={18} required
              placeholder="Write your article content here. HTML is supported."
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
