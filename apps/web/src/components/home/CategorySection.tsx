import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Reborn Dolls",
    slug: "reborn-dolls",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80",
    description: "Lifelike hand-crafted babies",
  },
  {
    name: "Silicone Dolls",
    slug: "silicone-dolls",
    image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&q=80",
    description: "Museum-quality collectibles",
  },
  {
    name: "Cuddle Babies",
    slug: "cuddle-babies",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
    description: "Soft & weighted companions",
  },
  {
    name: "Limited Edition",
    slug: "limited-edition",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    description: "Exclusive collector pieces",
  },
  {
    name: "Doll Clothing",
    slug: "doll-clothing",
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&q=80",
    description: "Beautiful outfits & sets",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
    description: "Complete your collection",
  },
];

export function CategorySection() {
  return (
    <section className="py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Collections</p>
            <h2 className="font-heading text-display-sm text-charcoal">Shop by Category</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-sm text-bloom-rose font-medium hover:gap-3 transition-all font-body"
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
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-soft-blush-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-charcoal/20 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal font-body group-hover:text-bloom-rose transition-colors">{cat.name}</p>
                <p className="text-xs text-taupe font-body hidden sm:block">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/shop" className="text-sm text-bloom-rose font-medium font-body">
            View all categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
