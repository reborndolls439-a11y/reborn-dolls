import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

// DELETE /api/admin/products/bulk  { ids: string[] }
// Archives (soft-deletes) multiple products at once.
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { ids } = await request.json() as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided." }, { status: 400 });
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: "ARCHIVED" },
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "products_bulk_archived",
        entity: "product",
        metadata: { count: result.count, ids },
      },
    });

    return NextResponse.json({ success: true, archived: result.count });
  } catch (e) {
    console.error("[PRODUCTS_BULK_DELETE]", e);
    return NextResponse.json({ error: "Bulk delete failed." }, { status: 500 });
  }
}
