import type { ReactNode } from "react";
import type { InstalledPackage } from "@luna/hub";
import { tokens } from "./tokens";

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
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          padding: "0.75rem 1.25rem",
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
      <main style={{ padding: "1.5rem" }}>
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
    <section style={{ display: "grid", gap: "0.75rem", maxWidth: "40rem" }}>
      <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Home</h1>
      <div>{intro}</div>
      <p style={{ color: tokens.onSurfaceVariant }}>
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
      <p style={{ color: tokens.onSurfaceVariant }}>
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
        border: "none",
        borderRadius: "999px",
        padding: "0.4rem 0.8rem",
        background: selected ? tokens.primary : "transparent",
        color: selected ? tokens.onPrimary : tokens.onSurface,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
