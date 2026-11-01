"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

const sideClasses = {
  left: "inset-y-0 left-0 h-full",
  right: "inset-y-0 right-0 h-full",
  bottom: "inset-x-0 bottom-0",
};

const translateOut = {
  left: "-translate-x-full",
  right: "translate-x-full",
  bottom: "translate-y-full",
};

const sizeClassesDrawer = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[480px]",
  xl: "w-[560px]",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  size = "md",
  showClose = true,
  className,
  footer,
}: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute bg-white shadow-elevated flex flex-col transition-transform duration-300 ease-in-out",
          sideClasses[side],
          side !== "bottom" && sizeClassesDrawer[size],
          side === "bottom" && "max-h-[85vh] rounded-t-3xl",
          side !== "bottom" && "rounded-none",
          !open && translateOut[side],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 shrink-0">
            {title && (
              <h2 className="text-lg font-semibold text-charcoal font-heading">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-taupe hover:bg-charcoal-50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-charcoal-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
