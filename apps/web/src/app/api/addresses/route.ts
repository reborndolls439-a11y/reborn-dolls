import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@reborn/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
    return NextResponse.json({ addresses });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await request.json();
    const { label, firstName, lastName, line1, line2, city, state, postalCode, country, phone } = body;

    if (!firstName || !lastName || !line1 || !city || !state || !postalCode || !country) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    // If this is the first address, make it default
    const count = await prisma.address.count({ where: { userId: user.id } });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label, firstName, lastName, line1, line2, city, state, postalCode, country, phone,
        isDefault: count === 0,
      },
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
