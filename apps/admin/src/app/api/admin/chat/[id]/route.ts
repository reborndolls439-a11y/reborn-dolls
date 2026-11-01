import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Mark customer messages as read
  await prisma.chatMessage.updateMany({
    where: { conversationId: id, senderType: "CUSTOMER", isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ conversation });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const { status, assignedToId } = await request.json();
  const updated = await prisma.conversation.update({
    where: { id },
    data: { ...(status && { status }), ...(assignedToId !== undefined && { assignedToId }) },
  });
  return NextResponse.json({ success: true, conversation: updated });
}
