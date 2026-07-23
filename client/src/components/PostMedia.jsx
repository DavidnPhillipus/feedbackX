import { FiFile, FiFileText, FiFilm } from "react-icons/fi";
import { mediaKindLabel } from "../utils/fileTypes";

export default function PostMedia({
  url,
  type,
  name,
  mediaKind,
  title = "Project",
  fallbackImage,
}) {
  const src = url || fallbackImage;
  const kind = mediaKind || (type?.startsWith("image/") ? "image" : null);

  if (!src && !url) {
    return (
      <div className="fx-post-media fx-post-media--placeholder">
        <FiFile size={40} />
        <span>No attachment</span>
      </div>
    );
  }

  if (kind === "image" || (!kind && src)) {
    return (
      <img src={src} alt={title} className="fx-post-media fx-post-media--image" />
    );
  }

  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        className="fx-post-media fx-post-media--video"
        preload="metadata"
      >
        Your browser does not support video playback.
      </video>
    );
  }

  if (kind === "pdf") {
    return (
      <div className="fx-post-media fx-post-media--embed">
        <iframe src={url} title={name || title} className="fx-post-media__pdf" />
        <a href={url} target="_blank" rel="noreferrer" className="fx-post-media__open">
          Open PDF in new tab
        </a>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="fx-post-media fx-post-media--file">
      {kind === "document" ? <FiFileText size={32} /> : <FiFilm size={32} />}
      <div>
        <strong>{name || title}</strong>
        <span>{mediaKindLabel(kind)} · Click to download</span>
      </div>
    </a>
  );
}
