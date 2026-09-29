import { useState } from "react";
import type { PackagePanelProps } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";
import {
  acceptsTagPresentation,
  friendShowsVisible,
  upgradeProfile,
  type ProfileTier,
} from "./access";

type Visit = { id: string; show: string; ticket: boolean; goods: string };
type Profile = { id: string; tier: ProfileTier; alias: string; showFriends: boolean };

const paidTiers = ["artist", "venue", "vendor"] as const;

function isPaidTier(value: string): value is (typeof paidTiers)[number] {
  return paidTiers.some((tier) => tier === value);
}

export function SubtokenPanel({ shellId }: PackagePanelProps) {
  const [visits, saveVisits] = useDomain<Visit>(shellId, "token");
  const [profiles, saveProfiles] = useDomain<Profile>(shellId, "profile");
  const profile = profiles[0] ?? {
    id: "holder",
    tier: "anonymous" as const,
    alias: "",
    showFriends: false,
  };
  const [alias, setAlias] = useState(profile.alias);
  const [sunResponse, setSunResponse] = useState("");
  const [show, setShow] = useState("Friday set");
  const [goods, setGoods] = useState("");
  const [opened, setOpened] = useState(false);
  const [upgradeTo, setUpgradeTo] = useState<(typeof paidTiers)[number]>("artist");
  const friends = friendShowsVisible(profile.showFriends);

  function saveProfile(next: Profile) {
    saveProfiles([next]);
  }

  return (
    <PanelFrame title="Subtoken">
      <p>Challenge-response opens this page. A tag UID is not a login.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setOpened(acceptsTagPresentation({ sunResponse }));
        }}
      >
        <input
          aria-label="SUN response"
          value={sunResponse}
          onChange={(event) => setSunResponse(event.target.value)}
          placeholder="SUN response from the reader"
        />
        <button type="submit">Open event page</button>
      </form>
      <p role="status">{opened ? "Event page is open." : "Waiting for a SUN response."}</p>
      {opened ? (
        <>
          <p>Profile: {profile.tier === "anonymous" ? "Anonymous member" : profile.tier}</p>
          <label>
            Alias{" "}
            <input
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              onBlur={() => saveProfile({ ...profile, alias: alias.trim() })}
              placeholder="Optional alias"
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={profile.showFriends}
              onChange={(event) => saveProfile({ ...profile, showFriends: event.target.checked })}
            />{" "}
            Show which shows friends are attending
          </label>
          <p>{friends ? "Friends list is visible to people you allow." : "Friend visibility is off."}</p>
          {profile.tier === "anonymous" ? (
            <>
              <select
                aria-label="Upgrade type"
                value={upgradeTo}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isPaidTier(next)) setUpgradeTo(next);
                }}
              >
                <option value="artist">Artist</option>
                <option value="venue">Venue</option>
                <option value="vendor">Vendor</option>
              </select>
              <button
                type="button"
                onClick={() => saveProfile({ ...profile, tier: upgradeProfile(profile.tier, upgradeTo) })}
              >
                Upgrade once
              </button>
            </>
          ) : (
            <p>Paid tools for this {profile.tier} profile are unlocked.</p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveVisits([
                ...visits,
                {
                  id: crypto.randomUUID(),
                  show: show.trim() || "Show",
                  ticket: true,
                  goods: goods.trim(),
                },
              ]);
            }}
          >
            <input aria-label="Show" value={show} onChange={(event) => setShow(event.target.value)} />
            <input
              aria-label="Digital goods"
              value={goods}
              onChange={(event) => setGoods(event.target.value)}
              placeholder="Digital goods"
            />
            <button type="submit">Keep ticket</button>
          </form>
          <ul>
            {visits.map((visit) => (
              <li key={visit.id}>
                {visit.show} · ticket held
                {visit.goods ? ` · ${visit.goods}` : ""}
                {profile.alias ? ` · ${profile.alias}` : ""}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </PanelFrame>
  );
}
