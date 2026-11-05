import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";

function pd(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function") return (v as { toNumber: () => number }).toNumber();
  return 0;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        additionalCategories: { select: { id: true } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);

  if (!product) notFound();

  const initialData = {
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription || "",
    price: pd(product.price).toString(),
    salePrice: product.salePrice ? pd(product.salePrice).toString() : "",
    sku: product.sku || "",
    categoryId: product.categoryId || "",
    additionalCategoryIds: product.additionalCategories.map((c) => c.id),
    status: product.status,
    badge: product.badge || "",
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    stockQuantity: product.stockQuantity.toString(),
    lowStockThreshold: product.lowStockThreshold.toString(),
    materials: product.materials || "",
    dimensions: product.dimensions || "",
    weight: product.weight || "",
    whatsIncluded: product.whatsIncluded || "",
    careInstructions: product.careInstructions || "",
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
    tags: product.tags.join(", "),
    images: product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt || "", isPrimary: img.isPrimary })),
  };

  return <ProductForm productId={id} initialData={initialData} categories={categories} />;
}
