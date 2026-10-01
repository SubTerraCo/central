import { PanelFrame, spacePx, tokens, typeStyle } from "@central/open-ui";
import { socialProfiles } from "./fixtures";
import { SELF_PROFILE_ID, followedProfiles, profileById } from "./models";

const self = profileById(socialProfiles, SELF_PROFILE_ID);
const following = followedProfiles(socialProfiles);

export function SocialProfile() {
  if (self === undefined) {
    return (
      <PanelFrame title="Profile">
        <p style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant, margin: 0 }}>
          No local profile fixture.
        </p>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame title="Profile">
      <article
        style={{
          display: "grid",
          gap: spacePx(2),
          padding: spacePx(4),
          background: tokens.surfaceContainer,
          border: `1px solid ${tokens.outline}`,
          borderRadius: spacePx(3),
          color: tokens.onSurface,
        }}
      >
        <strong style={{ ...typeStyle("headlineSmall"), color: tokens.primary }}>{self.displayName}</strong>
        <span style={{ ...typeStyle("labelLarge"), color: tokens.onSurfaceVariant }}>{`@${self.handle}`}</span>
        <p style={{ ...typeStyle("bodyLarge"), margin: 0 }}>{self.bio}</p>
      </article>
      <section style={{ display: "grid", gap: spacePx(2), marginTop: spacePx(4) }}>
        <h2 style={{ ...typeStyle("titleMedium"), color: tokens.onSurface, margin: 0 }}>Following</h2>
        <p style={{ ...typeStyle("bodySmall"), color: tokens.onSurfaceVariant, margin: 0 }}>
          Stub list from local fixtures. Follows are not synced.
        </p>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: spacePx(2),
          }}
        >
          {following.map((profile) => (
            <li
              key={profile.id}
              style={{
                padding: `${spacePx(2)} ${spacePx(3)}`,
                background: tokens.surfaceContainerLow,
                border: `1px solid ${tokens.outlineVariant}`,
                borderRadius: spacePx(2),
                color: tokens.onSurface,
              }}
            >
              <strong style={{ color: tokens.primary }}>{profile.displayName}</strong>{" "}
              <span style={{ ...typeStyle("labelMedium"), color: tokens.onSurfaceVariant }}>
                {`@${profile.handle}`}
              </span>
              <p style={{ ...typeStyle("bodySmall"), margin: `${spacePx(1)} 0 0` }}>{profile.bio}</p>
            </li>
          ))}
        </ul>
      </section>
    </PanelFrame>
  );
}
