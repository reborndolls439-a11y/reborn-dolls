import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await request.json();
    const { file, folder = "reborn-dolls/categories" } = body;

    if (!file) return NextResponse.json({ error: "File data required." }, { status: 400 });

    const result = await uploadImage(file, folder);
    return NextResponse.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
