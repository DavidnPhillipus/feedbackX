const ALLOWED_REACTIONS = ["👍", "❤️"] as const;

export type ReactionEmoji = (typeof ALLOWED_REACTIONS)[number];

export function isAllowedReaction(emoji: string): emoji is ReactionEmoji {
  return ALLOWED_REACTIONS.includes(emoji as ReactionEmoji);
}

export function trendingScore(post: {
  createdAt: Date;
  _count: { likes: number; replies: number; followers: number };
}): number {
  const likes = post._count.likes;
  const replies = post._count.replies;
  const follows = post._count.followers;
  const hoursOld = (Date.now() - post.createdAt.getTime()) / 3_600_000;
  const engagement = likes * 2 + replies * 3 + follows;
  return engagement / Math.pow(hoursOld + 2, 1.2);
}

export function buildReactionCounts(
  likes: { emoji: string }[]
): Record<ReactionEmoji, number> {
  const counts: Record<ReactionEmoji, number> = {
    [ALLOWED_REACTIONS[0]]: 0,
    [ALLOWED_REACTIONS[1]]: 0,
  };
  for (const emoji of ALLOWED_REACTIONS) {
    counts[emoji] = 0;
  }
  for (const like of likes) {
    if (isAllowedReaction(like.emoji)) {
      counts[like.emoji] += 1;
    }
  }
  return counts;
}

export { ALLOWED_REACTIONS };
