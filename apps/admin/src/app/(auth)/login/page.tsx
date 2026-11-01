"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button, Input } from "@reborn/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      router.push("/dashboard");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-bloom-rose flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold font-heading">R</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Admin Panel</h1>
          <p className="text-sm text-taupe font-body mt-1">Reborn Dolls — Restricted Access</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
          <Input label="Password" type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password"
            rightIcon={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onRightIconClick={() => setShowPw(!showPw)} />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} leftIcon={<LogIn className="w-4 h-4" />}>Sign In to Admin</Button>
        </form>
        <p className="mt-6 text-center text-xs text-taupe font-body">Admin and Super Admin access only.</p>
      </div>
    </div>
  );
}
