"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { api } from "@/lib/api";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : "Reset failed." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8 text-center">
        <h1 className="font-heading text-xl font-bold text-charcoal mb-3">Invalid Link</h1>
        <p className="text-sm text-taupe font-body mb-4">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-bloom-rose font-semibold hover:underline font-body">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl font-bold text-charcoal">New Password</h1>
        <p className="text-sm text-taupe font-body mt-1">Choose a strong password</p>
      </div>

      {done ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">Password Updated!</h2>
          <p className="text-sm text-taupe font-body">Redirecting you to login…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">
              {errors.general}
            </div>
          )}
          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            required
            hint="At least 8 characters"
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          <Input
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            error={errors.confirm}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Set New Password
          </Button>
        </form>
      )}
    </div>
  );
}
