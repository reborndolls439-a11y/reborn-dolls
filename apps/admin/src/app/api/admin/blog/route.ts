import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await request.json();
    const { title, content, excerpt, featuredImage, status, tags, seoTitle, seoDescription } = body;
    if (!title || !content) return NextResponse.json({ error: "Title and content required." }, { status: 400 });

    let slug = slugify(title);
    let attempt = 0;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${slugify(title)}-${attempt}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title, slug, content, excerpt, featuredImage,
        status: status || "DRAFT",
        tags: tags || [],
        seoTitle, seoDescription,
        author: admin.name || admin.email,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed." }, { status: 500 }); }
}
