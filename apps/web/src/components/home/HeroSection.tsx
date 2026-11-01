import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-bloom-rose-100/40 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-sage-100/30 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white border border-bloom-rose-200 text-bloom-rose text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-soft font-body">
              <Sparkles className="w-3.5 h-3.5" />
              New arrivals just landed
            </div>

            <h1 className="font-heading text-display-md lg:text-display-lg text-charcoal mb-6 leading-[1.1]">
              Discover Art
              <br />
              <span className="text-bloom-rose italic">That Feels Alive.</span>
            </h1>

            <p className="text-lg text-taupe font-body leading-relaxed mb-10 max-w-md">
              Each doll in our collection is a masterwork — hand-crafted, thoughtfully presented, and ready to be cherished. Find your perfect piece today.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-14 px-8 bg-bloom-rose text-white font-semibold rounded-full hover:bg-bloom-rose-600 transition-all duration-200 shadow-soft hover:shadow-md font-body text-base"
              >
                Shop the Collection
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-2 h-14 px-8 bg-white text-charcoal font-semibold rounded-full border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-all duration-200 font-body text-base"
              >
                New Arrivals
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { label: "Hand-Crafted", sub: "Every piece" },
                { label: "Secure Shopping", sub: "100% safe" },
                { label: "Free Shipping", sub: "Orders over $150" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-bloom-rose-50 border border-bloom-rose-200 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-bloom-rose" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal font-body">{item.label}</p>
                    <p className="text-xs text-taupe font-body">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image grid */}
          <div className="relative hidden lg:grid grid-cols-2 gap-4 animate-slide-up">
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80"
                  alt="Featured reborn doll"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-square rounded-3xl overflow-hidden shadow-card">
                <img
                  src="https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&q=80"
                  alt="Doll detail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-card">
                <img
                  src="https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80"
                  alt="Silicone doll"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80"
                  alt="Toddler doll"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-elevated px-5 py-4 flex items-center gap-3 border border-charcoal-100">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
                <span className="text-sage text-lg">★</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal font-body">Loved by collectors</p>
                <p className="text-xs text-taupe font-body">5,000+ happy customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
