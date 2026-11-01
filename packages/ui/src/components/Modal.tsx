"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-5xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  className,
}: ModalProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-white rounded-3xl shadow-elevated animate-scale-in overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-charcoal-100">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-charcoal font-heading">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-taupe font-body">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-4 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-taupe hover:bg-charcoal-50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirmation Dialog ───────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-taupe font-body mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="h-10 px-5 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal hover:bg-charcoal-50 transition-colors font-body"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            "h-10 px-5 rounded-full text-sm font-medium text-white transition-colors font-body disabled:opacity-50",
            variant === "danger" ? "bg-red-500 hover:bg-red-600" :
            variant === "warning" ? "bg-amber-500 hover:bg-amber-600" :
            "bg-bloom-rose hover:bg-bloom-rose-600"
          )}
        >
          {loading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
