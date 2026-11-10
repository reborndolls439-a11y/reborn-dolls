import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { Resend } from "resend";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM_EMAIL = process.env.FROM_EMAIL || "UK Reborn Dolls <hello@ukreborndolls.co.uk>";

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

    // Send email notification to customer
    const customerEmail = conversation.guestEmail ?? null;
    // Registered users: look up their email
    let recipientEmail = customerEmail;
    if (!recipientEmail && conversation.userId) {
      const user = await prisma.user.findUnique({ where: { id: conversation.userId }, select: { email: true, name: true } });
      recipientEmail = user?.email ?? null;
    }

    if (recipientEmail) {
      const customerName = conversation.guestName || "there";
      const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://ukreborndolls.co.uk";

      getResend().emails.send({
        from: FROM_EMAIL,
        to: recipientEmail,
        reply_to: "hello@ukreborndolls.co.uk",
        subject: `Re: ${conversation.subject || "Your enquiry"} — UK Reborn Dolls`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#02182B;">
            <div style="background:#2FE6DE;padding:20px 28px;border-radius:12px 12px 0 0;">
              <h2 style="margin:0;font-size:17px;color:#02182B;">Reply from UK Reborn Dolls</h2>
            </div>
            <div style="background:#f7fbfe;padding:28px;border:1px solid #cddceb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="font-size:15px;margin:0 0 16px;">Hi ${customerName},</p>
              <div style="background:#e8f1f8;padding:14px 18px;border-radius:8px;font-size:14px;line-height:1.7;white-space:pre-wrap;">${content.trim()}</div>
              <p style="font-size:13px;color:#5a7a8a;margin:20px 0 0;">
                You can reply directly to this email or visit our website.<br/>
                <a href="${storeUrl}" style="color:#2FE6DE;">${storeUrl}</a>
              </p>
            </div>
            <div style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#5a7a8a;">© ${new Date().getFullYear()} UK Reborn Dolls — hello@ukreborndolls.co.uk</p>
            </div>
          </div>`,
      }).catch((err: unknown) => console.error("[CHAT_REPLY_EMAIL]", err));
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (e) {
    console.error("[CHAT_MESSAGE]", e);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
