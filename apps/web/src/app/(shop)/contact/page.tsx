"use client";

import React, { useState } from "react";
import { Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In production: POST to /api/contact which creates a conversation
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Get in Touch</p>
          <h1 className="font-heading text-display-sm text-charcoal">Contact Us</h1>
          <p className="text-taupe font-body mt-2 max-w-xl">We'd love to hear from you. Whether you have a question about a product or need help with an order, we're here.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-charcoal-100">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">Message Sent!</h2>
                <p className="text-taupe font-body">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <div>
                  <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Message <span className="text-bloom-rose">*</span></label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} required placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>Send Message</Button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", lines: ["hello@reborndolls.com", "We reply within 24 hours"] },
              { icon: MessageCircle, title: "Live Chat", lines: ["Available in the shop", "Monday – Friday, 9am – 6pm"] },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 border border-charcoal-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-bloom-rose-50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-bloom-rose" />
                  </div>
                  <p className="font-semibold text-charcoal font-body text-sm">{item.title}</p>
                </div>
                {item.lines.map((l) => <p key={l} className="text-sm text-taupe font-body">{l}</p>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
