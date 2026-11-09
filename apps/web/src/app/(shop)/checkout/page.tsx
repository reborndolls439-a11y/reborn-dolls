"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { Button, Input } from "@reborn/ui";
import { useCartStore, useCartSubtotal } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/store/uiStore";

type Step = "contact" | "shipping" | "review";

interface CheckoutForm {
  email: string; firstName: string; lastName: string; phone: string;
  line1: string; line2: string; city: string; state: string; postalCode: string; country: string;
  notes: string;
}

const FREE_SHIPPING = 150;
const SHIPPING_COST = 9.99;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const subtotal = useCartSubtotal();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || "", firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", notes: "",
  });

  const set = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required.";
    if (!form.firstName) e.firstName = "First name is required.";
    if (!form.lastName) e.lastName = "Last name is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!form.line1) e.line1 = "Address is required.";
    if (!form.city) e.city = "City is required.";
    if (!form.state) e.state = "State is required.";
    if (!form.postalCode) e.postalCode = "Postal code is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = () => {
    if (step === "contact" && validateContact()) setStep("shipping");
    else if (step === "shipping" && validateShipping()) setStep("review");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId, productName: i.name, productImage: i.image,
        price: i.salePrice ?? i.price, quantity: i.quantity, subtotal: (i.salePrice ?? i.price) * i.quantity,
      }));
      const data = await api.post<{ order: { id: string; orderNumber: string } }>("/orders", {
        items: orderItems,
        shippingAddress: { firstName: form.firstName, lastName: form.lastName, line1: form.line1, line2: form.line2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country, phone: form.phone },
        guestEmail: user ? undefined : form.email,
        guestName: user ? undefined : `${form.firstName} ${form.lastName}`,
        guestPhone: user ? undefined : form.phone,
        subtotal, shippingCost, tax: 0, total, notes: form.notes,
      });
      clearCart();
      toast.success("Order placed!", `Order #${data.order.orderNumber} confirmed.`);
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err: unknown) {
      toast.error("Order failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-charcoal mb-3">Your cart is empty</h1>
          <Link href="/shop"><Button variant="primary">Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bloom-rose flex items-center justify-center">
              <span className="text-white text-xs font-bold font-heading">R</span>
            </div>
            <span className="font-heading text-lg font-bold text-charcoal">Reborn Dolls</span>
          </Link>
          <div className="flex items-center gap-1 text-xs font-body">
            {(["contact", "shipping", "review"] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <span className="text-taupe-300 mx-1">›</span>}
                <span className={step === s ? "text-bloom-rose font-semibold" : step > s ? "text-charcoal" : "text-taupe"}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 border border-charcoal-100">
            {step === "contact" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-charcoal">Contact Information</h2>
                <Input label="Email address" type="email" value={form.email} onChange={set("email")} error={errors.email} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} required />
                  <Input label="Last name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} required />
                </div>
                <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={handleNext}>Continue to Shipping</Button>
              </div>
            )}

            {step === "shipping" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-charcoal">Shipping Address</h2>
                <Input label="Address line 1" value={form.line1} onChange={set("line1")} error={errors.line1} required />
                <Input label="Apartment, suite, etc. (optional)" value={form.line2} onChange={set("line2")} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={form.city} onChange={set("city")} error={errors.city} required />
                  <Input label="State / Province" value={form.state} onChange={set("state")} error={errors.state} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Postal code" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} required />
                  <Input label="Country" value={form.country} onChange={set("country")} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep("contact")}>Back</Button>
                  <Button variant="primary" size="lg" className="flex-1" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={handleNext}>Review Order</Button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-semibold text-charcoal">Review Your Order</h2>
                <div className="grid grid-cols-2 gap-4 text-sm font-body">
                  <div className="bg-charcoal-50 rounded-2xl p-4">
                    <p className="font-semibold text-charcoal mb-1">Contact</p>
                    <p className="text-taupe">{form.email}</p>
                    <p className="text-taupe">{form.firstName} {form.lastName}</p>
                  </div>
                  <div className="bg-charcoal-50 rounded-2xl p-4">
                    <p className="font-semibold text-charcoal mb-1">Ship to</p>
                    <p className="text-taupe">{form.line1}</p>
                    <p className="text-taupe">{form.city}, {form.state} {form.postalCode}</p>
                    <p className="text-taupe">{form.country}</p>
                  </div>
                </div>

                <div className="bg-bloom-rose-50 rounded-2xl p-5 border border-bloom-rose-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-bloom-rose" />
                    <p className="text-sm font-semibold text-charcoal font-body">Payment on Order Confirmation</p>
                  </div>
                  <p className="text-sm text-taupe font-body leading-relaxed">
                    After you place your order, we'll contact you via email to arrange payment and confirm all details before fulfillment. Your order is not charged automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal font-body mb-1.5">Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special requests or gift messages…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep("shipping")}>Back</Button>
                  <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={handlePlaceOrder}>
                    Place Order {formatPrice(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-charcoal-100">
              <h3 className="font-heading text-base font-semibold text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-soft-blush-100">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bloom-rose text-white text-xs rounded-full flex items-center justify-center font-body">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal font-body line-clamp-2">{item.name}</p>
                    </div>
                    <p className="text-xs font-semibold text-charcoal font-body shrink-0">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-charcoal-100 pt-4 text-sm font-body">
                <div className="flex justify-between text-taupe"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-taupe">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-charcoal-100 text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-taupe font-body justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure and private, your data is protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
