import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM_EMAIL = process.env.FROM_EMAIL || "Reborn Dolls <hello@ukreborndolls.co.uk>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@ukreborndolls.co.uk";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
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

    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const customerEmail = user?.email || guestEmail;
    const customerName = user?.name || guestName || "Visitor";

    if (!user && !guestEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: user?.id ?? null,
        guestName: user ? null : customerName,
        guestEmail: user ? null : customerEmail,
        subject: subject || "Live Chat",
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

    // Admin dashboard notification
    await prisma.adminNotification.create({
      data: {
        type: "NEW_MESSAGE",
        title: "New Live Chat Message",
        message: `${customerName}: ${message.slice(0, 80)}${message.length > 80 ? "…" : ""}`,
        link: `/chat/${conversation.id}`,
      },
    }).catch(() => {});

    // Email notification to admin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://admin-sandy-three-44.vercel.app";
    getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `💬 New Live Chat — ${customerName}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#02182B;">
          <div style="background:#2FE6DE;padding:20px 28px;border-radius:12px 12px 0 0;">
            <h1 style="color:#02182B;margin:0;font-size:18px;">New Live Chat Message</h1>
          </div>
          <div style="background:#f7fbfe;padding:28px;border:1px solid #cddceb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="margin:0 0 8px;font-size:14px;"><strong>From:</strong> ${customerName}</p>
            ${customerEmail ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${customerEmail}</p>` : ""}
            <p style="margin:0 0 16px;font-size:14px;"><strong>Subject:</strong> ${subject || "Live Chat"}</p>
            <div style="background:#e8f1f8;padding:14px 18px;border-radius:8px;font-size:14px;line-height:1.6;">
              ${message}
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="${siteUrl}/chat/${conversation.id}" style="display:inline-block;background:#2FE6DE;color:#02182B;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
                Reply in Dashboard
              </a>
            </div>
          </div>
        </div>`,
    }).catch(() => {});

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("[CONVERSATION_CREATE]", error);
    return NextResponse.json({ error: "Failed to start conversation." }, { status: 500 });
  }
}
