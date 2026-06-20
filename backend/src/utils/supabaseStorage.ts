import { supabase, STORAGE_BUCKET } from "../lib/supabase.js";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function uploadToSupabase(
  buffer: Buffer,
  mimeType: string,
  originalName?: string
): Promise<string> {
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("Image too large (max 10MB)");
  }

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const base = originalName?.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "") || "image";
  const filename = `${Date.now()}-${base}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Failed to upload to Supabase Storage");
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
