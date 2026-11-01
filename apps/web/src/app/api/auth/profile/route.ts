import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { name, phone } = await request.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true, email: true, name: true, role: true,
        emailVerified: true, avatar: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (e) {
    console.error("[PROFILE_UPDATE]", e);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
