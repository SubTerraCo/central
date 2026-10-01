import { SELF_PROFILE_ID, type SocialPost, type SocialProfile } from "./models";

export const socialProfiles: readonly SocialProfile[] = [
  {
    id: SELF_PROFILE_ID,
    handle: "dewey",
    displayName: "Dewey",
    bio: "SubTerra Metro (SM). Social home on this machine.",
    following: false,
  },
  {
    id: "powerline",
    handle: "powerline",
    displayName: "Powerline",
    bio: "Metro Dev. Packages stay on Central until you install them here.",
    following: true,
  },
  {
    id: "central",
    handle: "central",
    displayName: "SubTerra Central",
    bio: "Personal AI hub. Hosts the packages Metro consumes.",
    following: true,
  },
];

export const socialPosts: readonly SocialPost[] = [
  {
    id: "post-omarchy",
    authorId: SELF_PROFILE_ID,
    body: "Home is the feed. Marketplace still installs packages. Luna stays the local AI package.",
    createdAt: "2026-09-29T18:00:00.000Z",
  },
  {
    id: "post-central",
    authorId: "central",
    body: "SubTerra Central hosts the packages. Metro consumes them. The owner-marked bridge stays off until you turn it on.",
    createdAt: "2026-09-30T09:15:00.000Z",
  },
  {
    id: "post-powerline",
    authorId: "powerline",
    body: "SubTerra Metro is the social app. This home is local fixtures — no live social backend in this slice.",
    createdAt: "2026-09-30T12:00:00.000Z",
  },
];
