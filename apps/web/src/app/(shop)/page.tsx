import { Metadata } from "next";
import { prisma } from "@reborn/db";
import { parseDecimal } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StorySection } from "@/components/home/StorySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import type { ProductSummary } from "@reborn/types";

export const metadata: Metadata = {
  title: "Reborn Dolls — Where Artistry Comes to Life",
  description:
    "Discover our exquisitely crafted reborn dolls and collectibles. Premium lifelike dolls, silicone dolls, and accessories — all carefully curated and beautifully presented.",
};

export const revalidate = 3600; // revalidate every hour

async function getHomepageData() {
  const [featuredProducts, newArrivals, blogPosts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      take: 8,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true,
        badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isNewArrival: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true,
        badge: true, isFeatured: true, isNewArrival: true, stockQuantity: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        featuredImage: true, author: true, publishedAt: true, tags: true,
      },
    }),
  ]);

  const mapProduct = (p: typeof featuredProducts[0]): ProductSummary => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseDecimal(p.price),
    salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge,
    isFeatured: p.isFeatured,
    isNewArrival: p.isNewArrival,
    stockQuantity: p.stockQuantity,
    primaryImage: p.images[0]?.url ?? null,
    category: p.category,
  });

  return {
    featuredProducts: featuredProducts.map(mapProduct),
    newArrivals: newArrivals.map(mapProduct),
    blogPosts,
  };
}

export default async function HomePage() {
  const { featuredProducts, newArrivals, blogPosts } = await getHomepageData();

  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategorySection />
      <FeaturedProducts
        products={featuredProducts}
        title="Featured Collection"
        subtitle="Our most-loved pieces, handpicked for you"
        viewAllHref="/shop?badge=FEATURED"
        viewAllLabel="View All Featured"
      />
      <StorySection />
      {newArrivals.length > 0 && (
        <FeaturedProducts
          products={newArrivals}
          title="New Arrivals"
          subtitle="The latest additions to our collection"
          viewAllHref="/new-arrivals"
          viewAllLabel="View All New Arrivals"
        />
      )}
      <TestimonialsSection />
      <BlogPreview posts={blogPosts} />
      <NewsletterSection />
    </>
  );
}
