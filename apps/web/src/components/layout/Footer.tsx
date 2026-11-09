"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Reborn Dolls", href: "/collections/reborn-dolls" },
  { label: "Silicone Dolls", href: "/collections/silicone-dolls" },
  { label: "Limited Edition", href: "/collections/limited-edition" },
  { label: "Accessories", href: "/collections/accessories" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Refunds", href: "/returns-policy" },
  { label: "Track Your Order", href: "/account/orders" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter band */}
      <div className="bg-bloom-rose">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-2xl font-semibold text-white mb-1">
                Stay in the Loop
              </h3>
              <p className="text-white/80 text-sm font-body">
                New arrivals, exclusive offers, and collecting guides straight to your inbox.
              </p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 h-11 px-4 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm font-body focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-white text-bloom-rose font-semibold text-sm rounded-full hover:bg-ivory-50 transition-colors font-body whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-bloom-rose flex items-center justify-center">
                <span className="text-white text-xs font-bold font-heading">R</span>
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Reborn <span className="text-bloom-rose-400">Dolls</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm font-body leading-relaxed mb-6 max-w-xs">
              Premium hand-crafted reborn dolls and collectibles. Each piece is a work of art, thoughtfully curated and carefully presented.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/reborndolls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-bloom-rose flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/reborndolls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-bloom-rose flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@reborndolls.com"
                aria-label="Email us"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-bloom-rose flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-body">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-body">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-body">
              Company
            </h4>
            <ul className="space-y-2.5 mb-6">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/50 font-body">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                hello@reborndolls.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 font-body">
            © {new Date().getFullYear()} Reborn Dolls. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-xs text-white/40 hover:text-white/70 transition-colors font-body">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors font-body">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
