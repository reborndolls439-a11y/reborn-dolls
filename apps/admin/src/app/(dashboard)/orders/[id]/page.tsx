"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Truck, Package, AlertTriangle } from "lucide-react";
import { Button, Input, Badge } from "@reborn/ui";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

const statusOpts = ["PENDING","PAYMENT_CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
const statusLabels: Record<string,string> = { PENDING:"Pending",PAYMENT_CONFIRMED:"Confirmed",PROCESSING:"Processing",SHIPPED:"Shipped",DELIVERED:"Delivered",CANCELLED:"Cancelled",REFUNDED:"Refunded" };
const statusVariant: Record<string,string> = { PENDING:"warning",PAYMENT_CONFIRMED:"info",PROCESSING:"info",SHIPPED:"success",DELIVERED:"success",CANCELLED:"error",REFUNDED:"default" };

interface Order { id: string; orderNumber: string; status: string; total: number; subtotal: number; shippingCost: number; tax: number; notes?: string; trackingNumber?: string; shippingCarrier?: string; internalNotes?: string; guestName?: string; guestEmail?: string; user?: { name?: string; email?: string }; items: { id: string; productName: string; quantity: number; price: number; subtotal: number; productImage?: string }[]; shippingAddress?: { firstName: string; lastName: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string }; createdAt: string; }

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "", trackingNumber: "", shippingCarrier: "", internalNotes: "" });

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((d) => {
      setOrder(d.order);
      setForm({ status: d.order.status, trackingNumber: d.order.trackingNumber || "", shippingCarrier: d.order.shippingCarrier || "", internalNotes: d.order.internalNotes || "" });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setOrder((o) => o ? { ...o, ...form } : o); }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-taupe font-body">Loading…</div>;
  if (!order) return <div className="p-8 text-center"><p className="text-taupe font-body">Order not found.</p></div>;

  const customerName = order.user?.name || order.guestName || "Guest";
  const customerEmail = order.user?.email || order.guestEmail;

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6">
        <button onClick={() => router.push("/orders")} className="text-taupe hover:text-charcoal transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-heading text-lg font-bold text-charcoal">Order #{order.orderNumber}</h1>
        </div>
        <Badge variant={(statusVariant[order.status] || "default") as "success"|"warning"|"info"|"error"|"default"}>{statusLabels[order.status]}</Badge>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-charcoal-100">
            <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">Order Items</h2>
            <div className="divide-y divide-charcoal-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                    {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal font-body line-clamp-1">{item.productName}</p>
                    <p className="text-sm text-taupe font-body">Qty: {item.quantity} × ${pd(item.price).toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-charcoal font-body">${pd(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-charcoal-100 space-y-1.5 text-sm font-body">
              <div className="flex justify-between text-taupe"><span>Subtotal</span><span>${pd(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-taupe"><span>Shipping</span><span>{pd(order.shippingCost) === 0 ? "Free" : `$${pd(order.shippingCost).toFixed(2)}`}</span></div>
              <div className="flex justify-between font-bold text-charcoal text-base pt-2 border-t border-charcoal-100"><span>Total</span><span>${pd(order.total).toFixed(2)}</span></div>
            </div>
          </div>

          {/* Fulfilment */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal flex items-center gap-2"><Truck className="w-4 h-4 text-bloom-rose" /> Fulfilment</h2>
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Order Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose w-full bg-white">
                {statusOpts.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Tracking Number" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} placeholder="e.g. 1Z999AA10123456784" />
              <Input label="Carrier" value={form.shippingCarrier} onChange={(e) => setForm({ ...form, shippingCarrier: e.target.value })} placeholder="e.g. UPS, FedEx, USPS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Internal Notes</label>
              <textarea value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} rows={3} placeholder="Notes visible only to admin staff…" className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
            </div>
            <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <h2 className="font-heading text-sm font-semibold text-charcoal mb-3">Customer</h2>
            <p className="text-sm font-medium text-charcoal font-body">{customerName}</p>
            {customerEmail && <p className="text-sm text-taupe font-body mt-0.5">{customerEmail}</p>}
            {customerEmail && (
              <a href={`mailto:${customerEmail}`} className="inline-flex items-center gap-1 mt-2 text-xs text-bloom-rose font-body hover:underline">Email customer →</a>
            )}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
              <h2 className="font-heading text-sm font-semibold text-charcoal mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-bloom-rose" /> Ship To</h2>
              <p className="text-sm text-taupe font-body leading-relaxed">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Customer notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 font-body flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Customer Note</p>
              <p className="text-sm text-amber-800 font-body">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
