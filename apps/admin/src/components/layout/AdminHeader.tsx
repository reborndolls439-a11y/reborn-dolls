"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";

interface AdminHeaderProps { title: string; subtitle?: string; unread?: number; }

export function AdminHeader({ title, subtitle, unread = 0 }: AdminHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-charcoal-100 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="font-heading text-lg font-bold text-charcoal">{title}</h1>
        {subtitle && <p className="text-xs text-taupe font-body">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Link href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"} target="_blank" className="flex items-center gap-1.5 text-xs text-taupe font-body hover:text-bloom-rose transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Store
        </Link>
        <div className="relative">
          <Link href="/notifications" className="w-9 h-9 flex items-center justify-center text-taupe hover:text-charcoal hover:bg-charcoal-50 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
          </Link>
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-bloom-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>
          )}
        </div>
      </div>
    </header>
  );
}
