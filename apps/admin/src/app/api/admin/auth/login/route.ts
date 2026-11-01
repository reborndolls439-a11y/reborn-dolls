import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { verifyPassword, signToken, setAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.password || !user.isActive || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Invalid credentials or insufficient permissions." }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials or insufficient permissions." }, { status: 401 });
    const token = await signToken({ userId: user.id, role: user.role });
    await setAdminSession(token);
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error("[ADMIN_LOGIN]", e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
