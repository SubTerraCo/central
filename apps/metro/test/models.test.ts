import { describe, expect, it } from "vitest";
import {
  SELF_PROFILE_ID,
  buildFeed,
  followedProfiles,
  formatPostDate,
  profileById,
  type SocialPost,
} from "../src/social/models";
import { socialPosts, socialProfiles } from "../src/social/fixtures";

describe("social models", () => {
  it("orders the feed newest first and drops posts without a profile", () => {
    const orphan: SocialPost = {
      id: "orphan",
      authorId: "missing",
      body: "gone",
      createdAt: "2026-10-01T00:00:00.000Z",
    };
    const feed = buildFeed([...socialPosts, orphan], socialProfiles);
    expect(feed.map((item) => item.post.id)).toEqual([
      "post-powerline",
      "post-central",
      "post-omarchy",
    ]);
    expect(feed[0]?.author.handle).toBe("powerline");
  });

  it("resolves the local profile and followed stubs", () => {
    const self = profileById(socialProfiles, SELF_PROFILE_ID);
    expect(self?.displayName).toBe("Dewey");
    expect(followedProfiles(socialProfiles).map((profile) => profile.handle)).toEqual([
      "powerline",
      "central",
    ]);
    expect(formatPostDate("2026-09-30T12:00:00.000Z")).toBe("2026-09-30");
  });
});
