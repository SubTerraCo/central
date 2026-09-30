import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { tokens } from "@central/open-ui";
import { MetroApp } from "../src/MetroApp";
import { SocialHome } from "../src/social/SocialHome";
import { SocialProfile } from "../src/social/SocialProfile";
import { socialPosts } from "../src/social/fixtures";

const socialDir = join(dirname(fileURLToPath(import.meta.url)), "../src/social");

function socialSource(): string {
  return readdirSync(socialDir)
    .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
    .map((name) => readFileSync(join(socialDir, name), "utf8"))
    .join("\n");
}

describe("social home", () => {
  it("renders the Metro feed with Powerline tokens", () => {
    const html = renderToString(
      <SocialHome intro={null} installed={[]} bridgeOn={false} onBridge={() => undefined} />,
    );
    expect(html).toContain("Home");
    expect(html).toContain("Metro social home");
    expect(html).toContain(socialPosts.find((post) => post.id === "post-powerline")?.body ?? "");
    expect(html).toContain(tokens.primary);
    expect(html).toContain(tokens.surfaceContainer);
    expect(html.toLowerCase()).not.toContain("e8a54b");
  });

  it("renders the profile stub and Metro shell tabs", () => {
    const profile = renderToString(<SocialProfile />);
    expect(profile).toContain("Dewey");
    expect(profile).toContain("@dewey");
    expect(profile).toContain("Powerline");
    expect(profile.toLowerCase()).not.toContain("e8a54b");

    const shell = renderToString(<MetroApp />);
    expect(shell).toContain("Metro");
    expect(shell).toContain("Home");
    expect(shell).toContain("Profile");
    expect(shell).toContain("Marketplace");
    expect(shell).toContain("Metro social home");
    expect(shell.toLowerCase()).not.toContain("e8a54b");
  });

  it("keeps live amber out of the social surface source", () => {
    const source = socialSource();
    expect(source.toLowerCase()).not.toContain("e8a54b");
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
