import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@reborn/types";

interface BlogPreviewProps {
  posts: Pick<BlogPost, "id" | "title" | "slug" | "excerpt" | "featuredImage" | "author" | "publishedAt" | "tags">[];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  if (!posts.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-2">Journal</p>
            <h2 className="font-heading text-display-sm text-charcoal">From the Blog</h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-sm text-bloom-rose font-medium hover:gap-3 transition-all font-body"
          >
            All articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-soft-blush-100 mb-5">
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-brand" />
                )}
              </div>
              <div>
                {post.tags?.[0] && (
                  <span className="text-xs font-semibold text-bloom-rose uppercase tracking-wider font-body">
                    {post.tags[0]}
                  </span>
                )}
                <h3 className="font-heading text-lg font-semibold text-charcoal mt-1 mb-2 group-hover:text-bloom-rose transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-taupe font-body leading-relaxed line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-taupe font-body">
                  <Clock className="w-3.5 h-3.5" />
                  {post.publishedAt
                    ? formatDate(post.publishedAt)
                    : "Recent"}{" "}
                  · {post.author}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
