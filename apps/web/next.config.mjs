/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ─── Performance ────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  transpilePackages: ["@reborn/ui", "@reborn/db", "@reborn/types"],

  images: {
    // Serve optimised WebP/AVIF automatically
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 7 days
    minimumCacheTTL: 604800,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "images.reborns.com" },
      { protocol: "https", hostname: "reborns.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Cache Next.js static chunks for 1 year
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    // Optimise server components
    optimizePackageImports: ["lucide-react", "@reborn/ui"],
  },
};

export default nextConfig;
