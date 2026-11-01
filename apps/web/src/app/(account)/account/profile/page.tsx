"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "@/store/uiStore";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.patch<{ user: typeof user }>("/auth/profile", form);
      if (data.user) setUser(data.user);
      toast.success("Profile updated successfully");
    } catch { toast.error("Failed to update profile"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-charcoal">Profile Settings</h1>
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email address" value={user?.email || ""} disabled hint="Email cannot be changed." />
          <Input label="Phone number (optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
