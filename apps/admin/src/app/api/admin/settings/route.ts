import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const settings = await request.json();
    for (const [key, value] of Object.entries(settings)) {
      await prisma.storeSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
    }
    await prisma.activityLog.create({ data: { userId: admin.id, action: "settings_updated", entity: "store" } });
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed." }, { status: 500 }); }
}

export async function GET() {
  const settings = await prisma.storeSetting.findMany();
  return NextResponse.json({ settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
}
