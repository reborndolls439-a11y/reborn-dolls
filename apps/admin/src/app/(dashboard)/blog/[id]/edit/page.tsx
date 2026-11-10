"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { BlogForm } from "@/components/blog/BlogForm";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.post;
        setInitialData({
          title: p.title || "",
          excerpt: p.excerpt || "",
          content: p.content || "",
          featuredImage: p.featuredImage || "",
          status: p.status || "DRAFT",
          tags: (p.tags || []).join(", "),
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
      });
  }, [id]);

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-taupe font-body">Loading…</p>
      </div>
    );
  }

  return <BlogForm postId={id} initialData={initialData} />;
}
