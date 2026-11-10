"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, Store, Mail, Truck, ImageIcon, X, GripVertical, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface Settings {
  store_name: string; store_tagline: string; store_email: string;
  store_phone: string; free_shipping_threshold: string;
  default_shipping_cost: string; admin_email: string;
}

interface ProductOption {
  id: string; name: string; image: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    store_name: "Reborn Dolls", store_tagline: "Where Artistry Comes to Life.",
    store_email: "hello@reborndolls.com", store_phone: "",
    free_shipping_threshold: "150", default_shipping_cost: "9.99",
    admin_email: "admin@reborndolls.com",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hero product picker state
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [heroIds, setHeroIds] = useState<string[]>([]);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaved, setHeroSaved] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Load settings + products
  useEffect(() => {
    // Load store settings
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings((prev) => ({ ...prev, ...d.settings }));
          if (d.settings.hero_product_ids) {
            try { setHeroIds(JSON.parse(d.settings.hero_product_ids)); } catch { /* ignore */ }
          }
        }
      });

    // Load all published products for the picker
    fetch("/api/admin/products?status=PUBLISHED&limit=100")
      .then((r) => r.json())
      .then((d) => {
        const list = d.products || d.data || [];
        setProducts(list.map((p: { id: string; name: string; images?: { url: string }[] }) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0]?.url ?? null,
        })));
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const saveHeroIds = useCallback(async (ids: string[]) => {
    setHeroSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_product_ids: JSON.stringify(ids) }),
      });
      setHeroSaved(true);
      setTimeout(() => setHeroSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setHeroSaving(false); }
  }, []);

  const toggleHeroProduct = (id: string) => {
    setHeroIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (prev.length < 4) {
        next = [...prev, id];
      } else {
        // Replace the last slot
        next = [...prev.slice(0, 3), id];
      }
      return next;
    });
  };

  const removeHeroSlot = (id: string) => {
    setHeroIds((prev) => prev.filter((x) => x !== id));
  };

  const set = (k: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSettings((s) => ({ ...s, [k]: e.target.value }));

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Get selected product details in order
  const selectedProducts = heroIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as ProductOption[];

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Store Settings</h1>
      </div>

      <div className="p-6 max-w-2xl space-y-6">

        {/* ── HERO IMAGE PICKER ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-bloom-rose" /> Homepage Hero Images
            </h2>
            <div className="flex items-center gap-2">
              {heroSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-body">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              <Button
                size="sm"
                variant="primary"
                loading={heroSaving}
                onClick={() => saveHeroIds(heroIds)}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                disabled={heroIds.length === 0}
              >
                Save Hero
              </Button>
            </div>
          </div>

          <p className="text-xs text-taupe font-body">
            Select up to 4 products to display in the hero grid on the homepage. The first selected product will be the largest image.
          </p>

          {/* Selected slots */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => {
              const p = selectedProducts[i];
              return (
                <div key={i} className="relative group aspect-square">
                  {p ? (
                    <>
                      <div className="w-full h-full rounded-xl overflow-hidden border-2 border-bloom-rose bg-soft-blush-100">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-taupe" /></div>}
                      </div>
                      <button
                        onClick={() => removeHeroSlot(p.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-b-xl truncate font-body">
                        {p.name}
                      </div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-bloom-rose text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-xl border-2 border-dashed border-charcoal-200 flex flex-col items-center justify-center gap-1">
                      <span className="text-xs text-taupe font-body">{i + 1}</span>
                      <GripVertical className="w-3.5 h-3.5 text-charcoal-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Product search + picker */}
          <div>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products to add to hero…"
              className="w-full h-9 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose mb-2"
            />
            <div className="max-h-56 overflow-y-auto rounded-xl border border-charcoal-200 divide-y divide-charcoal-50">
              {filteredProducts.length === 0 && (
                <p className="text-xs text-taupe font-body p-3 text-center">No published products found.</p>
              )}
              {filteredProducts.map((p) => {
                const isSelected = heroIds.includes(p.id);
                const slot = heroIds.indexOf(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleHeroProduct(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-bloom-rose-50 hover:bg-bloom-rose-100"
                        : "hover:bg-charcoal-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-soft-blush-100 shrink-0">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        : <ImageIcon className="w-4 h-4 text-taupe m-auto" />}
                    </div>
                    <span className="text-sm font-body text-charcoal flex-1 truncate">{p.name}</span>
                    {isSelected && (
                      <span className="text-xs font-bold text-white bg-bloom-rose px-1.5 py-0.5 rounded-full shrink-0">
                        #{slot + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── STORE SETTINGS FORM ─────────────────────────────────────────── */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
              <Store className="w-4 h-4 text-bloom-rose" /> Store Identity
            </h2>
            <Input label="Store name" value={settings.store_name} onChange={set("store_name")} required />
            <Input label="Tagline" value={settings.store_tagline} onChange={set("store_tagline")} />
            <Input label="Contact email" type="email" value={settings.store_email} onChange={set("store_email")} />
            <Input label="Phone number" type="tel" value={settings.store_phone} onChange={set("store_phone")} />
          </div>

          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
              <Mail className="w-4 h-4 text-bloom-rose" /> Notifications
            </h2>
            <Input label="Admin notification email" type="email" value={settings.admin_email} onChange={set("admin_email")} hint="New orders and alerts will be sent here." />
          </div>

          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2">
              <Truck className="w-4 h-4 text-bloom-rose" /> Shipping
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Free shipping threshold (£)" type="number" value={settings.free_shipping_threshold} onChange={set("free_shipping_threshold")} />
              <Input label="Default shipping cost (£)" type="number" value={settings.default_shipping_cost} onChange={set("default_shipping_cost")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
            {saved && <span className="text-sm text-green-600 font-body">Settings saved ✓</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
