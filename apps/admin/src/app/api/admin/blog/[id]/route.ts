import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const body = await request.json();

    // Explicitly map only known fields — never spread unknown payload into Prisma
    const {
      title, content, excerpt, featuredImage, status,
      tags, seoTitle, seoDescription, author,
    } = body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(featuredImage !== undefined && { featuredImage: featuredImage || null }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags)
            ? tags
            : String(tags).split(",").map((t: string) => t.trim()).filter(Boolean),
        }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
        ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
        ...(author !== undefined && { author }),
        // Set publishedAt when first publishing
        ...(status === "PUBLISHED" && { publishedAt: new Date() }),
        ...(status === "DRAFT" && { publishedAt: null }),
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (e) {
    console.error("[BLOG_UPDATE]", e);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[BLOG_DELETE]", e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
