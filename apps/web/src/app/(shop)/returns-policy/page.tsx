import { Metadata } from "next";
export const metadata: Metadata = { title: "Returns & Refund Policy" };
export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">Returns & Refund Policy</h1>
          <p className="text-taupe font-body mt-2">Last updated: November 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-base max-w-none text-taupe font-body [&_h2]:font-heading [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3">
        <h2>30-Day Return Policy</h2>
        <p>We want you to be completely satisfied. If you're not happy with your purchase, you may return it within 30 days of delivery for a full refund or exchange.</p>
        <h2>Eligibility</h2>
        <p>Items must be returned in their original, unused condition with all original packaging. Limited edition items and customized pieces are final sale.</p>
        <h2>How to Return</h2>
        <p>Contact us at <a href="mailto:hello@reborndolls.com" className="text-bloom-rose hover:underline">hello@reborndolls.com</a> within 30 days of receiving your order. We'll provide return instructions and a return authorization.</p>
        <h2>Refunds</h2>
        <p>Refunds are processed within 5–7 business days of receiving your returned item. Return shipping costs are the responsibility of the customer unless the item is defective or we made an error.</p>
        <h2>Damaged or Defective Items</h2>
        <p>If your item arrives damaged, contact us immediately with photos and we'll arrange a replacement or full refund at no cost to you.</p>
      </div>
    </div>
  );
}
