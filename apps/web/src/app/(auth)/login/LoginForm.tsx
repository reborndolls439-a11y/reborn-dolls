"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "@/store/uiStore";
import type { User } from "@reborn/types";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post<{ user: User }>("/auth/login", form);
      setUser(data.user);
      toast.success("Welcome back!", data.user.name || data.user.email);
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-bloom-rose flex items-center justify-center">
            <span className="text-white font-bold font-heading">R</span>
          </div>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-charcoal">Welcome Back</h1>
        <p className="text-sm text-taupe font-body mt-1">Sign in to your account</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body" role="alert">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          required
          autoComplete="current-password"
          rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-bloom-rose hover:underline font-body">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-taupe font-body">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-bloom-rose font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
