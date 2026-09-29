import { describe, expect, it } from "vitest";
import { acceptsTagPresentation, friendShowsVisible, upgradeProfile } from "../src/access";

describe("tag access", () => {
  it("refuses a UID with no SUN response", () => {
    expect(acceptsTagPresentation({ uid: "04:11:22" })).toBe(false);
    expect(acceptsTagPresentation({ uid: "04:11:22", sunResponse: "cmac-demo" })).toBe(true);
  });

  it("keeps friend-show visibility off unless chosen", () => {
    expect(friendShowsVisible(false)).toBe(false);
  });

  it("upgrades an anonymous holder once", () => {
    expect(upgradeProfile("anonymous", "vendor")).toBe("vendor");
    expect(upgradeProfile("artist", "vendor")).toBe("artist");
  });
});
