export function isPostOwner(user, post) {
  if (!user || !post) return false;

  const postUserId = post.userId ?? post.authorId;
  if (postUserId != null && Number(postUserId) === Number(user.id)) {
    return true;
  }

  const authorUsername = post.authorUsername;
  if (authorUsername && user.username && authorUsername === user.username) {
    return true;
  }

  return false;
}
