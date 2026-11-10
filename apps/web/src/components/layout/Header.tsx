"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu, ChevronDown } from "lucide-react";
import { useCartStore, useCartItemCount } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@reborn/ui";
import { SearchModal } from "@/components/shared/SearchModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CurrencySelector } from "@/components/shared/CurrencySelector";

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
  const [shipThreshold, setShipThreshold] = useState<number | null>(null);

  // Fetch free shipping threshold from store settings
  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => {
        const val = d.settings?.free_shipping_threshold ?? d.free_shipping_threshold;
        if (val) setShipThreshold(parseFloat(val));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconClass = "p-2.5 rounded-full transition-all duration-200 text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)]";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[var(--bg-card)]/95 backdrop-blur-md shadow-soft border-b border-[var(--border)]"
            : "bg-[var(--bg)]/90 backdrop-blur-sm"
        )}
      >
        {/* Announcement bar */}
        <div className="bg-[var(--primary)] text-[var(--primary-text)] text-center py-1.5 px-4 text-xs font-body font-semibold">
          ✨ Free shipping on orders over {shipThreshold ? `£${shipThreshold}` : "£150"} &middot; Carefully packaged with love
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Mobile menu button */}
            <button
              className={cn("lg:hidden", iconClass)}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/icon.jpeg" alt="UK Reborn Dolls" className="w-9 h-9 rounded-full object-cover ring-1 ring-[var(--border)]" />
              <div className="hidden sm:block">
                <span className="font-heading text-xl font-bold text-[var(--fg)]">
                  UK Reborn <span className="text-bloom-rose">Dolls</span>
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-[var(--bg-subtle)] font-body"
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--bg-card)] rounded-2xl shadow-elevated border border-[var(--border)] py-2 animate-slide-down z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors font-body"
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
            <div className="flex items-center gap-0.5">
              <div className="hidden sm:block mr-1">
                <CurrencySelector />
              </div>
              <ThemeToggle />

              <button onClick={() => setSearchOpen(true)} aria-label="Search" className={iconClass}>
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/account/wishlist"
                aria-label={`Wishlist (${wishlistItems.length} items)`}
                className={cn("relative", iconClass)}
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-bloom-rose text-[var(--primary-text)] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href={user ? "/account" : "/login"} aria-label="Account" className={iconClass}>
                <User className="w-5 h-5" />
              </Link>

              <button onClick={openCart} aria-label={`Cart (${itemCount} items)`} className={cn("relative", iconClass)}>
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-bloom-rose text-[var(--primary-text)] text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[3.5rem] lg:h-16" />

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
    </>
  );
}
