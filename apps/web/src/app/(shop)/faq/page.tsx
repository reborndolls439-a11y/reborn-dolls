"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "What is a reborn doll?", a: "A reborn doll is a hand-crafted, lifelike baby doll created by a skilled artist. Using multiple layers of paint, hand-rooted hair, and carefully selected materials, artists transform vinyl kits into extraordinarily realistic collectibles." },
  { q: "How are your dolls packaged?", a: "Every doll is wrapped in tissue paper, nestled in a protective inner box, and shipped in a sturdy outer box. We take packaging very seriously — your doll will arrive as beautiful as the day it left us." },
  { q: "How long does shipping take?", a: "Standard orders typically arrive within 5–10 business days. We'll provide tracking information as soon as your order ships. Free shipping applies to orders over $150." },
  { q: "What is your return policy?", a: "We accept returns within 30 days of delivery for items in their original, unused condition. Please visit our Returns & Refunds page for full details and to initiate a return." },
  { q: "How do I care for my reborn doll?", a: "Spot clean with a damp cloth only. Avoid direct sunlight, extreme temperatures, and harsh chemicals. Store in a cool, dry place, preferably in the original box or a display case." },
  { q: "Can I request a specific doll or customization?", a: "We curate a set inventory and do not currently offer custom orders. However, we add new pieces regularly. Sign up for our newsletter to be first to know about new arrivals." },
  { q: "How do I know which size outfit fits my doll?", a: "Each product listing includes the doll's measurements. Our clothing listings specify which doll sizes they fit. If you're unsure, contact us and we'll be happy to advise." },
  { q: "Is my payment information secure?", a: "Yes. We take security very seriously. Payment is arranged directly via email after you place your order, so your financial information is handled with full personal care." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">Frequently Asked Questions</h1>
          <p className="text-taupe font-body mt-2">Everything you need to know about our products and services.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full px-6 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="font-semibold text-charcoal font-body pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-4 h-4 text-bloom-rose shrink-0" /> : <ChevronDown className="w-4 h-4 text-taupe shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-taupe font-body leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
