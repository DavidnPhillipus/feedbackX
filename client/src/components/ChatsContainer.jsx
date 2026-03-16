import "./../css/ChatsContainer.css";
import ChatRoomTemplate from "../Templates/ChatRoomTemplate";
import { useEffect, useState, useRef } from "react";
import { getRooms } from "../services/mockApi";

export default function ChatsContainer({ onSelect, selectedRoom }) {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  // Initial load
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRooms(1, 5)
      .then((r) => {
        if (mounted) {
          setRooms(r);
          setHasMore(r.length >= 5);
        }
      })
      .catch(() => mounted && setRooms([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  // Intersection Observer for lazy loading
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, hasMore]);

  // Load more rooms when page changes
  useEffect(() => {
    if (page === 1) return;

    let mounted = true;
    setLoading(true);
    getRooms(page, 5)
      .then((r) => {
        if (mounted) {
          setRooms((prev) => [...prev, ...r]);
          setHasMore(r.length >= 5);
        }
      })
      .catch(() => mounted && setHasMore(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [page]);

  return (
    <div className="chats-container">
      <h3 className="chat-header">My Feedback Rooms</h3>
      <input
        type="text"
        placeholder="Search for rooms you have created"
        id="search-chat"
      />
      <div className="chats-wrapper">
        {rooms.length === 0 && loading ? (
          <p>Loading...</p>
        ) : rooms.length === 0 ? (
          <p>No rooms yet</p>
        ) : (
          rooms.map((r) => (
          <div
            key={r.id}
            className={selectedRoom && selectedRoom.id === r.id ? "selected-room" : ""}
            onClick={() => onSelect && onSelect(r)}
          >
            <ChatRoomTemplate item={r} />
          </div>
        ))
        )}
        {hasMore && (
          <div ref={loadMoreRef} className="load-more-trigger">
            {loading && <p className="loading-text">Loading more...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
