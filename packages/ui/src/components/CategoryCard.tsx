import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  productCount?: number;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CategoryCard({
  name,
  slug,
  image,
  description,
  productCount,
  href,
  className,
  size = "md",
}: CategoryCardProps) {
  const linkHref = href || `/collections/${slug}`;

  return (
    <a
      href={linkHref}
      className={cn(
        "group relative overflow-hidden rounded-3xl block",
        size === "sm" && "aspect-[4/3]",
        size === "md" && "aspect-[3/4]",
        size === "lg" && "aspect-square",
        className
      )}
    >
      {/* Background image */}
      {image ? (
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-brand" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white font-semibold font-heading text-xl leading-tight mb-1">
          {name}
        </h3>
        {productCount !== undefined && (
          <p className="text-white/70 text-sm font-body mb-3">
            {productCount} {productCount === 1 ? "item" : "items"}
          </p>
        )}
        {description && !productCount && (
          <p className="text-white/70 text-sm font-body mb-3 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-2 text-white text-sm font-medium font-body group-hover:gap-3 transition-all duration-200">
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}
