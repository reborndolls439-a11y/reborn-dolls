import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    // Customers get their order notifications; admins get all admin notifications
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      const notifications = await prisma.adminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const unreadCount = await prisma.adminNotification.count({ where: { isRead: false } });
      return NextResponse.json({ notifications, unreadCount });
    }

    return NextResponse.json({ notifications: [], unreadCount: 0 });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { ids, markAll } = await request.json();

    if (markAll) {
      await prisma.adminNotification.updateMany({ data: { isRead: true } });
    } else if (ids?.length) {
      await prisma.adminNotification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_READ]", error);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
