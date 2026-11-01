import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const files = await prisma.mediaFile.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ files });
}
