"use client";

import { ToastContainer } from "@reborn/ui";
import { useUIStore } from "@/store/uiStore";

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore();
  return <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />;
}
