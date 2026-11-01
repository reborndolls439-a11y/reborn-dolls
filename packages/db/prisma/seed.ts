import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@reborndolls.com" },
    update: {},
    create: {
      email: "admin@reborndolls.com",
      password: hashedPassword,
      name: "Store Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "reborn-dolls" },
      update: {},
      create: {
        name: "Reborn Dolls",
        slug: "reborn-dolls",
        description: "Lifelike, hand-crafted reborn baby dolls with exceptional detail and artistry.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "silicone-dolls" },
      update: {},
      create: {
        name: "Silicone Dolls",
        slug: "silicone-dolls",
        description: "Premium full-silicone collectible dolls with breathtakingly realistic features.",
        image: "https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=600",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "cuddle-babies" },
      update: {},
      create: {
        name: "Cuddle Babies",
        slug: "cuddle-babies",
        description: "Soft, weighted cuddle babies perfect for comfort and companionship.",
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "doll-clothing" },
      update: {},
      create: {
        name: "Doll Clothing",
        slug: "doll-clothing",
        description: "Beautifully crafted outfits and accessories for your precious collectibles.",
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: {
        name: "Accessories",
        slug: "accessories",
        description: "Carefully selected accessories to enhance your doll collection.",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600",
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "limited-edition" },
      update: {},
      create: {
        name: "Limited Edition",
        slug: "limited-edition",
        description: "Exclusive limited-run collectibles for the discerning collector.",
        image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600",
        sortOrder: 6,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  const [rebornCat, siliconeCat, cuddleCat, clothingCat, accessoriesCat, limitedCat] = categories;

  // ─── Products ─────────────────────────────────────────────────────────────
  const mockProducts = [
    {
      name: "Aurora Reborn Baby Girl",
      slug: "aurora-reborn-baby-girl",
      shortDescription: "An exquisitely painted reborn baby girl with hand-rooted mohair hair.",
      description: `<p>Meet Aurora — a breathtakingly lifelike reborn baby girl created by skilled artisans. Every inch of Aurora has been painted with multiple layers of Genesis heat-set paints to achieve a remarkably realistic skin tone with subtle shading, veining, and rosy cheeks.</p>
      <p>Aurora features hand-rooted premium mohair in a soft honey-brown shade, meticulously inserted hair by hair. Her glass eyes sparkle with depth and authenticity, capturing that precious newborn gaze.</p>
      <p>This beautiful doll comes dressed in a hand-selected outfit and arrives in a beautiful gift box, making her the perfect addition to any collection or a treasured gift.</p>`,
      price: 289.99,
      salePrice: null,
      sku: "RD-AURORA-001",
      status: "PUBLISHED" as const,
      badge: "FEATURED" as const,
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 8,
      categoryId: rebornCat.id,
      materials: "Vinyl, mohair, glass eyes, weighted body",
      dimensions: '19" length, 5 lbs weight',
      whatsIncluded: "Doll, outfit, blanket, magnetic pacifier, certificate of authenticity",
      careInstructions: "Spot clean only. Keep away from direct sunlight. Store at room temperature.",
      tags: ["reborn", "baby girl", "featured", "mohair"],
      images: [
        { url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800", alt: "Aurora Reborn Baby Girl front view", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800", alt: "Aurora Reborn Baby Girl detail", isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: "Oliver Reborn Baby Boy",
      slug: "oliver-reborn-baby-boy",
      shortDescription: "A precious reborn baby boy with soft brown hair and dreamy sleeping features.",
      description: `<p>Oliver is a beautifully crafted reborn baby boy with peacefully sleeping features. Painted with extraordinary care and skill, his delicate skin tones, tiny fingernails, and subtle facial expressions make him truly one-of-a-kind.</p>
      <p>With his soft-weighted body and carefully rooted hair, Oliver feels wonderfully natural to hold. He comes ready to take home in a charming boy's outfit and presentation box.</p>`,
      price: 249.99,
      salePrice: 219.99,
      sku: "RD-OLIVER-001",
      status: "PUBLISHED" as const,
      badge: "SALE" as const,
      isFeatured: true,
      isNewArrival: false,
      stockQuantity: 5,
      categoryId: rebornCat.id,
      materials: "Vinyl, mohair, weighted soft body",
      dimensions: '18" length, 4.5 lbs weight',
      whatsIncluded: "Doll, boy's outfit, hat, pacifier",
      careInstructions: "Spot clean only. Keep away from direct sunlight.",
      tags: ["reborn", "baby boy", "sale"],
      images: [
        { url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", alt: "Oliver Reborn Baby Boy", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Seraphina Full-Body Silicone Doll",
      slug: "seraphina-full-body-silicone",
      shortDescription: "A museum-quality full-silicone collectible with unmatched realistic detail.",
      description: `<p>Seraphina represents the pinnacle of reborn artistry — a full-body platinum silicone doll that blurs the line between art and reality. Her skin texture, weight, and feel are astonishingly lifelike, with every tiny pore, crease, and capillary detail rendered with extraordinary skill.</p>
      <p>Seraphina is a true collector's piece, limited in availability and unmatched in quality. She is displayed in a satin-lined presentation case and comes with a signed certificate of authenticity.</p>`,
      price: 599.99,
      salePrice: null,
      sku: "SD-SERAPH-001",
      status: "PUBLISHED" as const,
      badge: "LIMITED" as const,
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 3,
      categoryId: siliconeCat.id,
      materials: "Platinum silicone, glass eyes, hand-rooted hair",
      dimensions: '20" length, 6 lbs weight',
      whatsIncluded: "Doll, satin presentation case, clothing set, certificate of authenticity",
      careInstructions: "Wipe clean with damp cloth. Avoid harsh chemicals. Handle with care.",
      tags: ["silicone", "premium", "limited edition", "collector"],
      images: [
        { url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800", alt: "Seraphina Silicone Doll", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1567304621040-52cef0db1d46?w=800", alt: "Seraphina detail view", isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: "Bella Cuddle Baby",
      slug: "bella-cuddle-baby",
      shortDescription: "A soft, weighted cuddle baby designed for comfort and emotional wellbeing.",
      description: `<p>Bella is our most beloved cuddle baby — thoughtfully designed to provide genuine comfort and companionship. With a soft, huggable body, gentle weighted filling, and sweet painted features, Bella brings warmth to those who hold her.</p>
      <p>Bella is particularly cherished by collectors, therapy professionals, and anyone who simply appreciates the comfort of holding a beautifully crafted baby doll.</p>`,
      price: 149.99,
      salePrice: null,
      sku: "CB-BELLA-001",
      status: "PUBLISHED" as const,
      badge: "NEW" as const,
      isFeatured: false,
      isNewArrival: true,
      stockQuantity: 15,
      categoryId: cuddleCat.id,
      materials: "Soft cloth body, vinyl face and hands, glass bead filling",
      dimensions: '17" length, 3.5 lbs weight',
      whatsIncluded: "Doll, outfit, pacifier",
      careInstructions: "Spot clean fabric body. Wipe vinyl parts with damp cloth.",
      tags: ["cuddle baby", "therapy", "comfort", "new arrival"],
      images: [
        { url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800", alt: "Bella Cuddle Baby", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Luna Limited Edition Reborn",
      slug: "luna-limited-edition-reborn",
      shortDescription: "An extraordinary limited-edition reborn with exclusive hand-painted details.",
      description: `<p>Luna is an exclusive limited-edition reborn created in a run of only 10 pieces worldwide. Each Luna doll features unique hand-painted details that make her entirely one-of-a-kind, no two being exactly alike.</p>
      <p>Luna's creation required over 60 hours of meticulous artistry. She represents the absolute highest expression of reborn craftsmanship and is intended for serious collectors who appreciate truly exceptional pieces.</p>`,
      price: 899.99,
      salePrice: null,
      sku: "LE-LUNA-001",
      status: "PUBLISHED" as const,
      badge: "LIMITED" as const,
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 2,
      categoryId: limitedCat.id,
      materials: "Premium vinyl, Tibetan lamb hair, glass eyes, weighted body",
      dimensions: '21" length, 6.5 lbs weight',
      whatsIncluded: "Doll, exclusive outfit, satin gift box, numbered certificate, artist signature",
      careInstructions: "Professional care recommended. Keep in display case away from UV light.",
      tags: ["limited edition", "exclusive", "collector", "premium"],
      images: [
        { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800", alt: "Luna Limited Edition", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", alt: "Luna detail", isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: "Classic Newborn Outfit Set — Pink Rose",
      slug: "classic-newborn-outfit-pink-rose",
      shortDescription: "A beautiful 5-piece newborn outfit set in delicate pink rose cotton.",
      description: `<p>This stunning 5-piece outfit set is expertly tailored from premium 100% organic cotton in a delicate pink rose colorway. Designed to fit most 18–20" reborn dolls, each piece is finished with thoughtful details including embroidered accents and pearl buttons.</p>
      <p>The set includes a onesie, dress, headband, socks, and swaddle blanket — everything needed to dress your precious doll in style.</p>`,
      price: 49.99,
      salePrice: 39.99,
      sku: "CL-OUTFIT-PR-001",
      status: "PUBLISHED" as const,
      badge: "SALE" as const,
      isFeatured: false,
      isNewArrival: false,
      stockQuantity: 25,
      categoryId: clothingCat.id,
      materials: "100% organic cotton, pearl buttons",
      dimensions: "Fits 18–20\" reborn dolls",
      whatsIncluded: "Onesie, dress, headband, socks, swaddle blanket",
      careInstructions: "Hand wash cold. Lay flat to dry.",
      tags: ["clothing", "outfit", "pink", "cotton"],
      images: [
        { url: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800", alt: "Pink Rose Outfit Set", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Magnetic Pacifier Set (5-Pack)",
      slug: "magnetic-pacifier-set-5-pack",
      shortDescription: "High-quality magnetic pacifiers compatible with most reborn vinyl dolls.",
      description: `<p>These premium magnetic pacifiers are designed specifically for reborn dolls. Each pacifier features a strong magnetic attachment that stays securely in place while looking completely natural. Available in multiple colors.</p>
      <p>Made from baby-safe materials with non-toxic paint finishes.</p>`,
      price: 18.99,
      salePrice: null,
      sku: "ACC-PACIFIER-5PK",
      status: "PUBLISHED" as const,
      badge: null,
      isFeatured: false,
      isNewArrival: false,
      stockQuantity: 50,
      categoryId: accessoriesCat.id,
      materials: "BPA-free plastic, non-toxic paint, rare earth magnets",
      dimensions: "Standard newborn size, fits most reborn vinyl kits",
      whatsIncluded: "5 magnetic pacifiers in assorted colors",
      careInstructions: "Wipe clean with damp cloth.",
      tags: ["accessories", "pacifier", "magnetic"],
      images: [
        { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800", alt: "Magnetic Pacifier Set", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Sophia Reborn Toddler Girl",
      slug: "sophia-reborn-toddler-girl",
      shortDescription: "A beautifully detailed reborn toddler with flowing hair and curious expression.",
      description: `<p>Sophia is a stunning reborn toddler girl who captures that precious stage between babyhood and early childhood. With her bright, curious eyes and gentle smile, Sophia brings joy to every room she's displayed in.</p>
      <p>Her long, silky rooted hair is hand-applied and styled, and her detailed skin painting includes subtle freckles, rosy cheeks, and lifelike fingernails. Sophia is dressed in a charming floral toddler outfit.</p>`,
      price: 349.99,
      salePrice: null,
      sku: "RD-SOPHIA-001",
      status: "PUBLISHED" as const,
      badge: "NEW" as const,
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 6,
      categoryId: rebornCat.id,
      materials: "Vinyl, hand-rooted nylon hair, glass eyes, weighted body",
      dimensions: '24" height, 8 lbs weight',
      whatsIncluded: "Doll, floral outfit, shoes, headband, certificate of authenticity",
      careInstructions: "Spot clean only. Style hair gently with doll brush.",
      tags: ["reborn", "toddler", "girl", "new arrival"],
      images: [
        { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800", alt: "Sophia Reborn Toddler Girl", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", alt: "Sophia side view", isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: "Weighted Sleep Sack — Ivory Fleece",
      slug: "weighted-sleep-sack-ivory-fleece",
      shortDescription: "A luxuriously soft weighted sleep sack for your reborn doll.",
      description: `<p>Keep your precious reborn cozy and comfortable in this luxuriously soft ivory fleece sleep sack. Gently weighted to give an authentic feel, this sleep sack fits most 18–22" reborn dolls and features a secure zip closure and embroidered accent.</p>`,
      price: 34.99,
      salePrice: null,
      sku: "ACC-SLEEPSACK-IV",
      status: "PUBLISHED" as const,
      badge: null,
      isFeatured: false,
      isNewArrival: true,
      stockQuantity: 20,
      categoryId: accessoriesCat.id,
      materials: "100% fleece, glass bead fill",
      dimensions: "Fits 18–22\" reborn dolls",
      whatsIncluded: "Sleep sack",
      careInstructions: "Hand wash cold. Air dry.",
      tags: ["accessories", "sleep sack", "weighted"],
      images: [
        { url: "https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=800", alt: "Ivory Fleece Sleep Sack", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Ethan Reborn Baby Boy — Awake",
      slug: "ethan-reborn-baby-boy-awake",
      shortDescription: "A wide-eyed, alert reborn baby boy with stunning blue glass eyes.",
      description: `<p>Ethan is a wide-awake reborn baby boy with captivating deep blue glass eyes that seem to follow you around the room. His alert, curious expression is completely endearing and makes him one of the most photographed dolls in our collection.</p>
      <p>Painted with extraordinary skill and attention to detail, Ethan features realistic skin tones with subtle mottling, carefully shaped fingernails, and hand-rooted platinum blond hair.</p>`,
      price: 299.99,
      salePrice: null,
      sku: "RD-ETHAN-001",
      status: "PUBLISHED" as const,
      badge: "FEATURED" as const,
      isFeatured: true,
      isNewArrival: false,
      stockQuantity: 4,
      categoryId: rebornCat.id,
      materials: "Vinyl, mohair, blue glass eyes, weighted body",
      dimensions: '19" length, 5 lbs weight',
      whatsIncluded: "Doll, boy's outfit, blanket, magnetic pacifier",
      careInstructions: "Spot clean only. Avoid direct sunlight to preserve eye color.",
      tags: ["reborn", "baby boy", "awake", "blue eyes"],
      images: [
        { url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", alt: "Ethan Reborn Baby Boy", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Doll Display Stand — Adjustable",
      slug: "doll-display-stand-adjustable",
      shortDescription: "An elegant adjustable display stand for showcasing your reborn collection.",
      description: `<p>Display your precious reborn dolls in style with this elegant adjustable stand. Crafted from powder-coated steel with a champagne finish, this stand accommodates most dolls from 14" to 24" and provides secure, stable support without causing any pressure marks.</p>`,
      price: 27.99,
      salePrice: 22.99,
      sku: "ACC-STAND-ADJ",
      status: "PUBLISHED" as const,
      badge: "SALE" as const,
      isFeatured: false,
      isNewArrival: false,
      stockQuantity: 35,
      categoryId: accessoriesCat.id,
      materials: "Powder-coated steel, champagne finish",
      dimensions: "Adjustable 14–24\", base diameter 8\"",
      whatsIncluded: "Display stand, assembly instructions",
      careInstructions: "Wipe clean with dry cloth.",
      tags: ["accessories", "display", "stand"],
      images: [
        { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800", alt: "Adjustable Display Stand", isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: "Grace Full-Silicone Newborn",
      slug: "grace-full-silicone-newborn",
      shortDescription: "A breathtakingly realistic full-silicone newborn with astonishing detail.",
      description: `<p>Grace is a masterpiece of silicone artistry — a full-body platinum silicone newborn with an extraordinarily realistic appearance and feel. Every detail, from her tiny wrinkled fingers to her delicately veined eyelids, has been crafted with obsessive attention to realism.</p>
      <p>Grace is weighted and posed to rest naturally in your arms, just like a real sleeping newborn. She is one of our most sought-after pieces and typically sells within days of becoming available.</p>`,
      price: 749.99,
      salePrice: null,
      sku: "SD-GRACE-001",
      status: "PUBLISHED" as const,
      badge: "LIMITED" as const,
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 1,
      categoryId: siliconeCat.id,
      materials: "Platinum silicone, hand-rooted mohair, glass eyes",
      dimensions: '18" length, 5.5 lbs weight',
      whatsIncluded: "Doll, newborn outfit, premium presentation box, certificate of authenticity",
      careInstructions: "Gentle clean with baby soap and warm water. Pat dry. Dust with cornstarch to maintain texture.",
      tags: ["silicone", "newborn", "premium", "limited"],
      images: [
        { url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800", alt: "Grace Full Silicone Newborn", isPrimary: true, sortOrder: 0 },
      ],
    },
  ];

  for (const productData of mockProducts) {
    const { images, ...data } = productData;
    
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        price: data.price,
        salePrice: data.salePrice ?? undefined,
        images: {
          create: images.map((img) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        },
      },
    });
    console.log(`  ✅ Product: ${product.name}`);
  }

  // ─── Store Settings ───────────────────────────────────────────────────────
  const storeSettings = [
    { key: "store_name", value: "Reborn Dolls" },
    { key: "store_tagline", value: "Where Artistry Comes to Life." },
    { key: "store_email", value: "hello@reborndolls.com" },
    { key: "store_phone", value: "+1 (555) 000-0000" },
    { key: "store_address", value: "123 Artisan Lane, Collectible City, CA 90210" },
    { key: "currency", value: "USD" },
    { key: "currency_symbol", value: "$" },
    { key: "free_shipping_threshold", value: "150" },
    { key: "default_shipping_cost", value: "9.99" },
    { key: "admin_email", value: "admin@reborndolls.com" },
    { key: "social_instagram", value: "https://instagram.com/reborndolls" },
    { key: "social_facebook", value: "https://facebook.com/reborndolls" },
    { key: "social_pinterest", value: "https://pinterest.com/reborndolls" },
    { key: "returns_policy_days", value: "30" },
    { key: "low_stock_alert_threshold", value: "5" },
  ];

  for (const setting of storeSettings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Store settings seeded");

  // ─── Sample Blog Posts ────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: "How to Care for Your Reborn Doll",
      slug: "how-to-care-for-your-reborn-doll",
      excerpt: "Keep your precious reborn doll looking its best with our comprehensive care guide.",
      content: "<p>Your reborn doll is a treasured work of art that deserves proper care and attention. Follow these guidelines to keep your doll in pristine condition for years to come...</p>",
      featuredImage: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800",
      author: "Reborn Dolls Team",
      status: "PUBLISHED" as const,
      tags: ["care", "guide", "tips"],
      publishedAt: new Date("2026-10-15"),
    },
    {
      title: "The Art of Reborn Doll Collecting",
      slug: "the-art-of-reborn-doll-collecting",
      excerpt: "Discover what makes reborn dolls so special and why collectors around the world treasure them.",
      content: "<p>Reborn dolls represent the intersection of fine art, craftsmanship, and emotional connection. In this guide, we explore the history and artistry behind these extraordinary collectibles...</p>",
      featuredImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
      author: "Reborn Dolls Team",
      status: "PUBLISHED" as const,
      tags: ["collecting", "art", "guide"],
      publishedAt: new Date("2026-10-20"),
    },
    {
      title: "Gift Guide: Finding the Perfect Reborn Doll",
      slug: "gift-guide-finding-perfect-reborn-doll",
      excerpt: "Not sure which doll to choose as a gift? Our expert guide makes the selection process easy.",
      content: "<p>Giving a reborn doll as a gift is a beautiful gesture that will be remembered for a lifetime. This guide helps you choose the perfect doll for any recipient...</p>",
      featuredImage: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800",
      author: "Reborn Dolls Team",
      status: "PUBLISHED" as const,
      tags: ["gift guide", "buying guide"],
      publishedAt: new Date("2026-10-28"),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ ${blogPosts.length} blog posts created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────");
  console.log("Admin Login:");
  console.log("  Email:    admin@reborndolls.com");
  console.log("  Password: Admin@123456");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
