import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { prisma } from "@reborn/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const unreadChats = await prisma.conversation.count({ where: { status: "OPEN" } });
  const unreadNotifications = await prisma.adminNotification.count({ where: { isRead: false } });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f8]">
      <AdminSidebar unreadChats={unreadChats} unreadNotifications={unreadNotifications} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
