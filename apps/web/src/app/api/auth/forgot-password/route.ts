import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Clean up old tokens
    await prisma.verificationToken.deleteMany({
      where: { email: email.toLowerCase(), type: "password_reset" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        type: "password_reset",
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name || "there", resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
  }
}
