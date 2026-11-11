import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.seoSetting.findMany({
    where: { entityType: "page" },
    orderBy: { pageKey: "asc" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { pageKey, title, description, ogTitle, ogDescription, ogImage, canonicalUrl } =
      await request.json();

    if (!pageKey) return NextResponse.json({ error: "pageKey required." }, { status: 400 });

    const setting = await prisma.seoSetting.upsert({
      where: { pageKey },
      update: { title, description, ogTitle, ogDescription, ogImage, canonicalUrl },
      create: {
        pageKey,
        entityType: "page",
        title,
        description,
        ogTitle,
        ogDescription,
        ogImage,
        canonicalUrl,
      },
    });

    return NextResponse.json({ success: true, setting });
  } catch (e) {
    console.error("[SEO_PUT]", e);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}
