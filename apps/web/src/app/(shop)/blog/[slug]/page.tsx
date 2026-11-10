import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@reborn/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 0; // Always fetch fresh — edits show immediately
import { Clock, ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, status: "PUBLISHED" }, select: { title: true, seoTitle: true, seoDescription: true, excerpt: true, featuredImage: true } });
  if (!post) return { title: "Article Not Found" };
  return { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, openGraph: { images: post.featuredImage ? [post.featuredImage] : [] } };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, status: "PUBLISHED" } });
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-taupe hover:text-bloom-rose transition-colors font-body mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        {post.tags?.[0] && <span className="text-xs font-semibold text-bloom-rose uppercase tracking-wider font-body">{post.tags[0]}</span>}
        <h1 className="font-heading text-display-sm text-charcoal mt-2 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-taupe font-body mb-8">
          <span>By {post.author}</span>
          <span>·</span>
          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.publishedAt ? formatDate(post.publishedAt) : ""}</div>
        </div>
        {post.featuredImage && (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-10">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="prose prose-base max-w-none text-taupe font-body leading-relaxed [&_h2]:font-heading [&_h2]:text-charcoal [&_h3]:font-heading [&_h3]:text-charcoal [&_a]:text-bloom-rose [&_strong]:text-charcoal" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-12 pt-8 border-t border-charcoal-100">
          <Link href="/blog" className="text-sm text-bloom-rose font-semibold font-body hover:underline">← More Articles</Link>
        </div>
      </div>
    </div>
  );
}
