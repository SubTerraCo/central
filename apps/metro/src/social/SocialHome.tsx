import type { HostHomeProps } from "@central/host";
import { PanelFrame, spacePx, tokens, typeStyle } from "@central/open-ui";
import { socialPosts, socialProfiles } from "./fixtures";
import { buildFeed, formatPostDate } from "./models";

const feed = buildFeed(socialPosts, socialProfiles);

export function SocialHome({ installed, bridgeOn, onBridge }: HostHomeProps) {
  return (
    <PanelFrame title="Home">
      <p style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant, margin: 0 }}>
        Metro social home. Local fixtures only — no auth, no live feed backend, no Central
        bridge in this slice. Packages still install from Marketplace.
      </p>
      <div style={{ display: "grid", gap: spacePx(3), marginTop: spacePx(4) }}>
        {feed.map((item) => (
          <article
            key={item.post.id}
            style={{
              display: "grid",
              gap: spacePx(1),
              padding: spacePx(4),
              background: tokens.surfaceContainer,
              border: `1px solid ${tokens.outline}`,
              borderRadius: spacePx(3),
              color: tokens.onSurface,
            }}
          >
            <header style={{ display: "flex", gap: spacePx(2), flexWrap: "wrap", alignItems: "baseline" }}>
              <strong style={{ ...typeStyle("titleSmall"), color: tokens.primary }}>
                {item.author.displayName}
              </strong>
              <span style={{ ...typeStyle("labelMedium"), color: tokens.onSurfaceVariant }}>
                {`@${item.author.handle}`}
              </span>
              <time
                dateTime={item.post.createdAt}
                style={{ ...typeStyle("labelMedium"), color: tokens.onSurfaceVariant, marginLeft: "auto" }}
              >
                {formatPostDate(item.post.createdAt)}
              </time>
            </header>
            <p style={{ ...typeStyle("bodyLarge"), margin: 0 }}>{item.post.body}</p>
          </article>
        ))}
      </div>
      <HubStrip installedCount={installed.length} bridgeOn={bridgeOn} onBridge={onBridge} />
    </PanelFrame>
  );
}

function HubStrip({
  installedCount,
  bridgeOn,
  onBridge,
}: {
  installedCount: number;
  bridgeOn: boolean;
  onBridge: (on: boolean) => void;
}) {
  return (
    <aside
      style={{
        display: "grid",
        gap: spacePx(2),
        marginTop: spacePx(6),
        padding: spacePx(4),
        background: tokens.surfaceContainerLow,
        border: `1px solid ${tokens.outlineVariant}`,
        borderRadius: spacePx(3),
      }}
    >
      <strong style={{ ...typeStyle("titleSmall"), color: tokens.onSurface }}>Packages</strong>
      <p style={{ ...typeStyle("bodySmall"), color: tokens.onSurfaceVariant, margin: 0 }}>
        {installedCount === 0
          ? "No packages installed. The shell runs on its own."
          : `${installedCount} packages installed.`}{" "}
        Metro consumes Central-hosted packages. The owner-marked Metro↔Central allowlist (OB + BI + OT
        + AT) is not wired in this slice and stays off.
      </p>
      <label style={{ ...typeStyle("bodySmall"), color: tokens.onSurface }}>
        <input
          type="checkbox"
          checked={bridgeOn}
          onChange={(event) => onBridge(event.target.checked)}
        />{" "}
        Link finance and time with the other shell
      </label>
      <p style={{ ...typeStyle("bodySmall"), color: tokens.onSurfaceVariant, margin: 0 }}>
        {bridgeOn
          ? "Open Books, Open Bill, and Open Day are shared. Everything else stays on this shell."
          : "The bridge is off. This shell keeps its own records."}
      </p>
    </aside>
  );
}
