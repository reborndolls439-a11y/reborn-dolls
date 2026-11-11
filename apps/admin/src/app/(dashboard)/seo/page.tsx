"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, ExternalLink, Pencil, X, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { AdminHeader } from "@/components/layout/AdminHeader";

const PAGE_KEYS = [
  { key: "home",    label: "Homepage", path: "/" },
  { key: "shop",    label: "Shop",     path: "/shop" },
  { key: "about",   label: "About",    path: "/about" },
  { key: "blog",    label: "Blog",     path: "/blog" },
  { key: "contact", label: "Contact",  path: "/contact" },
];

interface SeoSetting {
  id?: string;
  pageKey: string;
  title?: string | null;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
}

type EditForm = Omit<SeoSetting, "id">;

const EMPTY: Omit<EditForm, "pageKey"> = {
  title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", canonicalUrl: "",
};

export default function SEOPage() {
  const [settingsMap, setSettingsMap] = useState<Record<string, SeoSetting>>({});
  const [editing, setEditing]         = useState<string | null>(null);
  const [form, setForm]               = useState<EditForm>({ pageKey: "", ...EMPTY });
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://ukreborndolls.co.uk";

  const load = useCallback(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((d: { settings: SeoSetting[] }) => {
        const map: Record<string, SeoSetting> = {};
        d.settings.forEach((s) => { if (s.pageKey) map[s.pageKey] = s; });
        setSettingsMap(map);
      })
      .catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEditor = (pageKey: string) => {
    const existing = settingsMap[pageKey] || {};
    setForm({ pageKey, title: existing.title || "", description: existing.description || "", ogTitle: existing.ogTitle || "", ogDescription: existing.ogDescription || "", ogImage: existing.ogImage || "", canonicalUrl: existing.canonicalUrl || "" });
    setEditing(pageKey);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      load();
      setTimeout(() => { setEditing(null); setSaved(false); }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pageLabel = PAGE_KEYS.find((p) => p.key === editing)?.label || "";

  return (
    <div className="flex flex-col">
      <AdminHeader title="SEO Manager" subtitle="Manage page titles, descriptions, and metadata" />

      <div className="p-6 space-y-6 max-w-4xl">

        {/* Page SEO table */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">
            Page SEO Settings
          </h2>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">Page</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">SEO Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider hidden md:table-cell">Meta Description</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {PAGE_KEYS.map((page) => {
                const s = settingsMap[page.key];
                return (
                  <tr key={page.key} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-charcoal">{page.label}</p>
                      <div className="flex items-center gap-1 text-xs text-taupe">
                        <span>{page.path}</span>
                        <a href={`${storeUrl}${page.path}`} target="_blank" rel="noopener noreferrer" className="hover:text-bloom-rose transition-colors" aria-label="Preview">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-xs ${s?.title ? "text-charcoal" : "text-taupe italic"}`}>
                        {s?.title || "Using default"}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className={`text-xs line-clamp-2 max-w-xs ${s?.description ? "text-charcoal" : "text-taupe italic"}`}>
                        {s?.description || "Not set"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditor(page.key)}
                        className="inline-flex items-center gap-1 text-xs text-bloom-rose hover:underline font-body"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inline edit form — appears below the table when editing */}
        {editing && (
          <div className="bg-white rounded-2xl border border-bloom-rose/30 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
              <h3 className="font-heading text-base font-semibold text-charcoal">
                Editing SEO — {pageLabel}
              </h3>
              <button onClick={() => setEditing(null)} className="text-taupe hover:text-charcoal transition-colors" aria-label="Close editor">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Primary meta */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body">Primary Meta</p>
                <Input
                  label="SEO Title"
                  value={form.title || ""}
                  onChange={set("title")}
                  hint={`${(form.title || "").length}/60 characters`}
                />
                <div>
                  <label className="block text-sm font-medium text-charcoal-800 mb-1.5 font-body">Meta Description</label>
                  <textarea
                    value={form.description || ""}
                    onChange={set("description")}
                    rows={3}
                    placeholder="160 chars recommended…"
                    className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-body text-charcoal placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-bloom-rose/30 focus:border-bloom-rose resize-none"
                  />
                  <p className="mt-1 text-xs text-taupe font-body">{(form.description || "").length}/160 characters</p>
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-3 pt-3 border-t border-charcoal-100">
                <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body">Open Graph (Social Sharing)</p>
                <Input
                  label="OG Title"
                  value={form.ogTitle || ""}
                  onChange={set("ogTitle")}
                  hint="Defaults to SEO Title if blank"
                />
                <div>
                  <label className="block text-sm font-medium text-charcoal-800 mb-1.5 font-body">OG Description</label>
                  <textarea
                    value={form.ogDescription || ""}
                    onChange={set("ogDescription")}
                    rows={2}
                    placeholder="Defaults to meta description if blank…"
                    className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-body text-charcoal placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-bloom-rose/30 focus:border-bloom-rose resize-none"
                  />
                </div>
                <Input
                  label="OG Image URL"
                  value={form.ogImage || ""}
                  onChange={set("ogImage")}
                  hint="Recommended: 1200×630px"
                />
              </div>

              {/* Canonical */}
              <div className="space-y-3 pt-3 border-t border-charcoal-100">
                <p className="text-xs font-semibold text-taupe uppercase tracking-wider font-body">Advanced</p>
                <Input
                  label="Canonical URL"
                  value={form.canonicalUrl || ""}
                  onChange={set("canonicalUrl")}
                  hint="Leave blank to use the default page URL"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  leftIcon={saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  onClick={handleSave}
                >
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Technical SEO info */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-3">
          <h2 className="font-heading text-base font-semibold text-charcoal">Technical SEO</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sitemap",         value: "Auto-generated",          link: "/sitemap.xml" },
              { label: "Robots.txt",      value: "Auto-generated",          link: "/robots.txt" },
              { label: "Structured Data", value: "Product + Organization",  link: null },
              { label: "Canonical URLs",  value: "Enabled per page",        link: null },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">{item.label}</p>
                  <p className="text-xs text-taupe font-body">{item.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-body">OK</span>
                  {item.link && (
                    <a href={`${storeUrl}${item.link}`} target="_blank" rel="noopener noreferrer" className="text-taupe hover:text-bloom-rose transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
