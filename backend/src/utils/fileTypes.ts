export type MediaKind = "image" | "video" | "pdf" | "document";

export const ALLOWED_MIME_TYPES: Record<MediaKind, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  pdf: ["application/pdf"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],
};

export const ALL_ALLOWED_MIMES = Object.values(ALLOWED_MIME_TYPES).flat();

export const MIME_SIZE_LIMITS: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

export function getMediaKind(mimeType: string): MediaKind | null {
  for (const [kind, types] of Object.entries(ALLOWED_MIME_TYPES) as [MediaKind, string[]][]) {
    if (types.includes(mimeType)) return kind;
  }
  return null;
}

export function getMaxSizeForMime(mimeType: string): number {
  const kind = getMediaKind(mimeType);
  return kind ? MIME_SIZE_LIMITS[kind] : 10 * 1024 * 1024;
}

export function extensionForMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
  };
  return map[mimeType] || "bin";
}
