/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@reborn/ui", "@reborn/db", "@reborn/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
