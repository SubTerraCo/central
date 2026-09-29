import type { ReactNode } from "react";
import { tokens } from "./tokens";

export function PanelFrame({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      className="luna-panel"
      style={{ display: "grid", gap: "0.75rem", maxWidth: wide ? "72rem" : "40rem" }}
    >
      <style>{`
        .luna-panel form {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 0.75rem;
          align-items: end;
        }
        .luna-panel label {
          display: grid;
          gap: 0.25rem;
          justify-items: start;
        }
        .luna-panel input,
        .luna-panel select,
        .luna-panel button {
          font: inherit;
        }
      `}</style>
      <h1 style={{ margin: 0, fontSize: "1.75rem" }}>{title}</h1>
      <div style={{ color: tokens.onSurfaceVariant }}>{children}</div>
    </section>
  );
}
