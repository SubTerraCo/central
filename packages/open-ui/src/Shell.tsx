import type { ReactNode } from "react";
import type { InstalledPackage } from "@central/hub";
import { spacePx, tokens, typeStyle } from "./tokens";

export type CentralShellExtraNav = {
  id: string;
  label: string;
  panel: ReactNode;
};

export type CentralShellProps = {
  productTitle: string;
  intro: ReactNode;
  section: string;
  installed: readonly InstalledPackage[];
  panels: Readonly<Record<string, ReactNode>>;
  extraNav?: readonly CentralShellExtraNav[];
  home?: ReactNode;
  bridgeOn: boolean;
  marketplace: ReactNode;
  onSection: (section: string) => void;
  onBridge: (on: boolean) => void;
};

export function CentralShell({
  productTitle,
  intro,
  section,
  installed,
  panels,
  extraNav = [],
  home,
  bridgeOn,
  marketplace,
  onSection,
  onBridge,
}: CentralShellProps) {
  const extraPanel = extraNav.find((item) => item.id === section)?.panel;
  const reserved =
    section === "home" || section === "marketplace" || extraPanel !== undefined;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.surface,
        color: tokens.onSurface,
        fontFamily: tokens.type.fontFamily,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacePx(3),
          flexWrap: "wrap",
          padding: `${spacePx(3)} ${spacePx(5)}`,
          background: tokens.surfaceContainer,
          borderBottom: `1px solid ${tokens.outline}`,
        }}
      >
        <strong style={{ color: tokens.primary }}>{productTitle}</strong>
        <ShellTab label="Home" selected={section === "home"} onPress={() => onSection("home")} />
        {extraNav.map((item) => (
          <ShellTab
            key={item.id}
            label={item.label}
            selected={section === item.id}
            onPress={() => onSection(item.id)}
          />
        ))}
        <ShellTab
          label="Marketplace"
          selected={section === "marketplace"}
          onPress={() => onSection("marketplace")}
        />
        {installed.map((item) => (
          <ShellTab
            key={item.code}
            label={item.name}
            selected={section === item.code}
            onPress={() => onSection(item.code)}
          />
        ))}
      </header>
      <main style={{ padding: spacePx(6) }}>
        {section === "home"
          ? (home ?? (
              <Home intro={intro} installed={installed} bridgeOn={bridgeOn} onBridge={onBridge} />
            ))
          : null}
        {section === "marketplace" ? marketplace : null}
        {extraPanel ?? null}
        {reserved ? null : (panels[section] ?? null)}
      </main>
    </div>
  );
}

function Home({
  intro,
  installed,
  bridgeOn,
  onBridge,
}: {
  intro: ReactNode;
  installed: readonly InstalledPackage[];
  bridgeOn: boolean;
  onBridge: (on: boolean) => void;
}) {
  return (
    <section style={{ display: "grid", gap: spacePx(3), maxWidth: "40rem" }}>
      <h1 style={{ ...typeStyle("headlineMedium"), margin: 0 }}>Home</h1>
      <div>{intro}</div>
      <p style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant }}>
        {installed.length === 0
          ? "No packages installed. The shell runs on its own."
          : `${installed.length} packages installed.`}
      </p>
      <label>
        <input
          type="checkbox"
          checked={bridgeOn}
          onChange={(event) => onBridge(event.target.checked)}
        />{" "}
        Link finance and time with the other shell
      </label>
      <p style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant }}>
        {bridgeOn
          ? "Open Books, Open Bill, Open Time, and Anytype are shared. Everything else stays on this shell."
          : "The bridge is off. This shell keeps its own records."}
      </p>
    </section>
  );
}

function ShellTab({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        ...typeStyle("labelLarge"),
        border: "none",
        borderRadius: "999px",
        padding: `${spacePx(2)} ${spacePx(3)}`,
        background: selected ? tokens.primary : "transparent",
        color: selected ? tokens.onPrimary : tokens.onSurface,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
