import { Metadata } from "next";
export const metadata: Metadata = { title: "Terms & Conditions" };
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">Terms & Conditions</h1>
          <p className="text-taupe font-body mt-2">Last updated: November 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-base max-w-none text-taupe font-body [&_h2]:font-heading [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3">
        <h2>Use of the Website</h2>
        <p>By using this website, you agree to these terms. The site is intended for personal, non-commercial use. You may not use it for unlawful purposes.</p>
        <h2>Products & Pricing</h2>
        <p>All prices are in USD and subject to change without notice. We reserve the right to limit quantities and refuse orders at our discretion.</p>
        <h2>Intellectual Property</h2>
        <p>All content on this website, including images, text, and design, is owned by Reborn Dolls. You may not reproduce or distribute it without written permission.</p>
        <h2>Limitation of Liability</h2>
        <p>Reborn Dolls is not liable for any indirect, incidental, or consequential damages arising from use of the website or products.</p>
        <h2>Governing Law</h2>
        <p>These terms are governed by the laws of the United States. Disputes will be resolved through binding arbitration.</p>
        <h2>Contact</h2>
        <p>Questions about these terms? Email us at <a href="mailto:hello@reborndolls.com" className="text-bloom-rose hover:underline">hello@reborndolls.com</a>.</p>
      </div>
    </div>
  );
}
