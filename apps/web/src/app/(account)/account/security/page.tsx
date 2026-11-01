"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { api } from "@/lib/api";
import { toast } from "@/store/uiStore";

export default function SecurityPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = "Current password required.";
    if (form.newPassword.length < 8) errs.newPassword = "New password must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      await api.post("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      setErrors({ currentPassword: err instanceof Error ? err.message : "Failed to update password." });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-charcoal">Security Settings</h1>
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck className="w-5 h-5 text-bloom-rose" />
          <h2 className="font-heading text-base font-semibold text-charcoal">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input label="Current password" type={showPw ? "text" : "password"} value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} required
            rightIcon={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onRightIconClick={() => setShowPw(!showPw)} />
          <Input label="New password" type={showPw ? "text" : "password"} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} required hint="At least 8 characters" />
          <Input label="Confirm new password" type={showPw ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} required />
          <Button type="submit" variant="primary" loading={loading}>Update Password</Button>
        </form>
      </div>
    </div>
  );
}
