import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM_EMAIL = process.env.FROM_EMAIL || "UK Reborn Dolls <hello@ukreborndolls.co.uk>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@ukreborndolls.co.uk";

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
    const { content, guestEmail } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    // Allow guests to post messages if they provide their email matching the conversation
    const conversation = await prisma.conversation.findFirst({
      where: user
        ? { id, ...(user.role === "CUSTOMER" ? { userId: user.id } : {}) }
        : { id }, // guests just need the conversation ID (they got it from the initial POST)
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const senderName = user?.name || user?.email || conversation.guestName || "Visitor";
    const senderType = user && user.role !== "CUSTOMER" ? "ADMIN" : "CUSTOMER";

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId: id,
          senderId: user?.id ?? null,
          senderName,
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

    // Email admin when a customer sends a follow-up message
    if (senderType === "CUSTOMER") {
      const customerEmail = user?.email || conversation.guestEmail || "unknown";
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://ukreborndolls.co.uk";
      getResend().emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `💬 New Live Chat — ${senderName}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#02182B;">
            <div style="background:#2FE6DE;padding:20px 28px;border-radius:12px 12px 0 0;">
              <h1 style="color:#02182B;margin:0;font-size:18px;">New Live Chat Message</h1>
            </div>
            <div style="background:#f7fbfe;padding:28px;border:1px solid #cddceb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="margin:0 0 8px;font-size:14px;"><strong>From:</strong> ${senderName}</p>
              <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin:0 0 16px;font-size:14px;"><strong>Subject:</strong> ${conversation.subject || "Live Chat"}</p>
              <div style="background:#e8f1f8;padding:14px 18px;border-radius:8px;font-size:14px;line-height:1.6;">
                ${content.trim()}
              </div>
              <div style="margin-top:24px;text-align:center;">
                <a href="${adminUrl}/chat/${id}" style="display:inline-block;background:#2FE6DE;color:#02182B;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
                  Reply in Dashboard
                </a>
              </div>
            </div>
          </div>`,
      }).catch((err: unknown) => console.error("[CUSTOMER_MSG_EMAIL]", err));
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("[MESSAGE_CREATE]", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
