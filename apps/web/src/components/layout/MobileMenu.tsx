"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, ChevronUp, Heart, User, ShoppingCart } from "lucide-react";
import { Drawer } from "@reborn/ui";
import { useAuthStore } from "@/store/authStore";

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

export function MobileMenu({ open, onClose, navLinks }: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { user } = useAuthStore();

  return (
    <Drawer open={open} onClose={onClose} side="left" title="Menu" size="md">
      <div className="p-4 space-y-1">
        {navLinks.map((link) => (
          <div key={link.label}>
            {link.children ? (
              <>
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === link.label ? null : link.label
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-charcoal rounded-xl hover:bg-soft-blush-50 transition-colors font-body"
                >
                  {link.label}
                  {expandedSection === link.label ? (
                    <ChevronUp className="w-4 h-4 text-taupe" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-taupe" />
                  )}
                </button>
                {expandedSection === link.label && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className="block px-4 py-2.5 text-sm text-taupe hover:text-bloom-rose rounded-xl hover:bg-soft-blush-50 transition-colors font-body"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={link.href}
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-charcoal rounded-xl hover:bg-soft-blush-50 hover:text-bloom-rose transition-colors font-body"
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}

        <div className="border-t border-charcoal-100 pt-4 mt-4 space-y-1">
          <Link
            href="/account/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-charcoal rounded-xl hover:bg-soft-blush-50 transition-colors font-body"
          >
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-charcoal rounded-xl hover:bg-soft-blush-50 transition-colors font-body"
          >
            <User className="w-4 h-4" /> {user ? "My Account" : "Login / Register"}
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
