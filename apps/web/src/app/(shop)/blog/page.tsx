import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@reborn/db";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

export const metadata: Metadata = { title: "Blog — Collecting Guides & Stories", description: "Discover care guides, collecting tips, and behind-the-scenes stories from Reborn Dolls." };
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, author: true, publishedAt: true, tags: true },
  });
  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-soft-blush-50 border-b border-charcoal-100 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Journal</p>
          <h1 className="font-heading text-display-sm text-charcoal">Our Blog</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-taupe font-body text-center py-12">No articles yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:shadow-card transition-shadow">
                <div className="aspect-[16/10] overflow-hidden bg-soft-blush-100">
                  {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
                </div>
                <div className="p-5">
                  {post.tags?.[0] && <span className="text-xs font-semibold text-bloom-rose uppercase tracking-wider font-body">{post.tags[0]}</span>}
                  <h2 className="font-heading text-base font-semibold text-charcoal mt-1 mb-2 group-hover:text-bloom-rose transition-colors line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-taupe font-body line-clamp-2 mb-3">{post.excerpt}</p>}
                  <div className="flex items-center gap-2 text-xs text-taupe font-body">
                    <Clock className="w-3.5 h-3.5" />
                    {post.publishedAt ? formatDate(post.publishedAt) : "Recent"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
