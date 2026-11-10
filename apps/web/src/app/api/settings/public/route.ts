import { NextResponse } from "next/server";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

// Public endpoint — only returns non-sensitive store settings
export async function GET() {
  const settings = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: ["free_shipping_threshold", "default_shipping_cost", "store_name", "store_tagline"],
      },
    },
  });
  return NextResponse.json({
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
  });
}
