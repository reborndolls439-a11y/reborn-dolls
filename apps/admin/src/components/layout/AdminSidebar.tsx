"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, MessageCircle,
  FileText, Image, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Scissors, Star, Percent, Activity, Search
} from "lucide-react";
import { cn } from "@reborn/ui";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/products/scraper", label: "Import Products", icon: Scissors },
      { href: "/categories", label: "Categories", icon: Tag },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/orders", label: "Orders", icon: ShoppingBag },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/blog", label: "Blog", icon: FileText },
      { href: "/media", label: "Media Library", icon: Image },
      { href: "/seo", label: "SEO Manager", icon: Search },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/chat", label: "Live Chat", icon: MessageCircle },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/activity", label: "Activity Logs", icon: Activity },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps { unreadChats?: number; unreadNotifications?: number; }

export function AdminSidebar({ unreadChats = 0, unreadNotifications = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={cn("flex flex-col bg-charcoal h-screen sticky top-0 transition-all duration-300 shrink-0", collapsed ? "w-16" : "w-60")}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-bloom-rose flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold font-heading">R</span>
            </div>
            <span className="font-heading text-base font-bold text-white">Admin</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className={cn("w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors", collapsed && "mx-auto")}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="px-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1 font-body">{group.label}</p>}
            {group.items.map((item) => {
              const active = isActive(item.href, (item as { exact?: boolean }).exact);
              const badge = item.href === "/chat" ? unreadChats : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 h-9 px-4 text-sm font-medium font-body transition-colors relative",
                    active ? "bg-bloom-rose text-white" : "text-white/70 hover:text-white hover:bg-white/10",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {badge > 0 && <span className={cn("w-4 h-4 bg-bloom-rose text-white text-[10px] rounded-full flex items-center justify-center", collapsed ? "absolute top-1 right-1" : "ml-auto")}>{badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 py-3 shrink-0">
        <button onClick={handleLogout} title={collapsed ? "Sign Out" : undefined} className={cn("flex items-center gap-3 h-9 px-4 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors w-full", collapsed && "justify-center")}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
