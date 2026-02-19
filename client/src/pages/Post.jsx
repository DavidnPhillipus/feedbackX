import "./../css/Post.css";
import { useState } from "react";

export default function PostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // placeholder: in future send to API
    alert(`Posted: ${title}`);
    setTitle("");
    setBody("");
  }

  return (
    <div className="page-inner container">
      <div className="post-page">
        <h1>Create Post</h1>
        <form className="post-form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input textarea"
            placeholder="Write your post..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            required
          />
          <div className="actions">
            <button className="btn" type="submit">Publish</button>
          </div>
        </form>
      </div>
    </div>
  );
}
