import React from "react";
import { ShieldCheck, Package, Heart, Headphones } from "lucide-react";

const items = [
  {
    icon: Heart,
    title: "Carefully Curated",
    description: "Every piece personally selected for quality and artistry",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description: "Your information is always protected",
  },
  {
    icon: Package,
    title: "Premium Packaging",
    description: "Each order packed with love and care",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Personal customer care whenever you need it",
  },
];

export function TrustBar() {
  return (
    <section className="bg-white border-y border-charcoal-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-bloom-rose-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-bloom-rose" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">{item.title}</p>
                  <p className="text-xs text-taupe font-body mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
