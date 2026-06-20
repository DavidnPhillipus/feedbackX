import CardTemplate from "../Templates/CardTemplate.jsx";

import Activity from "../components/Activity";

import { useEffect, useState, useRef } from "react";

import * as api from "../services/api";



export default function HomePage() {

  const [items, setItems] = useState([]);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [tab, setTab] = useState("following");

  const loadMoreRef = useRef(null);



  const loadPosts = (pageNum, append = false) => {

    setLoading(true);

    return api

      .fetchPosts({ page: pageNum, limit: 5 })

      .then((data) => {

        const posts = data.posts || [];

        setItems((prev) => (append ? [...prev, ...posts] : posts));

        setHasMore(posts.length >= 5);

      })

      .catch(() => {

        if (!append) setItems([]);

        setHasMore(false);

      })

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    setPage(1);

    loadPosts(1, false);

  }, [tab]);



  useEffect(() => {

    if (!hasMore) return;

    const observer = new IntersectionObserver(

      (entries) => {

        if (entries[0].isIntersecting && !loading && hasMore) {

          setPage((prev) => prev + 1);

        }

      },

      { threshold: 0.1 }

    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); };

  }, [loading, hasMore]);



  useEffect(() => {

    if (page === 1) return;

    loadPosts(page, true);

  }, [page]);



  return (

    <div className="fx-page">

      <div className="fx-page-header">

        <button

          type="button"

          className={tab === "following" ? "active" : ""}

          onClick={() => setTab("following")}

        >

          <strong>Following</strong>

        </button>

        <button

          type="button"

          className={tab === "trending" ? "active" : ""}

          onClick={() => setTab("trending")}

        >

          Trending now

        </button>

      </div>

      <div className="fx-grid fx-grid--with-aside">

        <main>

          <div className="fx-feed">

            {items.length === 0 && loading ? (

              <p className="fx-muted">Loading...</p>

            ) : items.length === 0 ? (

              <p className="fx-muted">No posts yet. <a href="/post">Create one!</a></p>

            ) : (

              items.map((p) => <CardTemplate key={p.id} {...p} />)

            )}

          </div>

          {hasMore && (

            <div ref={loadMoreRef} className="fx-load-more">

              {loading && <p>Loading more posts...</p>}

            </div>

          )}

        </main>

        <aside>

          <Activity />

        </aside>

      </div>

    </div>

  );

}

