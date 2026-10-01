import type { ReactNode } from "react";
import { spacePx, tokens, typeStyle } from "./tokens";

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
      className="central-panel"
      style={{ display: "grid", gap: spacePx(3), maxWidth: wide ? "72rem" : "40rem" }}
    >
      <style>{`
        .central-panel form {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacePx(2)} ${spacePx(3)};
          align-items: end;
        }
        .central-panel label {
          display: grid;
          gap: ${spacePx(1)};
          justify-items: start;
        }
        .central-panel input,
        .central-panel select,
        .central-panel button {
          font: inherit;
        }
      `}</style>
      <h1 style={{ ...typeStyle("headlineMedium"), margin: 0 }}>{title}</h1>
      <div style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant }}>{children}</div>
    </section>
  );
}
