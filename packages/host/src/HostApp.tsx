import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  bridgeEnabled,
  install,
  listInstalled,
  setBridge,
  uninstall,
  type InstalledPackage,
  type ShellId,
} from "@central/hub";
import { CentralShell, spacePx, tokens, typeStyle, type CentralShellExtraNav } from "@central/open-ui";
import { catalogFor, type CatalogEntry } from "./catalog";

export type HostHomeProps = {
  intro: ReactNode;
  installed: readonly InstalledPackage[];
  bridgeOn: boolean;
  onBridge: (on: boolean) => void;
};

export type HostExtraNavItem = CentralShellExtraNav;

export type HostAppProps = {
  shellId: ShellId;
  home?: ComponentType<HostHomeProps>;
  extraNav?: readonly HostExtraNavItem[];
};

function productTitle(shellId: ShellId): string {
  switch (shellId) {
    case "central":
      return "Central";
    case "metro":
      return "Metro";
    default: {
      const unreachable: never = shellId;
      return unreachable;
    }
  }
}

function introFor(shellId: ShellId): ReactNode {
  switch (shellId) {
    case "central":
      return (
        <>
          <p>Central is the local shell. Install only the packages you want. An uninstalled package is not loaded.</p>
          <p>Omarchy can host Ollama. Gemma 4 12B is the local model when Pepper is installed.</p>
        </>
      );
    case "metro":
      return (
        <>
          <p>
            Metro is the public app for social and ticketing. A tag opens an event page after a SUN response. The UID is
            not a login.
          </p>
          <p>
            Anonymous holders can buy tickets, keep show history, hold digital goods, and use an alias. Friend-show
            visibility stays off until you turn it on.
          </p>
          <p>
            A one-time upgrade unlocks Artist, Venue, or Vendor tools. Open Gig is free for a solo freelancer and
            bills a crew manager of 5 or more.
          </p>
        </>
      );
    default: {
      const unreachable: never = shellId;
      return unreachable;
    }
  }
}

export function HostApp({ shellId, home: HomeSlot, extraNav = [] }: HostAppProps) {
  const offered = useMemo(() => catalogFor(shellId), [shellId]);
  const [section, setSection] = useState("home");
  const [installedCodes, setInstalledCodes] = useState(() => listInstalled(shellId));
  const [bridgeOn, setBridgeOn] = useState(bridgeEnabled);
  const [panels, setPanels] = useState<Record<string, ReactNode>>({});

  const installed: InstalledPackage[] = installedCodes.flatMap((code) => {
    const entry = offered.find((item) => item.code === code);
    return entry ? [{ code: entry.code, name: entry.name }] : [];
  });

  const extraIds = extraNav.map((item) => item.id);
  const visibleSection =
    section === "home" ||
    section === "marketplace" ||
    extraIds.includes(section) ||
    installed.some((item) => item.code === section)
      ? section
      : "home";

  function handleBridge(on: boolean) {
    setBridge(on);
    setBridgeOn(on);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next: Record<string, ReactNode> = {};
      for (const entry of offered) {
        if (!installedCodes.includes(entry.code)) continue;
        const Panel = await entry.load();
        next[entry.code] = (
          <Panel
            key={`${entry.code}-${bridgeOn ? "linked" : "local"}`}
            shellId={shellId}
            installedCodes={installedCodes}
          />
        );
      }
      if (!cancelled) setPanels(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [bridgeOn, installedCodes, offered, shellId]);

  const intro = introFor(shellId);
  const home = HomeSlot ? (
    <HomeSlot intro={intro} installed={installed} bridgeOn={bridgeOn} onBridge={handleBridge} />
  ) : undefined;

  return (
    <CentralShell
      productTitle={productTitle(shellId)}
      intro={intro}
      section={visibleSection}
      installed={installed}
      panels={panels}
      extraNav={extraNav}
      home={home}
      bridgeOn={bridgeOn}
      marketplace={
        <Marketplace
          entries={offered}
          installedCodes={installedCodes}
          onInstall={(code) => {
            install(shellId, code);
            setInstalledCodes(listInstalled(shellId));
            setSection(code);
          }}
          onRemove={(code) => {
            uninstall(shellId, code);
            setInstalledCodes(listInstalled(shellId));
            if (section === code) setSection("marketplace");
          }}
        />
      }
      onSection={setSection}
      onBridge={handleBridge}
    />
  );
}

function Marketplace({
  entries,
  installedCodes,
  onInstall,
  onRemove,
}: {
  entries: readonly CatalogEntry[];
  installedCodes: readonly string[];
  onInstall: (code: string) => void;
  onRemove: (code: string) => void;
}) {
  return (
    <section style={{ display: "grid", gap: spacePx(3), maxWidth: "40rem" }}>
      <h1 style={{ ...typeStyle("headlineMedium"), margin: 0 }}>Marketplace</h1>
      <p style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant }}>
        Each package installs on its own. Removing one leaves the others.
      </p>
      {entries.map((entry) => {
        const on = installedCodes.includes(entry.code);
        return (
          <article
            key={entry.code}
            style={{
              border: `1px solid ${tokens.outline}`,
              borderRadius: spacePx(3),
              padding: `${spacePx(3)} ${spacePx(4)}`,
              display: "grid",
              gap: spacePx(1),
            }}
          >
            <strong>
              {entry.name}{" "}
              <span style={{ color: tokens.onSurfaceVariant }}>{entry.code}</span>
            </strong>
            <span>{entry.summary}</span>
            <button type="button" onClick={() => (on ? onRemove(entry.code) : onInstall(entry.code))}>
              {on ? `Remove ${entry.name}` : `Install ${entry.name}`}
            </button>
          </article>
        );
      })}
    </section>
  );
}
