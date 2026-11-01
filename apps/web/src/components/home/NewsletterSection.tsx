"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      await api.post("/newsletter", { email });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-bloom-rose-500 to-bloom-rose-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white blur-2xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h2 className="font-heading text-display-sm text-white mb-3">
          Join Our World
        </h2>
        <p className="text-white/80 font-body text-lg mb-8">
          Be the first to know about new arrivals, exclusive offers, and collecting guides.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="text-white font-semibold font-body">
              You're subscribed! Welcome to the family.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Your email address"
                aria-label="Email address"
                className="w-full h-12 px-5 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 font-body text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25"
                required
              />
              {error && <p className="mt-2 text-xs text-white/80 font-body text-left pl-4">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 px-7 bg-white text-bloom-rose font-semibold rounded-full hover:bg-ivory-50 transition-colors font-body text-sm shrink-0 disabled:opacity-70"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-white/60 font-body">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
