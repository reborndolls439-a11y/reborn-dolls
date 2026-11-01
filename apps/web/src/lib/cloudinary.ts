import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: string, // base64 or URL
  folder = "reborn-dolls/products"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto:best", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url.includes("cloudinary.com")) return url;

  const { width = 800, height, quality = 80 } = options;
  const transforms = [`w_${width}`, `q_${quality}`, "f_auto"];
  if (height) transforms.push(`h_${height}`, "c_fill");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

export { cloudinary };
