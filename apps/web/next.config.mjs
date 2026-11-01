/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type checking is done separately via tsc. Skip the redundant Next.js check.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@reborn/ui", "@reborn/db", "@reborn/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
