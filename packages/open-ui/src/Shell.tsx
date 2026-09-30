import type { ReactNode } from "react";
import type { InstalledPackage } from "@luna/hub";
import { spacePx, tokens, typeStyle } from "./tokens";

export type LunaShellProps = {
  productTitle: string;
  intro: ReactNode;
  section: string;
  installed: readonly InstalledPackage[];
  panels: Readonly<Record<string, ReactNode>>;
  bridgeOn: boolean;
  marketplace: ReactNode;
  onSection: (section: string) => void;
  onBridge: (on: boolean) => void;
};

export function LunaShell({
  productTitle,
  intro,
  section,
  installed,
  panels,
  bridgeOn,
  marketplace,
  onSection,
  onBridge,
}: LunaShellProps) {
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
        {section === "home" ? (
          <Home intro={intro} installed={installed} bridgeOn={bridgeOn} onBridge={onBridge} />
        ) : null}
        {section === "marketplace" ? marketplace : null}
        {section !== "home" && section !== "marketplace" ? panels[section] ?? null : null}
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
          ? "Open Books, Open Bill, and Open Day are shared. Everything else stays on this shell."
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
