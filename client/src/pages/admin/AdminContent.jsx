import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as api from "../../services/api";

export default function AdminContent() {
  const [params] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const publishedFilter = params.get("published") || "";

  const load = async (search = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.fetchAdminPosts({
        q: search,
        published: publishedFilter || undefined,
        limit: 50,
      });
      setPosts(data.posts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedFilter]);

  const togglePublish = async (post) => {
    try {
      const data = await api.updateAdminPost(post.id, { published: !post.published });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project permanently?")) return;
    try {
      await api.deleteAdminPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fx-admin__section">
      <form
        className="fx-admin__toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <input
          className="fx-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects or authors"
        />
        <button type="submit" className="fx-btn">
          Search
        </button>
      </form>

      {loading ? (
        <p className="fx-muted">Loading content...</p>
      ) : error ? (
        <p className="fx-muted">{error}</p>
      ) : posts.length === 0 ? (
        <p className="fx-muted">No projects found.</p>
      ) : (
        <div className="fx-feed">
          {posts.map((post) => (
            <div key={post.id} className="fx-card fx-admin__row">
              <div className="fx-admin__row-main">
                <strong>{post.title}</strong>
                <span className="fx-muted">
                  by @{post.author?.username || "unknown"} · {post.likeCount} likes ·{" "}
                  {post.replyCount} replies
                </span>
                <p className="fx-admin__clip">{post.body}</p>
                <div className="fx-admin__badges">
                  <span className={`fx-card__badge${post.published ? "" : " fx-admin__badge-warn"}`}>
                    {post.published ? "Published" : "Unpublished"}
                  </span>
                </div>
              </div>
              <div className="fx-admin__actions">
                <button
                  type="button"
                  className="fx-btn fx-btn--secondary"
                  onClick={() => togglePublish(post)}
                >
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="fx-btn fx-btn--secondary"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
