import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_KEYS = [
  { key: "home", label: "Homepage", path: "/" },
  { key: "shop", label: "Shop", path: "/shop" },
  { key: "about", label: "About", path: "/about" },
  { key: "blog", label: "Blog", path: "/blog" },
  { key: "contact", label: "Contact", path: "/contact" },
];

export default async function SEOPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const seoSettings = await prisma.seoSetting.findMany({
    where: { pageKey: { in: PAGE_KEYS.map((p) => p.key) } },
  });

  const settingsMap: Record<string, typeof seoSettings[0]> = {};
  seoSettings.forEach((s) => { if (s.pageKey) settingsMap[s.pageKey] = s; });

  const topProducts = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    take: 10,
    select: { id: true, name: true, slug: true, seoTitle: true, seoDescription: true },
    orderBy: { isFeatured: "desc" },
  });

  return (
    <div className="flex flex-col">
      <AdminHeader title="SEO Manager" subtitle="Manage page titles, descriptions, and metadata" />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Page SEO */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">Page SEO Settings</h2>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">Page</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">SEO Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">Meta Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {PAGE_KEYS.map((page) => {
                const setting = settingsMap[page.key];
                return (
                  <tr key={page.key} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-charcoal">{page.label}</p>
                      <p className="text-xs text-taupe">{page.path}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-xs ${setting?.title ? "text-charcoal" : "text-taupe italic"}`}>{setting?.title || "Using default"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-xs line-clamp-2 max-w-xs ${setting?.description ? "text-charcoal" : "text-taupe italic"}`}>{setting?.description || "Not set"}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t border-charcoal-100">
            <p className="text-xs text-taupe font-body">💡 To edit page SEO, update the <code className="bg-charcoal-50 px-1.5 py-0.5 rounded">seo_settings</code> table in your Supabase dashboard, or integrate a dedicated SEO edit form here.</p>
          </div>
        </div>

        {/* Product SEO */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <h2 className="font-heading text-base font-semibold text-charcoal px-5 py-4 border-b border-charcoal-100">Product SEO</h2>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">SEO Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">Meta Description</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {topProducts.map((p) => (
                <tr key={p.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-charcoal max-w-[200px] truncate">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <p className={`text-xs ${p.seoTitle ? "text-charcoal" : "text-taupe italic"}`}>{p.seoTitle || "Using product name"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className={`text-xs line-clamp-1 max-w-xs ${p.seoDescription ? "text-charcoal" : "text-taupe italic"}`}>{p.seoDescription || "Not set"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/products/${p.id}/edit`} className="text-xs text-bloom-rose hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical SEO info */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-3">
          <h2 className="font-heading text-base font-semibold text-charcoal">Technical SEO</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sitemap", value: "Auto-generated", status: "OK", link: "/sitemap.xml" },
              { label: "Robots.txt", value: "Auto-generated", status: "OK", link: "/robots.txt" },
              { label: "Structured Data", value: "Product + Organization", status: "OK", link: null },
              { label: "Canonical URLs", value: "Enabled per page", status: "OK", link: null },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-charcoal font-body">{item.label}</p>
                  <p className="text-xs text-taupe font-body">{item.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-body">{item.status}</span>
                  {item.link && (
                    <a href={`${process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"}${item.link}`} target="_blank" rel="noopener noreferrer" className="text-taupe hover:text-bloom-rose transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
