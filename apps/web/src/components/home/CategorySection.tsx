import React from "react";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
}

interface CategorySectionProps {
  categories: Category[];
}

// Fallback descriptions for categories that don't have one yet
const fallbackDescriptions: Record<string, string> = {
  "reborn-dolls":    "Lifelike hand-crafted babies",
  "silicone-dolls":  "Museum-quality collectibles",
  "cuddle-babies":   "Soft & weighted companions",
  "limited-edition": "Exclusive collector pieces",
  "doll-clothing":   "Beautiful outfits & sets",
  "accessories":     "Complete your collection",
};

export function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest font-body mb-2">Collections</p>
            <h2 className="font-heading text-display-sm text-[var(--fg)]">Shop by Category</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-sm text-[var(--primary)] font-medium hover:gap-3 transition-all font-body"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[var(--surface)]">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  /* Placeholder when no image uploaded yet */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[var(--surface)]">
                    <ImageIcon className="w-8 h-8 text-[var(--fg-subtle)]" />
                    <span className="text-[9px] text-[var(--fg-subtle)] font-body px-2 text-center leading-tight">
                      No image yet
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[var(--secondary)]/10 group-hover:bg-[var(--secondary)]/20 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--fg)] font-body group-hover:text-[var(--primary)] transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-[var(--fg-muted)] font-body hidden sm:block">
                  {cat.description || fallbackDescriptions[cat.slug] || ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/shop" className="text-sm text-[var(--primary)] font-medium font-body">
            View all categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
