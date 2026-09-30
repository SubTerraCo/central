export type SocialProfile = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  following: boolean;
};

export type SocialPost = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type SocialFeedItem = {
  post: SocialPost;
  author: SocialProfile;
};

export const SELF_PROFILE_ID = "dewey-sm";

export function profileById(
  profiles: readonly SocialProfile[],
  id: string,
): SocialProfile | undefined {
  return profiles.find((profile) => profile.id === id);
}

export function buildFeed(
  posts: readonly SocialPost[],
  profiles: readonly SocialProfile[],
): SocialFeedItem[] {
  const items: SocialFeedItem[] = [];
  const newestFirst = [...posts].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  for (const post of newestFirst) {
    const author = profileById(profiles, post.authorId);
    if (author === undefined) continue;
    items.push({ post, author });
  }
  return items;
}

export function followedProfiles(
  profiles: readonly SocialProfile[],
  selfId: string = SELF_PROFILE_ID,
): SocialProfile[] {
  return profiles.filter((profile) => profile.id !== selfId && profile.following);
}

export function formatPostDate(iso: string): string {
  return iso.slice(0, 10);
}
