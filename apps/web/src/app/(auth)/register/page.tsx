"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "@/store/uiStore";
import type { User } from "@reborn/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email) e.email = "Email is required.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post<{ user: User }>("/auth/register", { name: form.name, email: form.email, password: form.password });
      setUser(data.user);
      toast.success("Account created!", "Welcome to UK UK Reborn Dolls.");
      router.push("/account");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
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
          <h1 className="font-heading text-2xl font-bold text-charcoal">Create Account</h1>
          <p className="text-sm text-taupe font-body mt-1">Join the UK UK Reborn Dolls community</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Full name" type="text" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required autoComplete="name" />
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required autoComplete="email" />
          <Input label="Password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} required autoComplete="new-password"
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onRightIconClick={() => setShowPassword(!showPassword)} />
          <Input label="Confirm password" type={showPassword ? "text" : "password"} placeholder="Repeat your password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} required autoComplete="new-password" />

          <p className="text-xs text-taupe font-body">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-bloom-rose hover:underline">Terms</Link> and{" "}
            <Link href="/privacy-policy" className="text-bloom-rose hover:underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} leftIcon={<UserPlus className="w-4 h-4" />}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-taupe font-body">
          Already have an account?{" "}
          <Link href="/login" className="text-bloom-rose font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
