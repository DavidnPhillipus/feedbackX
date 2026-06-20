import { useState } from "react";

import { FiUpload, FiX } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import * as api from "../services/api";



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

  const [imagePreview, setImagePreview] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");



  const handleImageChange = (e) => {

    const file = e.target.files?.[0];

    if (file) {

      if (file.size > 10 * 1024 * 1024) {

        setError("Image must be under 10MB");

        return;

      }

      setImageFile(file);

      const reader = new FileReader();

      reader.onloadend = () => setImagePreview(reader.result);

      reader.readAsDataURL(file);

      setError("");

    }

  };



  const removeImage = () => {

    setImagePreview(null);

    setImageFile(null);

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

      let imageUrl = null;
      if (imageFile) {
        const uploaded = await api.uploadImage(imageFile);
        imageUrl = uploaded.url;
      }



      await api.createPost({

        title,

        body: description,

        tags: [category],

        imageUrl,

        published,

      });



      if (published) {

        navigate("/home");

      } else {

        alert("Draft saved!");

        setTitle("");

        setDescription("");

        setCategory("Design");

        removeImage();

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



  const handleDraft = () => submitPost(false);



  return (

    <div className="fx-form-page">

      <div className="fx-form-page__header">

        <h1 className="fx-form-page__title">Create New Post</h1>

        <p className="fx-form-page__subtitle">Share your feedback and insights</p>

      </div>



      <form className="fx-form" onSubmit={handleSubmit}>

        {error && <p className="fx-auth__error">{error}</p>}



        <div className="fx-field">

          <label htmlFor="post-title">Title</label>

          <input

            id="post-title"

            type="text"

            className="fx-input"

            placeholder="What's your post about? (min 10 chars)"

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

            placeholder="Tell us more about your post... (min 10 chars)"

            value={description}

            onChange={(e) => setDescription(e.target.value)}

            rows={6}

            maxLength={1000}

            required

          />

          <p className="fx-char-count">{description.length}/1000</p>

        </div>



        <div className="fx-field">

          <label>Image</label>

          {imagePreview ? (

            <div className="fx-preview">

              <img src={imagePreview} alt="Preview" />

              <button type="button" className="fx-preview__remove" onClick={removeImage}>

                <FiX size={20} />

              </button>

            </div>

          ) : (

            <label className="fx-upload">

              <FiUpload size={32} />

              <p>Click to upload image</p>

              <p className="fx-muted">PNG, JPG, GIF up to 10MB</p>

              <input type="file" accept="image/*" onChange={handleImageChange} />

            </label>

          )}

        </div>



        <div className="fx-form-actions">

          <button

            type="submit"

            className="fx-btn"

            disabled={isLoading || title.length < 10 || description.length < 10}

          >

            {isLoading ? "Publishing..." : "Publish Post"}

          </button>

          <button

            type="button"

            className="fx-btn fx-btn--secondary"

            disabled={isLoading || title.length < 10 || description.length < 10}

            onClick={handleDraft}

          >

            Save as Draft

          </button>

        </div>

      </form>

    </div>

  );

}

