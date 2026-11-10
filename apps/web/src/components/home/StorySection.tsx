import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StorySectionProps {
  image1?: string;
  image2?: string;
  title?: string;
  subtitle?: string;
  content?: string;
}

export function StorySection({ image1, image2, title, subtitle, content }: StorySectionProps) {
  const img1 = image1 || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80";
  const img2 = image2 || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80";
  const displayTitle = title || "Where Every Detail Tells a Story";
  const displaySubtitle = subtitle || "Our Craft";
  const displayContent = content || "<p>Each doll in our collection is the result of extraordinary skill, patience, and passion. From the delicate hand-rooted hair to the carefully layered skin painting, every detail is crafted to create an emotional, lasting connection.</p><p>We believe that a truly beautiful doll deserves a presentation worthy of its artistry, which is why every order is packaged with the same care and attention that went into creating it.</p>";

  return (
    <section className="py-20" style={{ background: "var(--bg-subtle)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-elevated ring-1 ring-[var(--border)]">
                <img src={img1} alt="Craftsmanship detail" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-card mt-8 ring-1 ring-[var(--border)]">
                <img src={img2} alt="Doll artistry" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
            {/* Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--primary-text)] px-6 py-3 rounded-2xl shadow-elevated whitespace-nowrap">
              <p className="text-sm font-semibold font-body">60+ hours of artistry</p>
              <p className="text-xs opacity-70 font-body">per premium piece</p>
            </div>
          </div>

          {/* Text */}
          <div className="lg:pl-8">
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest font-body mb-4">{displaySubtitle}</p>
            <h2 className="font-heading text-display-sm text-[var(--fg)] mb-6">{displayTitle}</h2>
            <div
              className="text-[var(--fg-muted)] font-body leading-relaxed mb-8 space-y-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: "500+", label: "Unique pieces" },
                { value: "5,000+", label: "Happy collectors" },
                { value: "30", label: "Day returns" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
                  <p className="text-xs text-[var(--fg-muted)] font-body mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[var(--primary)] font-medium font-body hover:gap-3 transition-all"
            >
              Our full story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
