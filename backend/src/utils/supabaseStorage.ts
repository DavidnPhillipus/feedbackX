import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { supabase, STORAGE_BUCKET } from "../lib/supabase.js";
import {
  ALL_ALLOWED_MIMES,
  extensionForMime,
  getMaxSizeForMime,
  getMediaKind,
} from "./fileTypes.js";

function getPublicBaseUrl() {
  const configured = process.env.PUBLIC_BASE_URL || process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || process.env.URL;
  return (configured || `http://localhost:${process.env.PORT || 8080}`).replace(/\/$/, "");
}

async function uploadLocally(buffer: Buffer, mimeType: string, originalName?: string): Promise<string> {
  const ext = originalName?.split(".").pop()?.toLowerCase() || extensionForMime(mimeType);
  const base =
    originalName?.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "") || getMediaKind(mimeType) || "file";
  const filename = `${Date.now()}-${base}.${ext}`;
  const uploadDir = path.resolve(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  return `${getPublicBaseUrl()}/uploads/${filename}`;
}

export async function uploadToSupabase(
  buffer: Buffer,
  mimeType: string,
  originalName?: string
): Promise<string> {
  if (!ALL_ALLOWED_MIMES.includes(mimeType)) {
    throw new Error(
      "Unsupported file type. Allowed: images (JPG, PNG, GIF, WebP), videos (MP4, WebM, MOV), PDF, and documents (DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT)"
    );
  }

  const maxSize = getMaxSizeForMime(mimeType);
  if (buffer.length > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File too large (max ${mb}MB for this type)`);
  }

  try {
    const ext = originalName?.split(".").pop()?.toLowerCase() || extensionForMime(mimeType);
    const base =
      originalName?.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "") || getMediaKind(mimeType) || "file";
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
  } catch (error) {
    console.warn("Supabase upload failed, using local fallback storage:", error);
    return uploadLocally(buffer, mimeType, originalName);
  }
}
