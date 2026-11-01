import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";

export default async function NewProductPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { isActive: true }, orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return <ProductForm categories={categories} />;
}
