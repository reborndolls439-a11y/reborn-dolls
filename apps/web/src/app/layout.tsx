import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Reborn Dolls — Where Artistry Comes to Life",
    template: "%s | Reborn Dolls",
  },
  description:
    "Discover exquisitely crafted reborn dolls and collectibles. Shop our curated collection of lifelike reborn babies, silicone dolls, and premium accessories.",
  keywords: ["reborn dolls", "collectible dolls", "silicone dolls", "reborn babies", "doll accessories"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Reborn Dolls",
    title: "Reborn Dolls — Where Artistry Comes to Life",
    description: "Discover exquisitely crafted reborn dolls and collectibles.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reborn Dolls — Where Artistry Comes to Life",
    description: "Discover exquisitely crafted reborn dolls and collectibles.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ivory text-charcoal antialiased">
        <ToastProvider />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}
