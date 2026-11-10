"use client";

import React, { useState, useRef, useCallback } from "react";
import { Save, Sparkles, Loader2, Upload, X, ImageIcon, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface ContentState {
  about_title: string;
  about_subtitle: string;
  about_content: string;
  about_image: string;
  story_title: string;
  story_subtitle: string;
  story_content: string;
  story_image: string;
}

const DEFAULTS: ContentState = {
  about_title: "Where Every Detail Tells a Story",
  about_subtitle: "About UK Reborn Dolls",
  about_content: "<p>We're passionate collectors and lovers of fine craftsmanship, dedicated to bringing the most beautiful, lifelike collectible dolls directly to those who treasure them.</p>",
  about_image: "",
  story_title: "Where Every Detail Tells a Story",
  story_subtitle: "Our Craft",
  story_content: "<p>Each doll in our collection is the result of extraordinary skill, patience, and passion.</p>",
  story_image: "",
};

export function ContentEditor({ initialData }: { initialData?: Partial<ContentState> }) {
  const [content, setContent] = useState<ContentState>({ ...DEFAULTS, ...initialData });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState<string | null>(null);
  const aboutImgRef = useRef<HTMLInputElement>(null);
  const storyImgRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ContentState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setContent((c) => ({ ...c, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  // ─── AI Generate ─────────────────────────────────────────────────────────
  const generateAI = useCallback(async (field: string) => {
    setGenerating(field);
    const prompts: Record<string, string> = {
      about_content: `Write compelling HTML content for the About page of a UK reborn doll e-commerce store called "UK Reborn Dolls". 
Write 3-4 paragraphs using <p> tags. Cover: our passion for reborn doll artistry, working with skilled artists, commitment to quality, and customer care.
Maximum 1500 words. Return ONLY the HTML body content, no <html> or <body> tags.`,
      story_content: `Write HTML content for the "Our Craft" section of a UK reborn doll store homepage.
Write 2-3 short paragraphs using <p> tags about the artistry, hand-crafted detail, and emotional connection of reborn dolls.
Return ONLY the HTML content.`,
    };

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: "custom",
          context: { name: "UK Reborn Dolls" },
          customPrompt: prompts[field] || "",
          maxTokens: 2000,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setContent((c) => ({ ...c, [field]: data.result.trim() }));
      }
    } catch { /* ignore */ }
    finally { setGenerating(null); }
  }, []);

  // ─── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (field: "about_image" | "story_image", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingImg(field);
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
        body: JSON.stringify({ file: base64, folder: "reborn-dolls/content" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setContent((c) => ({ ...c, [field]: data.url }));
      }
    } catch { /* ignore */ }
    finally {
      setUploadingImg(null);
      const ref = field === "about_image" ? aboutImgRef : storyImgRef;
      if (ref.current) ref.current.value = "";
    }
  };

  const AIBtn = ({ field, label = "AI Generate" }: { field: string; label?: string }) => (
    <button
      type="button"
      onClick={() => generateAI(field)}
      disabled={generating === field}
      className="flex items-center gap-1 text-xs text-bloom-rose font-body hover:text-bloom-rose-600 disabled:opacity-40 transition-colors"
    >
      {generating === field ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {generating === field ? "Generating…" : label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ── ABOUT US PAGE ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bloom-rose" /> About Us Page Content
          </h2>
          {saved && <span className="flex items-center gap-1 text-xs text-green-600 font-body"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
        </div>

        <Input label="Section subtitle" value={content.about_subtitle} onChange={set("about_subtitle")} placeholder="About UK Reborn Dolls" />
        <Input label="Section title" value={content.about_title} onChange={set("about_title")} placeholder="Where Every Detail Tells a Story" />

        {/* About content + AI */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-charcoal font-body">Main Content (HTML, max 1500 words)</label>
            <AIBtn field="about_content" label="AI Write Content" />
          </div>
          <textarea
            value={content.about_content}
            onChange={set("about_content")}
            rows={10}
            placeholder="Write your About page content here. HTML is supported."
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y font-mono"
          />
          <p className="mt-1 text-xs text-taupe font-body">
            {content.about_content.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {/* About image upload */}
        <div>
          <label className="block text-sm font-medium text-charcoal font-body mb-1.5">About Page Image</label>
          <div className="flex items-start gap-4">
            {content.about_image ? (
              <div className="relative aspect-video w-48 rounded-xl overflow-hidden bg-soft-blush-100 group shrink-0">
                <img src={content.about_image} alt="About" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setContent((c) => ({ ...c, about_image: "" }))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => aboutImgRef.current?.click()} disabled={uploadingImg === "about_image"}
                className="w-48 aspect-video rounded-xl border-2 border-dashed border-charcoal-200 flex flex-col items-center justify-center gap-1 hover:border-bloom-rose transition-colors">
                {uploadingImg === "about_image" ? <Loader2 className="w-5 h-5 animate-spin text-bloom-rose" /> : <Upload className="w-5 h-5 text-taupe" />}
                <span className="text-xs text-taupe font-body">{uploadingImg === "about_image" ? "Uploading…" : "Upload"}</span>
              </button>
            )}
            <div className="flex-1">
              <input value={content.about_image} onChange={set("about_image")} placeholder="Or paste image URL"
                className="w-full h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
            </div>
            <input ref={aboutImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload("about_image", e)} />
          </div>
        </div>
      </div>

      {/* ── OUR STORY / CRAFT SECTION ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
        <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-bloom-rose" /> &quot;Our Craft&quot; Section Content
        </h2>

        <Input label="Section label" value={content.story_subtitle} onChange={set("story_subtitle")} placeholder="Our Craft" />
        <Input label="Section title" value={content.story_title} onChange={set("story_title")} placeholder="Where Every Detail Tells a Story" />

        {/* Story content + AI */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-charcoal font-body">Content (HTML)</label>
            <AIBtn field="story_content" label="AI Write Content" />
          </div>
          <textarea
            value={content.story_content}
            onChange={set("story_content")}
            rows={6}
            placeholder="Write the Our Craft section content here."
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-y font-mono"
          />
        </div>

        {/* Story image (optional) */}
        <div>
          <label className="block text-sm font-medium text-charcoal font-body mb-1.5">
            Story Image <span className="text-taupe font-normal text-xs">(optional)</span>
          </label>
          <div className="flex items-start gap-4">
            {content.story_image ? (
              <div className="relative aspect-video w-48 rounded-xl overflow-hidden bg-soft-blush-100 group shrink-0">
                <img src={content.story_image} alt="Story" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setContent((c) => ({ ...c, story_image: "" }))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => storyImgRef.current?.click()} disabled={uploadingImg === "story_image"}
                className="w-48 aspect-video rounded-xl border-2 border-dashed border-charcoal-200 flex flex-col items-center justify-center gap-1 hover:border-bloom-rose transition-colors">
                {uploadingImg === "story_image" ? <Loader2 className="w-5 h-5 animate-spin text-bloom-rose" /> : <Upload className="w-5 h-5 text-taupe" />}
                <span className="text-xs text-taupe font-body">{uploadingImg === "story_image" ? "Uploading…" : "Upload (optional)"}</span>
              </button>
            )}
            <div className="flex-1">
              <input value={content.story_image} onChange={set("story_image")} placeholder="Or paste image URL (optional)"
                className="w-full h-9 px-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
            </div>
            <input ref={storyImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload("story_image", e)} />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button variant="primary" loading={saving} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Save All Content
        </Button>
        {saved && <span className="text-sm text-green-600 font-body">Content saved ✓</span>}
      </div>
    </div>
  );
}
