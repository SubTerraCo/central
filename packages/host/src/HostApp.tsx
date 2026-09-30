import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bridgeEnabled,
  install,
  listInstalled,
  setBridge,
  uninstall,
  type InstalledPackage,
  type ShellId,
} from "@luna/hub";
import { LunaShell, spacePx, tokens, typeStyle } from "@luna/open-ui";
import { catalogFor, type CatalogEntry } from "./catalog";

function productTitle(shellId: ShellId): string {
  switch (shellId) {
    case "luna-os":
      return "SubTerra Metro";
    case "web-shell":
      return "SubTerra Central";
    default: {
      const unreachable: never = shellId;
      return unreachable;
    }
  }
}

function introFor(shellId: ShellId): ReactNode {
  switch (shellId) {
    case "luna-os":
      return (
        <>
          <p>SubTerra Metro is the local shell. Install only the packages you want. An uninstalled package is not loaded.</p>
          <p>Omarchy can host Ollama. Gemma 4 12B is the local model when Luna is installed.</p>
        </>
      );
    case "web-shell":
      return (
        <>
          <p>
            SubTerra Central is the gig and event hub. A tag opens an event page after a SUN response. The UID is
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

export function HostApp({ shellId }: { shellId: ShellId }) {
  const offered = useMemo(() => catalogFor(shellId), [shellId]);
  const [section, setSection] = useState("home");
  const [installedCodes, setInstalledCodes] = useState(() => listInstalled(shellId));
  const [bridgeOn, setBridgeOn] = useState(bridgeEnabled);
  const [panels, setPanels] = useState<Record<string, ReactNode>>({});

  const installed: InstalledPackage[] = installedCodes.flatMap((code) => {
    const entry = offered.find((item) => item.code === code);
    return entry ? [{ code: entry.code, name: entry.name }] : [];
  });

  const visibleSection =
    section === "home" || section === "marketplace" || installed.some((item) => item.code === section)
      ? section
      : "home";

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

  return (
    <LunaShell
      productTitle={productTitle(shellId)}
      intro={introFor(shellId)}
      section={visibleSection}
      installed={installed}
      panels={panels}
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
      onBridge={(on) => {
        setBridge(on);
        setBridgeOn(on);
      }}
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
