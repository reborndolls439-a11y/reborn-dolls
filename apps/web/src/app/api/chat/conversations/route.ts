import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[CONVERSATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch conversations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { subject, message, guestName, guestEmail } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const customerEmail = user?.email || guestEmail;
    const customerName = user?.name || guestName || "Guest";

    if (!user && !guestEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: user?.id ?? null,
        guestName: user ? null : customerName,
        guestEmail: user ? null : customerEmail,
        subject: subject || "Support Request",
        status: "OPEN",
        lastMessage: message,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderId: user?.id ?? null,
            senderName: customerName,
            senderType: "CUSTOMER",
            content: message,
          },
        },
      },
      include: { messages: true },
    });

    // Notify admin
    await prisma.adminNotification.create({
      data: {
        type: "NEW_MESSAGE",
        title: "New Support Message",
        message: `${customerName}: ${message.slice(0, 60)}${message.length > 60 ? "…" : ""}`,
        link: `/admin/chat/${conversation.id}`,
      },
    });

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("[CONVERSATION_CREATE]", error);
    return NextResponse.json({ error: "Failed to start conversation." }, { status: 500 });
  }
}
