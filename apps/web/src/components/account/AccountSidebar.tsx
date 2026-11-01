"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Heart, MapPin, User, Shield, MessageCircle, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/support", label: "Support", icon: MessageCircle },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: Shield },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await api.post("/auth/logout", {}).catch(() => {});
    logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <aside>
      {/* User info */}
      <div className="bg-white rounded-2xl p-4 border border-charcoal-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bloom-rose-100 flex items-center justify-center shrink-0">
            <span className="text-bloom-rose font-semibold font-heading text-sm">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal font-body truncate">{user?.name || "Account"}</p>
            <p className="text-xs text-taupe font-body truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium font-body transition-colors border-b border-charcoal-50 last:border-b-0",
                active ? "bg-soft-blush-50 text-bloom-rose" : "text-charcoal hover:bg-charcoal-50 hover:text-bloom-rose"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium font-body text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
