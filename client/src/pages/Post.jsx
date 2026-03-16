import "./../css/Post.css";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Design");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log({
        title,
        description,
        category,
        image: imageFile,
      });
      
      alert(`Posted: ${title}`);
      setTitle("");
      setDescription("");
      setCategory("Design");
      setImagePreview(null);
      setImageFile(null);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="post-page-wrapper">
      <div className="post-header">
        <h1 className="post-title">Create New Post</h1>
        <p className="post-subtitle">Share your feedback and insights</p>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="What's your post about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
          <p className="char-count">{title.length}/100</p>
        </div>

        <div className="form-section">
          <label className="form-label">Category</label>
          <select
            className="form-select"
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

        <div className="form-section">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Tell us more about your post..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={1000}
            required
          />
          <p className="char-count">{description.length}/1000</p>
        </div>

        <div className="form-section">
          <label className="form-label">Image</label>
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={removeImage}
              >
                <FiX size={20} />
              </button>
            </div>
          ) : (
            <label className="image-upload-box">
              <div className="upload-content">
                <FiUpload size={32} />
                <p className="upload-text">Click to upload image</p>
                <p className="upload-subtext">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
            </label>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-publish"
            disabled={isLoading || !title || !description}
          >
            {isLoading ? "Publishing..." : "Publish Post"}
          </button>
          <button type="button" className="btn-draft">
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
}
