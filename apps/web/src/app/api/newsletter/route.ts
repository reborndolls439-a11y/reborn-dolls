import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    // TODO: integrate with email marketing provider (Mailchimp, ConvertKit, etc.)
    console.log("[NEWSLETTER] Signup:", email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
