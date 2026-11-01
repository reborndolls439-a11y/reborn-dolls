import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 9;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip, take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          featuredImage: true, author: true, publishedAt: true, tags: true,
        },
      }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({
      posts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
