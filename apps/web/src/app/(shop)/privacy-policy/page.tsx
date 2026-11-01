import { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-display-sm text-charcoal">Privacy Policy</h1>
          <p className="text-taupe font-body mt-2">Last updated: November 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-base max-w-none text-taupe font-body [&_h2]:font-heading [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3">
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly, including name, email address, shipping address, and order details when you make a purchase or create an account.</p>
        <h2>How We Use Your Information</h2>
        <p>We use your information to process orders, communicate about your purchases, and improve our services. We do not sell your personal data to third parties.</p>
        <h2>Cookies</h2>
        <p>We use cookies to maintain your session, remember your cart, and improve your browsing experience. You can disable cookies in your browser settings.</p>
        <h2>Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information. All data is transmitted securely via HTTPS.</p>
        <h2>Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:hello@reborndolls.com" className="text-bloom-rose hover:underline">hello@reborndolls.com</a>.</p>
        <h2>Contact</h2>
        <p>For privacy questions, contact us at <a href="mailto:hello@reborndolls.com" className="text-bloom-rose hover:underline">hello@reborndolls.com</a>.</p>
      </div>
    </div>
  );
}
