import { useState } from "react";
import { FiUpload, FiX, FiFile } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import {
  ACCEPT_PROJECT_FILES,
  formatFileSize,
  getMediaKind,
  mediaKindLabel,
  validateProjectFile,
} from "../utils/fileTypes";

const CATEGORIES = [
  { id: 1, name: "Design", emoji: "🎨" },
  { id: 2, name: "Development", emoji: "💻" },
  { id: 3, name: "Marketing", emoji: "📢" },
  { id: 4, name: "Product", emoji: "📦" },
  { id: 5, name: "UX/UI", emoji: "✨" },
  { id: 6, name: "Analytics", emoji: "📊" },
  { id: 7, name: "Other", emoji: "📝" },
];

export default function PostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Design");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaKind, setMediaKind] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateProjectFile(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const kind = getMediaKind(selected.type);
    setFile(selected);
    setMediaKind(kind);
    setError("");

    if (kind === "image" || kind === "video") {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMediaKind(null);
  };

  const submitPost = async (published) => {
    setError("");
    if (title.length < 10) {
      setError("Title must be at least 10 characters");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    setIsLoading(true);
    try {
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;
      let imageUrl = null;

      if (file) {
        const uploaded = await api.uploadProjectFile(file);
        attachmentUrl = uploaded.url;
        attachmentType = uploaded.type;
        attachmentName = uploaded.name;
        if (uploaded.mediaKind === "image") {
          imageUrl = uploaded.url;
        }
      }

      await api.createPost({
        title,
        body: description,
        tags: [category],
        imageUrl,
        attachmentUrl,
        attachmentType,
        attachmentName,
        published,
      });

      if (published) {
        navigate("/home");
      } else {
        alert("Draft saved!");
        setTitle("");
        setDescription("");
        setCategory("Design");
        removeFile();
      }
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPost(true);
  };

  return (
    <div className="fx-form-page">
      <div className="fx-form-page__header">
        <h1 className="fx-form-page__title">Create New Project</h1>
        <p className="fx-form-page__subtitle">
          Upload images, videos, PDFs, or documents for feedback
        </p>
      </div>

      <form className="fx-form" onSubmit={handleSubmit}>
        {error && <p className="fx-auth__error">{error}</p>}

        <div className="fx-field">
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            type="text"
            className="fx-input"
            placeholder="What's your project about? (min 10 chars)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
          <p className="fx-char-count">{title.length}/100</p>
        </div>

        <div className="fx-field">
          <label htmlFor="post-category">Category</label>
          <select
            id="post-category"
            className="fx-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fx-field">
          <label htmlFor="post-desc">Description</label>
          <textarea
            id="post-desc"
            className="fx-textarea"
            placeholder="Tell us more about your project... (min 10 chars)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={1000}
            required
          />
          <p className="fx-char-count">{description.length}/1000</p>
        </div>

        <div className="fx-field">
          <label>Project file</label>
          {file ? (
            <div className="fx-preview fx-preview--file">
              {mediaKind === "image" && previewUrl && (
                <img src={previewUrl} alt="Preview" />
              )}
              {mediaKind === "video" && previewUrl && (
                <video src={previewUrl} controls className="fx-preview__video" />
              )}
              {(mediaKind === "pdf" || mediaKind === "document") && (
                <div className="fx-preview__doc">
                  <FiFile size={40} />
                  <p>{file.name}</p>
                  <span>{mediaKindLabel(mediaKind)} · {formatFileSize(file.size)}</span>
                </div>
              )}
              <button type="button" className="fx-preview__remove" onClick={removeFile}>
                <FiX size={20} />
              </button>
            </div>
          ) : (
            <label className="fx-upload">
              <FiUpload size={32} />
              <p>Click to upload your project</p>
              <p className="fx-muted">
                Images (10MB) · Videos MP4/WebM/MOV (50MB) · PDF &amp; docs (25MB)
              </p>
              <input
                type="file"
                accept={ACCEPT_PROJECT_FILES}
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        <div className="fx-form-actions">
          <button
            type="submit"
            className="fx-btn"
            disabled={isLoading || title.length < 10 || description.length < 10}
          >
            {isLoading ? "Publishing..." : "Publish Project"}
          </button>
          <button
            type="button"
            className="fx-btn fx-btn--secondary"
            disabled={isLoading || title.length < 10 || description.length < 10}
            onClick={() => submitPost(false)}
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
}
