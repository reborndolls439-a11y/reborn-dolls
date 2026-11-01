import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@reborn/ui";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    orderBy: [{ status: "asc" }, { lastMessageAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { isRead: false, senderType: "CUSTOMER" } } } },
    },
  });

  const statusVariant: Record<string, string> = { OPEN: "warning", PENDING: "info", RESOLVED: "success", CLOSED: "default" };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Live Chat" subtitle="Customer support conversations" />
      <div className="p-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-charcoal-100 flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-14 h-14 text-taupe-300 mb-4" />
            <p className="font-heading text-xl text-charcoal mb-2">No conversations yet</p>
            <p className="text-sm text-taupe font-body">Customer messages will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-charcoal-100 divide-y divide-charcoal-50">
            {conversations.map((conv) => {
              const customerName = conv.user?.name || conv.guestName || "Guest";
              const customerEmail = conv.user?.email || conv.guestEmail;
              const lastMsg = conv.messages[0];
              const unread = conv._count.messages;

              return (
                <Link key={conv.id} href={`/chat/${conv.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-charcoal-50 transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-bloom-rose-100 flex items-center justify-center shrink-0">
                      <span className="text-bloom-rose font-semibold text-sm">{customerName.charAt(0).toUpperCase()}</span>
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-bloom-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-charcoal font-body text-sm">{customerName}</p>
                      <p className="text-xs text-taupe font-body shrink-0">{conv.lastMessageAt ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round((new Date(conv.lastMessageAt).getTime() - Date.now()) / (1000 * 60)), "minute") : ""}</p>
                    </div>
                    {customerEmail && <p className="text-xs text-taupe font-body">{customerEmail}</p>}
                    {lastMsg && <p className="text-sm text-taupe font-body mt-1 line-clamp-1">{lastMsg.senderType === "ADMIN" ? "You: " : ""}{lastMsg.content}</p>}
                  </div>
                  <Badge variant={(statusVariant[conv.status] || "default") as "success"|"warning"|"info"|"default"} className="shrink-0">{conv.status}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
