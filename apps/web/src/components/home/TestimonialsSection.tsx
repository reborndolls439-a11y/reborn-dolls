import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Margaret L.",
    location: "London, UK",
    rating: 5,
    text: "I've been collecting UK UK Reborn Dolls for over 15 years, and the quality here is absolutely exceptional. My Aurora arrived beautifully packaged and exceeded every expectation. The skin painting is breathtakingly realistic.",
    product: "Aurora Reborn Baby Girl",
    avatar: "M",
  },
  {
    name: "Sandra K.",
    location: "Manchester, UK",
    rating: 5,
    text: "Bought the Seraphina silicone doll as a gift for my mother and she was moved to tears. The detail in the fingers and the weight of the doll is extraordinary. Customer service was warm and personal throughout.",
    product: "Seraphina Full-Body Silicone",
    avatar: "S",
  },
  {
    name: "Jennifer M.",
    location: "Edinburgh, UK",
    rating: 5,
    text: "My third purchase from UK UK Reborn Dolls and each one has been perfect. The packaging is like unwrapping a luxury gift. The communication was wonderful and they emailed me updates throughout.",
    product: "Sophia Reborn Toddler Girl",
    avatar: "J",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Reviews</p>
          <h2 className="font-heading text-display-sm text-charcoal">Loved by Collectors</h2>
          <p className="text-taupe font-body mt-3 max-w-xl mx-auto">
            The experiences of our customers mean everything to us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl p-8 border border-charcoal-100 hover:shadow-card transition-shadow duration-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-bloom-rose text-bloom-rose" />
                ))}
              </div>

              <p className="text-charcoal font-body text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-charcoal-50">
                <div className="w-10 h-10 rounded-full bg-bloom-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-bloom-rose font-semibold text-sm font-heading">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">{t.name}</p>
                  <p className="text-xs text-taupe font-body">{t.location}</p>
                </div>
                <div className="ml-auto">
                  <p className="text-xs text-taupe font-body">Verified purchase</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-bloom-rose text-bloom-rose" />
            ))}
          </div>
          <p className="text-lg font-semibold text-charcoal font-heading">4.9 out of 5</p>
          <p className="text-taupe font-body text-sm">based on 847 verified reviews</p>
        </div>
      </div>
    </section>
  );
}
