"use client";

import { useEffect } from "react";

export function VisitorTracker() {
  useEffect(() => {
    // Only track once per browser session
    if (sessionStorage.getItem("vt")) return;
    sessionStorage.setItem("vt", "1");

    fetch("/api/visitor", {
      method: "POST",
      headers: { Referer: window.location.href },
    }).catch(() => {});
  }, []);

  return null;
}
