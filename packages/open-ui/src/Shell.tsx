import type { InstalledPackage } from "@luna/hub";
import { tokens, type ShellSection } from "./tokens";

export type LunaShellProps = {
  section: ShellSection;
  installed: readonly InstalledPackage[];
  onSection: (section: ShellSection) => void;
};

export function LunaShell({ section, installed, onSection }: LunaShellProps) {
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
          gap: "1rem",
          padding: "0.75rem 1.25rem",
          background: tokens.surfaceContainer,
          borderBottom: `1px solid ${tokens.outline}`,
        }}
      >
        <strong style={{ color: tokens.primary }}>Luna OS</strong>
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <ShellTab
            label="Home"
            selected={section === "home"}
            onPress={() => onSection("home")}
          />
          <ShellTab
            label="Marketplace"
            selected={section === "marketplace"}
            onPress={() => onSection("marketplace")}
          />
        </nav>
      </header>
      <main style={{ padding: "1.5rem" }}>
        {section === "home" ? <Home installed={installed} /> : <Marketplace installed={installed} />}
      </main>
    </div>
  );
}

function Home({ installed }: { installed: readonly InstalledPackage[] }) {
  return (
    <section>
      <h1 style={{ fontSize: "1.75rem", marginTop: 0 }}>Home</h1>
      <p style={{ color: tokens.onSurfaceVariant }}>
        {installed.length === 0
          ? "No packages installed. The shell runs on its own."
          : `${installed.length} packages installed.`}
      </p>
    </section>
  );
}

function Marketplace({ installed }: { installed: readonly InstalledPackage[] }) {
  return (
    <section>
      <h1 style={{ fontSize: "1.75rem", marginTop: 0 }}>Marketplace</h1>
      {installed.length === 0 ? (
        <p data-testid="marketplace-empty" style={{ color: tokens.onSurfaceVariant }}>
          Nothing is installed. Turn a package on when you want it. Each one runs without the others.
        </p>
      ) : (
        <ul>
          {installed.map((item) => (
            <li key={item.code}>
              {item.name} ({item.code})
            </li>
          ))}
        </ul>
      )}
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
