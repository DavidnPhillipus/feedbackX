import { useState } from "react";
import FollowListModal from "./FollowListModal";

export default function ProfileStats({
  userId,
  postCount,
  followingCount,
  followerCount,
  postsLabel = "Posts",
}) {
  const [listType, setListType] = useState(null);

  return (
    <>
      <div className="fx-profile__stats">
        <div className="fx-stat">
          <span className="fx-stat__value">{postCount}</span>
          <span className="fx-stat__label">{postsLabel}</span>
        </div>

        <button
          type="button"
          className="fx-stat fx-stat--clickable"
          onClick={() => setListType("following")}
        >
          <span className="fx-stat__value">{followingCount}</span>
          <span className="fx-stat__label">Following</span>
        </button>

        <button
          type="button"
          className="fx-stat fx-stat--clickable"
          onClick={() => setListType("followers")}
        >
          <span className="fx-stat__value">{followerCount}</span>
          <span className="fx-stat__label">Followers</span>
        </button>
      </div>

      {listType && (
        <FollowListModal userId={userId} type={listType} onClose={() => setListType(null)} />
      )}
    </>
  );
}
