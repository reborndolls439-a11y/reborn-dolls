"use client";

import React, { useState, useEffect } from "react";
import { Save, Store, Mail, Truck } from "lucide-react";
import { Button, Input } from "@reborn/ui";

interface Settings { store_name: string; store_tagline: string; store_email: string; store_phone: string; free_shipping_threshold: string; default_shipping_cost: string; admin_email: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ store_name: "Reborn Dolls", store_tagline: "Where Artistry Comes to Life.", store_email: "hello@reborndolls.com", store_phone: "", free_shipping_threshold: "150", default_shipping_cost: "9.99", admin_email: "admin@reborndolls.com" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => setSettings((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Store Settings</h1>
      </div>
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Store identity */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2"><Store className="w-4 h-4 text-bloom-rose" /> Store Identity</h2>
            <Input label="Store name" value={settings.store_name} onChange={set("store_name")} required />
            <Input label="Tagline" value={settings.store_tagline} onChange={set("store_tagline")} />
            <Input label="Contact email" type="email" value={settings.store_email} onChange={set("store_email")} />
            <Input label="Phone number" type="tel" value={settings.store_phone} onChange={set("store_phone")} />
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2"><Mail className="w-4 h-4 text-bloom-rose" /> Notifications</h2>
            <Input label="Admin notification email" type="email" value={settings.admin_email} onChange={set("admin_email")} hint="New orders and alerts will be sent here." />
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2"><Truck className="w-4 h-4 text-bloom-rose" /> Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Free shipping threshold ($)" type="number" value={settings.free_shipping_threshold} onChange={set("free_shipping_threshold")} />
              <Input label="Default shipping cost ($)" type="number" value={settings.default_shipping_cost} onChange={set("default_shipping_cost")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="w-4 h-4" />}>Save Settings</Button>
            {saved && <span className="text-sm text-green-600 font-body">Settings saved ✓</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
