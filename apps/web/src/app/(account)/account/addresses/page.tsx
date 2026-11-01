"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { Button, Input, EmptyState } from "@reborn/ui";

interface Address { id: string; label?: string; firstName: string; lastName: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; phone?: string; isDefault: boolean; }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", phone: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/addresses").then((r) => r.json()).then((d) => setAddresses(d.addresses || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setAdding(false);
      setForm({ label: "", firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", phone: "" });
      load();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Saved Addresses</h1>
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>Add Address</Button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
          <h2 className="font-heading text-base font-semibold text-charcoal mb-4">New Address</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <Input label="Label (e.g. Home, Work)" value={form.label} onChange={set("label")} placeholder="Optional" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={set("firstName")} required />
              <Input label="Last name" value={form.lastName} onChange={set("lastName")} required />
            </div>
            <Input label="Address" value={form.line1} onChange={set("line1")} required />
            <Input label="Apt / Suite (optional)" value={form.line2} onChange={set("line2")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={set("city")} required />
              <Input label="State / Province" value={form.state} onChange={set("state")} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Postal code" value={form.postalCode} onChange={set("postalCode")} required />
              <Input label="Country" value={form.country} onChange={set("country")} required />
            </div>
            <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" size="sm" loading={saving}>Save Address</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <EmptyState icon={<MapPin />} title="No saved addresses" description="Add an address to speed up your checkout." size="sm" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-charcoal-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-charcoal font-body">{addr.label || "Address"}{addr.isDefault && <span className="ml-2 text-xs text-bloom-rose">(Default)</span>}</p>
                <button onClick={() => handleDelete(addr.id)} className="text-taupe hover:text-red-500 transition-colors" aria-label="Delete address"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-taupe font-body leading-relaxed">
                {addr.firstName} {addr.lastName}<br />
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                {addr.city}, {addr.state} {addr.postalCode}<br />
                {addr.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
