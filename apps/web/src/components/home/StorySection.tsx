import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StorySection() {
  return (
    <section className="py-20 bg-soft-blush-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80"
                  alt="Craftsmanship detail"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-card mt-8">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80"
                  alt="Doll artistry"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-bloom-rose text-white px-6 py-3 rounded-2xl shadow-elevated whitespace-nowrap">
              <p className="text-sm font-semibold font-body">60+ hours of artistry</p>
              <p className="text-xs text-white/80 font-body">per premium piece</p>
            </div>
          </div>

          {/* Text */}
          <div className="lg:pl-8">
            <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-4">Our Craft</p>
            <h2 className="font-heading text-display-sm text-charcoal mb-6">
              Where Every Detail
              <br />
              <span className="italic text-bloom-rose">Tells a Story</span>
            </h2>
            <p className="text-taupe font-body leading-relaxed mb-5">
              Each doll in our collection is the result of extraordinary skill, patience, and passion. From the delicate hand-rooted hair to the carefully layered skin painting, every detail is crafted to create an emotional, lasting connection.
            </p>
            <p className="text-taupe font-body leading-relaxed mb-8">
              We believe that a truly beautiful doll deserves a presentation worthy of its artistry — which is why every order is packaged with the same care and attention that went into creating it.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: "500+", label: "Unique pieces" },
                { value: "5,000+", label: "Happy collectors" },
                { value: "30", label: "Day returns" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-xs text-taupe font-body mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-bloom-rose font-medium font-body hover:gap-3 transition-all"
            >
              Our full story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
