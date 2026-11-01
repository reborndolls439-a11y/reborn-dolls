import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        ...(user.role === "CUSTOMER" ? { userId: user.id } : {}),
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: id,
        senderType: user.role === "CUSTOMER" ? "ADMIN" : "CUSTOMER",
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        ...(user.role === "CUSTOMER" ? { userId: user.id } : {}),
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const senderType = user.role === "CUSTOMER" ? "CUSTOMER" : "ADMIN";

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId: id,
          senderId: user.id,
          senderName: user.name || user.email,
          senderType,
          content: content.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: {
          lastMessage: content.trim(),
          lastMessageAt: new Date(),
          status: senderType === "CUSTOMER" ? "OPEN" : conversation.status,
        },
      }),
    ]);

    // Notify the other party if admin replied
    if (senderType === "ADMIN") {
      await prisma.adminNotification.create({
        data: {
          type: "NEW_MESSAGE",
          title: "Support Reply Sent",
          message: `Replied to ${conversation.guestEmail || "customer"}`,
          link: `/admin/chat/${id}`,
        },
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("[MESSAGE_CREATE]", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
