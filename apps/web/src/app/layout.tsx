import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { VisitorTracker } from "@/components/shared/VisitorTracker";

export const metadata: Metadata = {
  title: {
    default: "UK UK Reborn Dolls | Where Artistry Comes to Life",
    template: "%s | UK UK Reborn Dolls",
  },
  description:
    "Discover exquisitely crafted UK UK Reborn Dolls and collectibles. Shop our curated collection of lifelike reborn babies, silicone dolls, and premium accessories.",
  keywords: ["UK UK Reborn Dolls", "collectible dolls", "silicone dolls", "reborn babies", "doll accessories"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "UK UK Reborn Dolls",
    title: "UK UK Reborn Dolls | Where Artistry Comes to Life",
    description: "Discover exquisitely crafted UK UK Reborn Dolls and collectibles.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UK UK Reborn Dolls | Where Artistry Comes to Life",
    description: "Discover exquisitely crafted UK UK Reborn Dolls and collectibles.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
      <body suppressHydrationWarning>
        {/* defaultTheme="dark" — dark is the primary experience, user can switch to light */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <VisitorTracker />
          <ToastProvider />
          <CartDrawer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
