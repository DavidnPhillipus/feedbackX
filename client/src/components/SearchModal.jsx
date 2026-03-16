import { useState, useEffect } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import './../css/SearchModal.css';
import { getPosts, getProjects, getRooms } from '../services/mockApi';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);

  // Load all data on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([
      getPosts(1, 50).catch(() => []),
      getProjects().catch(() => []),
      getRooms(1, 50).catch(() => []),
    ]).then(([posts, projects, rooms]) => {
      if (mounted) {
        const combined = [
          ...(posts || []).map(p => ({ ...p, type: 'post', searchTitle: p.title, searchSubtitle: p.username })),
          ...(projects || []).map(p => ({ ...p, type: 'project', searchTitle: p.title, searchSubtitle: 'Your Project' })),
          ...(rooms || []).map(r => ({ ...r, type: 'room', searchTitle: r.name, searchSubtitle: r.lastMessage })),
        ];
        setAllData(combined);
      }
    });

    return () => (mounted = false);
  }, []);

  // Search through data
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allData.filter((item) =>
      item.searchTitle?.toLowerCase().includes(searchTerm) ||
      item.searchSubtitle?.toLowerCase().includes(searchTerm) ||
      item.username?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm)
    );

    setResults(filtered.slice(0, 12));
  }, [query, allData]);

  const getAvatar = (item) => {
    if (item.type === 'post') return item.profilePicture;
    if (item.type === 'room') return item.avatar;
    return null;
  };

  const getIcon = (item) => {
    if (item.type === 'project') return '📋';
    return null;
  };

  return (
    <aside className="search-modal">
      <div className="search-modal-top">
        <div className="search-modal-title">Search</div>
        <button className="search-modal-close" onClick={onClose} type="button" title="Close">
          <FiX size={20} />
        </button>
      </div>
      <div className="search-modal-header">
        <div className="search-input-wrapper">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="search-modal-content">
        {query.trim() === '' ? (
          <div className="search-empty">
            <p>Search posts, projects, and more</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <p>No results found</p>
          </div>
        ) : (
          <div className="search-results-list">
            {results.map((item) => (
              <div key={`${item.type}-${item.id}`} className="search-result-item">
                {getAvatar(item) ? (
                  <img src={getAvatar(item)} alt={item.searchTitle} className="search-result-avatar" />
                ) : (
                  <div className="search-result-icon">{getIcon(item)}</div>
                )}
                <div className="search-result-info">
                  <p className="search-result-title">{item.searchTitle}</p>
                  <p className="search-result-subtitle">{item.searchSubtitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

