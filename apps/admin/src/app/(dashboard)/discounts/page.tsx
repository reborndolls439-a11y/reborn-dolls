"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button, Input, Badge } from "@reborn/ui";

interface Coupon { id: string; code: string; type: string; value: number; minOrderAmount: number | null; maxUses: number | null; usedCount: number; isActive: boolean; expiresAt: string | null; }

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/discounts").then((r) => r.json()).then((d) => { setCoupons(d.coupons || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, code: form.code.toUpperCase(), value: parseFloat(form.value), minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null, maxUses: form.maxUses ? parseInt(form.maxUses) : null, expiresAt: form.expiresAt || null }),
    });
    setAdding(false);
    setForm({ code: "", type: "PERCENTAGE", value: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
    load(); setSaving(false);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/discounts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    load();
  };

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Discounts & Coupons</h1>
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>New Coupon</Button>
      </div>
      <div className="p-6 max-w-3xl space-y-4">
        {adding && (
          <form onSubmit={handleCreate} className="bg-bloom-rose-50 border border-bloom-rose-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-sm font-semibold text-charcoal">New Discount Code</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. WELCOME10" />
              <div>
                <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-11 w-full px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose bg-white">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <Input label={form.type === "PERCENTAGE" ? "Discount (%)" : "Discount ($)"} type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              <Input label="Min. order amount ($)" type="number" step="0.01" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
              <Input label="Max uses (blank = unlimited)" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
              <Input label="Expires at (optional)" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="primary" loading={saving}>Create Coupon</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl border border-charcoal-100">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                {["Code", "Discount", "Uses", "Min. Order", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {loading && <tr><td colSpan={7} className="py-8 text-center text-taupe">Loading…</td></tr>}
              {!loading && coupons.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-taupe">No coupons yet.</td></tr>}
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-charcoal">{c.code}</td>
                  <td className="px-5 py-3">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="px-5 py-3 text-taupe">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-5 py-3 text-taupe">{c.minOrderAmount ? `$${c.minOrderAmount}` : "—"}</td>
                  <td className="px-5 py-3 text-taupe">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(c.id, c.isActive)} className="text-xs text-bloom-rose hover:underline font-body">
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
