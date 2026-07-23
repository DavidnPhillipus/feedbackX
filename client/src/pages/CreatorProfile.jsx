import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ExploreCard from "../Templates/ExploreCard";
import FollowButton from "../components/FollowButton";
import UserAvatar from "../components/UserAvatar";
import ProfileStats from "../components/ProfileStats";

const PAGE_SIZE = 30;

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const creatorId = Number.parseInt(id, 10);

  useEffect(() => {
    if (!creatorId || Number.isNaN(creatorId)) return;

    if (currentUser?.id === creatorId) {
      navigate("/Profile", { replace: true });
      return;
    }

    setLoadingProfile(true);
    api
      .fetchUser(creatorId)
      .then((data) => setProfile(data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [creatorId, currentUser?.id, navigate]);

  const loadPosts = (pageNum, append = false) => {
    if (!creatorId || Number.isNaN(creatorId)) return Promise.resolve();
    setLoadingPosts(true);
    return api
      .fetchPosts({ userId: creatorId, page: pageNum, limit: PAGE_SIZE })
      .then((data) => {
        const nextPosts = data.posts || [];
        setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
        setHasMore(nextPosts.length >= PAGE_SIZE);
      })
      .catch(() => {
        if (!append) setPosts([]);
        setHasMore(false);
      })
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    if (!profile) return;
    setPage(1);
    setPosts([]);
    setHasMore(true);
    loadPosts(1, false);
  }, [profile?.id]);

  useEffect(() => {
    if (!hasMore || loadingPosts) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingPosts && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [loadingPosts, hasMore]);

  useEffect(() => {
    if (page === 1) return;
    loadPosts(page, true);
  }, [page]);

  if (loadingProfile) {
    return (
      <div className="fx-page">
        <p className="fx-muted">Loading creator…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fx-page">
        <p className="fx-muted">Creator not found.</p>
        <Link to="/creators" className="fx-btn fx-btn--secondary">
          Back to Creators
        </Link>
      </div>
    );
  }

  return (
    <div className="fx-page">
      <div className="fx-page-header">
        <button type="button" className="fx-creator-back" onClick={() => navigate("/creators")}>
          <FiArrowLeft size={18} aria-hidden="true" />
          Creators
        </button>
        <span>
          <strong>{profile.name}</strong>
        </span>
      </div>

      <div className="fx-profile fx-creator-profile">
        <div className="fx-profile__banner">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.name}
            username={profile.username}
            size={96}
            className="fx-profile__avatar"
          />
          <div className="fx-profile__info">
            <h1 className="fx-profile__name">{profile.name}</h1>
            <p className="fx-profile__username">@{profile.username}</p>
            <p className="fx-profile__bio">{profile.bio || "No bio yet."}</p>
          </div>
          <div className="fx-profile__actions">
            <FollowButton
              userId={profile.id}
              initialFollowing={profile.isFollowing}
              size="md"
            />
          </div>
        </div>

        <ProfileStats
          userId={profile.id}
          postCount={profile.postCount ?? 0}
          followingCount={profile.followingCount ?? 0}
          followerCount={profile.followerCount ?? 0}
          postsLabel="Projects"
        />
      </div>

      <section className="fx-creator-projects">
        <h2 className="fx-creator-projects__title">Projects</h2>
        <div className="fx-feed fx-feed--grid">
          {posts.length === 0 && !loadingPosts ? (
            <p className="fx-muted">No published projects yet.</p>
          ) : (
            posts.map((post) => <ExploreCard key={post.id} {...post} />)
          )}
        </div>
        {hasMore && (
          <div ref={loadMoreRef} className="fx-load-more">
            {loadingPosts ? "Loading more projects…" : ""}
          </div>
        )}
      </section>
    </div>
  );
}
