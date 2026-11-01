"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-bloom-rose flex items-center justify-center">
              <span className="text-white font-bold font-heading">R</span>
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Reset Password</h1>
          <p className="text-sm text-taupe font-body mt-1">Enter your email and we'll send a reset link</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">Check your inbox</h2>
            <p className="text-sm text-taupe font-body mb-6">If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.</p>
            <Link href="/login" className="text-sm text-bloom-rose font-semibold hover:underline font-body">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">{error}</div>}
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} leftIcon={<Mail className="w-4 h-4" />} required />
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>Send Reset Link</Button>
            <p className="text-center text-sm text-taupe font-body"><Link href="/login" className="text-bloom-rose hover:underline">← Back to Login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
