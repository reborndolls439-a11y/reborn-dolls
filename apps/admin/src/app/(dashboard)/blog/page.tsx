import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@reborn/ui";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, status: true, author: true, publishedAt: true, tags: true } });

  return (
    <div className="flex flex-col">
      <AdminHeader title="Blog" subtitle={`${posts.length} articles`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Link href="/blog/new" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-bloom-rose text-white text-sm font-medium font-body hover:bg-bloom-rose-600 transition-colors">
            <Plus className="w-4 h-4" /> New Article
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-charcoal-100 divide-y divide-charcoal-50">
          {posts.length === 0 && <div className="py-10 text-center text-taupe text-sm font-body">No articles yet. Create your first post!</div>}
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal font-body">{post.title}</p>
                <p className="text-xs text-taupe font-body mt-0.5">{post.author} {post.publishedAt && `· ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.publishedAt))}`}</p>
              </div>
              <Badge variant={post.status === "PUBLISHED" ? "success" : "warning"}>{post.status}</Badge>
              <Link href={`/blog/${post.id}/edit`} className="text-xs text-bloom-rose font-semibold hover:underline">Edit</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
