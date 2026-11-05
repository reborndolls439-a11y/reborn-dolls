"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore, useCartItemCount } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@reborn/ui";
import { SearchModal } from "@/components/shared/SearchModal";
import { MobileMenu } from "@/components/layout/MobileMenu";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Featured", href: "/shop?badge=FEATURED" },
      { label: "On Sale", href: "/shop?badge=SALE" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "Reborn Dolls", href: "/collections/reborn-dolls" },
      { label: "Silicone Dolls", href: "/collections/silicone-dolls" },
      { label: "Cuddle Babies", href: "/collections/cuddle-babies" },
      { label: "Limited Edition", href: "/collections/limited-edition" },
      { label: "Doll Clothing", href: "/collections/doll-clothing" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { openCart } = useCartStore();
  const itemCount = useCartItemCount();
  const { items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-charcoal-100"
            : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-charcoal hover:text-bloom-rose transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bloom-rose flex items-center justify-center">
                <span className="text-white text-xs font-bold font-heading">R</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-heading text-xl font-bold text-charcoal">
                  Reborn <span className="text-bloom-rose">Dolls</span>
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium text-charcoal hover:text-bloom-rose transition-colors rounded-lg hover:bg-soft-blush-50 font-body",
                    )}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-elevated border border-charcoal-100 py-2 animate-slide-down z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-charcoal hover:text-bloom-rose hover:bg-soft-blush-50 transition-colors font-body"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2.5 text-charcoal hover:text-bloom-rose hover:bg-soft-blush-50 rounded-full transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/account/wishlist"
                aria-label={`Wishlist (${wishlistItems.length} items)`}
                className="relative p-2.5 text-charcoal hover:text-bloom-rose hover:bg-soft-blush-50 rounded-full transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-bloom-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                href={user ? "/account" : "/login"}
                aria-label="Account"
                className="p-2.5 text-charcoal hover:text-bloom-rose hover:bg-soft-blush-50 rounded-full transition-all duration-200"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={openCart}
                aria-label={`Shopping cart (${itemCount} items)`}
                className="relative p-2.5 text-charcoal hover:text-bloom-rose hover:bg-soft-blush-50 rounded-full transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-bloom-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Announcement bar */}
        <div className="bg-bloom-rose text-white text-center py-1.5 px-4 text-xs font-body">
          ✨ Free shipping on orders over $150 · Carefully packaged with love
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
    </>
  );
}
