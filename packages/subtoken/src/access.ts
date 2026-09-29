export type ProfileTier = "anonymous" | "artist" | "venue" | "vendor";

export type TagPresentation = {
  uid?: string;
  sunResponse?: string;
};

/**
 * A tag UID is not access. The reader must present a SUN/CMAC response.
 * Checking that MAC stays on the reader; this shell only refuses UID-only taps.
 */
export function acceptsTagPresentation(presentation: TagPresentation): boolean {
  return typeof presentation.sunResponse === "string" && presentation.sunResponse.trim() !== "";
}

export function upgradeProfile(current: ProfileTier, next: Exclude<ProfileTier, "anonymous">): ProfileTier {
  if (current !== "anonymous") return current;
  return next;
}

export function friendShowsVisible(enabled: boolean): boolean {
  return enabled;
}
