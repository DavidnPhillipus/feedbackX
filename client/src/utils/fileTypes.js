export const ACCEPT_PROJECT_FILES =
  "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain";

const MIME_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const PDF_TYPES = ["application/pdf"];
const DOC_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export function getMediaKind(mimeType) {
  if (IMAGE_TYPES.includes(mimeType)) return "image";
  if (VIDEO_TYPES.includes(mimeType)) return "video";
  if (PDF_TYPES.includes(mimeType)) return "pdf";
  if (DOC_TYPES.includes(mimeType)) return "document";
  return null;
}

export function getMaxSizeForFile(file) {
  const kind = getMediaKind(file.type);
  return kind ? MIME_SIZE_LIMITS[kind] : 10 * 1024 * 1024;
}

export function validateProjectFile(file) {
  const kind = getMediaKind(file.type);
  if (!kind) {
    return "Unsupported file type. Use images, videos, PDF, or documents.";
  }
  const max = MIME_SIZE_LIMITS[kind];
  if (file.size > max) {
    const mb = Math.round(max / (1024 * 1024));
    return `File too large (max ${mb}MB for ${kind} files)`;
  }
  return null;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaKindLabel(kind) {
  const labels = { image: "Image", video: "Video", pdf: "PDF", document: "Document" };
  return labels[kind] || "File";
}
