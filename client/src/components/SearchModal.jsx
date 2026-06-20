import { useState, useEffect } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { fetchRooms } from '../services/socket';

export default function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.fetchPosts({ page: 1, limit: 50 }).then((d) => d.posts || []).catch(() => []),
      fetchRooms().catch(() => []),
    ]).then(([posts, rooms]) => {
      if (mounted) {
        setAllData([
          ...(posts || []).map((p) => ({
            ...p,
            type: 'post',
            searchTitle: p.title,
            searchSubtitle: p.username,
          })),
          ...(rooms || []).map((r) => ({
            ...r,
            type: 'room',
            searchTitle: r.name,
            searchSubtitle: r.lastMessage || 'Chat room',
          })),
        ]);
      }
    });
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchTerm = query.toLowerCase();
    setResults(
      allData.filter((item) =>
        item.searchTitle?.toLowerCase().includes(searchTerm) ||
        item.searchSubtitle?.toLowerCase().includes(searchTerm) ||
        item.username?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      ).slice(0, 12)
    );
  }, [query, allData]);

  const handleResultClick = (item) => {
    onClose();
    if (item.type === 'room') navigate('/feedbackRooms');
    else if (item.type === 'post') navigate('/home');
    else navigate('/projects');
  };

  return (
    <div className="fx-search-overlay" onClick={onClose}>
      <aside className="fx-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fx-search-modal__top">
          <div className="fx-search-modal__title">Search</div>
          <button className="fx-search-modal__close" onClick={onClose} type="button" title="Close">
            <FiX size={20} />
          </button>
        </div>
        <div className="fx-search-modal__input-wrap">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search posts, projects, rooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="fx-search-modal__content">
          {!query.trim() ? (
            <div className="fx-search-empty"><p>Search posts, projects, and more</p></div>
          ) : results.length === 0 ? (
            <div className="fx-search-empty"><p>No results found</p></div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                className="fx-search-result"
                onClick={() => handleResultClick(item)}
              >
                {item.type === 'post' || item.type === 'room' ? (
                  <img src={item.profilePicture || item.avatar} alt="" className="fx-search-result__avatar" />
                ) : (
                  <div className="fx-search-result__icon">📋</div>
                )}
                <div>
                  <p className="fx-search-result__title">{item.searchTitle}</p>
                  <p className="fx-search-result__subtitle">{item.searchSubtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
