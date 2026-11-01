import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@reborn/db";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const { file, folder = "reborn-dolls/products", name } = body;

    if (!file) return NextResponse.json({ error: "File data required." }, { status: 400 });

    const result = await uploadImage(file, folder);

    // Save to media library
    const media = await prisma.mediaFile.create({
      data: {
        name: name || result.publicId.split("/").pop() || "upload",
        url: result.url,
        publicId: result.publicId,
        size: 0, // not available from URL upload
        mimeType: "image/webp",
        width: result.width,
        height: result.height,
        folder,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
