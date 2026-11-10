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
  title: "UK UK Reborn Dolls | Where Artistry Comes to Life",
  description:
    "Discover our exquisitely crafted UK UK Reborn Dolls and collectibles. Premium lifelike dolls, silicone dolls, and accessories, all carefully curated and beautifully presented.",
};

export const revalidate = 3600;

async function getHomepageData() {
  const [featuredProducts, newArrivals, blogPosts, categories, heroSetting, storySettings, contentSettings] = await Promise.all([
    // Featured products for the grid
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
    // New arrivals grid
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
    // Blog posts preview
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        featuredImage: true, author: true, publishedAt: true, tags: true,
      },
    }),
    // All active categories (with their images from admin)
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, image: true, description: true },
    }),
    // Admin-selected hero product IDs from store settings
    prisma.storeSetting.findUnique({ where: { key: "hero_product_ids" } }),
    // Story section images
    prisma.storeSetting.findMany({ where: { key: { in: ["story_image_1", "story_image_2"] } } }),
    // All content settings (about + story text)
    prisma.storeSetting.findMany({ where: { key: { in: [
      "story_title", "story_subtitle", "story_content",
      "about_title", "about_subtitle", "about_content", "about_image",
    ] } }),
  ]);

  const mapProduct = (p: typeof featuredProducts[0]): ProductSummary => ({
    id: p.id, name: p.name, slug: p.slug,
    price: parseDecimal(p.price), salePrice: p.salePrice ? parseDecimal(p.salePrice) : null,
    badge: p.badge, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
    stockQuantity: p.stockQuantity, primaryImage: p.images[0]?.url ?? null,
    category: p.category,
  });

  // Try to load admin-selected hero products first
  let heroImages: { url: string; alt: string }[] = [];

  if (heroSetting?.value) {
    try {
      const heroIds: string[] = JSON.parse(heroSetting.value);
      if (heroIds.length > 0) {
        const heroProducts = await prisma.product.findMany({
          where: { id: { in: heroIds }, status: "PUBLISHED" },
          select: {
            id: true, name: true,
            images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
          },
        });
        // Preserve the admin-defined order
        heroImages = heroIds
          .map((id) => heroProducts.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => !!p && !!p.images[0]?.url)
          .map((p) => ({ url: p.images[0].url, alt: p.name }));
      }
    } catch { /* fall through to auto-select */ }
  }

  // Auto-select from featured products if admin hasn't picked any (or not enough)
  if (heroImages.length < 4) {
    const autoProducts = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      take: 4,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        name: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      },
    });
    const autoImages = autoProducts
      .filter((p) => p.images[0]?.url)
      .map((p) => ({ url: p.images[0].url, alt: p.name }));
    // Merge: keep admin picks, fill remaining slots from auto-select
    const existingUrls = new Set(heroImages.map((i) => i.url));
    for (const img of autoImages) {
      if (heroImages.length >= 4) break;
      if (!existingUrls.has(img.url)) heroImages.push(img);
    }
  }

  // Extract story images from settings
  const storyMap = Object.fromEntries((storySettings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
  const contentMap = Object.fromEntries((contentSettings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
  const storyImage1 = storyMap.story_image_1 || undefined;
  const storyImage2 = storyMap.story_image_2 || undefined;

  return {
    featuredProducts: featuredProducts.map(mapProduct),
    newArrivals: newArrivals.map(mapProduct),
    blogPosts,
    categories,
    heroImages,
    storyImage1,
    storyImage2,
    storyTitle: contentMap.story_title,
    storySubtitle: contentMap.story_subtitle,
    storyContent: contentMap.story_content,
  };
}

export default async function HomePage() {
  const { featuredProducts, newArrivals, blogPosts, categories, heroImages, storyImage1, storyImage2, storyTitle, storySubtitle, storyContent } = await getHomepageData();

  return (
    <>
      {/* Hero: uses real product images if available, else falls back to stock photos */}
      <HeroSection images={heroImages.length >= 4 ? heroImages : undefined} />
      <TrustBar />
      {/* Category section: uses real categories and images from admin */}
      <CategorySection categories={categories} />
      <FeaturedProducts
        products={featuredProducts}
        title="Featured Collection"
        subtitle="Our most-loved pieces, handpicked for you"
        viewAllHref="/shop?badge=FEATURED"
        viewAllLabel="View All Featured"
      />
      <StorySection
        image1={storyImage1}
        image2={storyImage2}
        title={storyTitle}
        subtitle={storySubtitle}
        content={storyContent}
      />
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
