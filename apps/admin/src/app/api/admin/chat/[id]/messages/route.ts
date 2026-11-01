import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required." }, { status: 400 });

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { conversationId: id, senderId: admin.id, senderName: admin.name || admin.email, senderType: "ADMIN", content: content.trim() },
      }),
      prisma.conversation.update({
        where: { id },
        data: { lastMessage: content.trim(), lastMessageAt: new Date(), status: "PENDING" },
      }),
    ]);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (e) {
    console.error("[CHAT_MESSAGE]", e);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
