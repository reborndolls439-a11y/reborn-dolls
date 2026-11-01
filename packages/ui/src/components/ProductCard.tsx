"use client";

import * as React from "react";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";
import { cn, formatPrice, getDiscountPercentage } from "../lib/utils";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  badge?: "NEW" | "FEATURED" | "SALE" | "LIMITED" | "SOLD_OUT" | null;
  image?: string | null;
  category?: string | null;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
  onQuickView?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  href?: string;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
}

const badgeVariantMap = {
  NEW: "new",
  FEATURED: "featured",
  SALE: "sale",
  LIMITED: "limited",
  SOLD_OUT: "sold-out",
} as const;

const badgeLabelMap = {
  NEW: "New",
  FEATURED: "Featured",
  SALE: "Sale",
  LIMITED: "Limited Edition",
  SOLD_OUT: "Sold Out",
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  badge,
  image,
  category,
  stockQuantity = 0,
  rating,
  reviewCount,
  isWishlisted = false,
  onWishlistToggle,
  onQuickView,
  onAddToCart,
  href,
  className,
  variant = "default",
}: ProductCardProps) {
  const isSoldOut = stockQuantity === 0 || badge === "SOLD_OUT";
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  const discount = salePrice ? getDiscountPercentage(price, salePrice) : null;
  const linkHref = href || `/products/${slug}`;

  if (variant === "horizontal") {
    return (
      <div className={cn(
        "group flex gap-4 bg-white rounded-2xl p-3 border border-charcoal-100 hover:border-bloom-rose-200 transition-all duration-200 hover:shadow-card",
        className
      )}>
        <a href={linkHref} className="shrink-0">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-soft-blush-50">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-taupe-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            )}
          </div>
        </a>
        <div className="flex-1 min-w-0">
          {category && <p className="text-xs text-taupe font-body mb-1">{category}</p>}
          <a href={linkHref}>
            <h3 className="text-sm font-medium text-charcoal font-body truncate hover:text-bloom-rose transition-colors">{name}</h3>
          </a>
          <div className="mt-2 flex items-center gap-2">
            {salePrice ? (
              <>
                <span className="text-bloom-rose font-semibold text-sm">{formatPrice(salePrice)}</span>
                <span className="text-taupe line-through text-xs">{formatPrice(price)}</span>
              </>
            ) : (
              <span className="text-charcoal font-semibold text-sm">{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-white rounded-3xl overflow-hidden border border-charcoal-100",
        "hover:border-bloom-rose-200 hover:shadow-card-hover transition-all duration-300",
        isSoldOut && "opacity-80",
        className
      )}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-soft-blush-50 aspect-square">
        <a href={linkHref} tabIndex={-1}>
          {image ? (
            <img
              src={image}
              alt={name}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                !isSoldOut && "group-hover:scale-105"
              )}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-brand">
              <svg className="w-16 h-16 text-taupe-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </a>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {badge && badge !== "SOLD_OUT" && (
            <Badge variant={badgeVariantMap[badge]}>
              {discount && badge === "SALE" ? `-${discount}%` : badgeLabelMap[badge]}
            </Badge>
          )}
          {isSoldOut && <Badge variant="sold-out">Sold Out</Badge>}
          {isLowStock && !isSoldOut && (
            <Badge variant="warning">Only {stockQuantity} left</Badge>
          )}
        </div>

        {/* Action overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          {onWishlistToggle && (
            <button
              onClick={() => onWishlistToggle(id)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-card transition-all duration-200",
                isWishlisted
                  ? "bg-bloom-rose text-white"
                  : "bg-white text-charcoal hover:bg-bloom-rose hover:text-white"
              )}
            >
              <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          )}
          {onQuickView && (
            <button
              onClick={() => onQuickView(id)}
              aria-label="Quick view"
              className="w-9 h-9 rounded-full bg-white text-charcoal hover:bg-charcoal hover:text-white flex items-center justify-center shadow-card transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add to cart hover overlay */}
        {onAddToCart && !isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              variant="primary"
              size="sm"
              className="w-full rounded-xl shadow-elevated"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
              onClick={() => onAddToCart(id)}
            >
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <p className="text-xs text-taupe font-body mb-1 uppercase tracking-wide">{category}</p>
        )}
        <a href={linkHref}>
          <h3 className="text-sm font-semibold text-charcoal font-body leading-snug hover:text-bloom-rose transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </a>

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                fill={i < Math.round(rating) ? "#C86B7A" : "none"}
                stroke={i < Math.round(rating) ? "#C86B7A" : "#8A7D76"}
              />
            ))}
            {reviewCount !== undefined && (
              <span className="text-xs text-taupe ml-1">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-bloom-rose font-bold text-base">{formatPrice(salePrice)}</span>
              <span className="text-taupe line-through text-sm">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="text-charcoal font-bold text-base">{formatPrice(price)}</span>
          )}
        </div>

        {isSoldOut && (
          <p className="text-xs text-taupe mt-2 font-body">Currently unavailable</p>
        )}
      </div>
    </div>
  );
}
