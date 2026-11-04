import { v2 as cloudinary } from "cloudinary";

// Lazy config so it doesn't throw at build time
function getCloudinary() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
}

export async function uploadImage(
  file: string,
  folder = "reborn-dolls/categories"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const c = getCloudinary();
  const result = await c.uploader.upload(file, {
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
  const c = getCloudinary();
  await c.uploader.destroy(publicId);
}
