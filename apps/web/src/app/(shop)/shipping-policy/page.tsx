import { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping Policy" };
export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">Shipping Policy</h1>
          <p className="text-taupe font-body mt-2">Last updated: November 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-base max-w-none text-taupe font-body [&_h2]:font-heading [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3">
        <h2>Free Shipping</h2>
        <p>We offer free standard shipping on all orders over $150. Orders under $150 are shipped for a flat rate of $9.99.</p>
        <h2>Delivery Times</h2>
        <p>Standard orders typically arrive within 5–10 business days. We'll send you a tracking number as soon as your order ships.</p>
        <h2>Packaging</h2>
        <p>Every order is carefully packaged to ensure your doll arrives in perfect condition. We use protective wrapping, custom inserts, and sturdy outer boxes.</p>
        <h2>International Shipping</h2>
        <p>We currently ship within the United Kingdom. International shipping availability varies, please contact us for inquiries.</p>
        <h2>Questions?</h2>
        <p>Contact us at <a href="mailto:hello@reborndolls.com" className="text-bloom-rose hover:underline">hello@reborndolls.com</a> and we'll be happy to help.</p>
      </div>
    </div>
  );
}
