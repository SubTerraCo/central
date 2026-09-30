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
      className="luna-panel"
      style={{ display: "grid", gap: spacePx(3), maxWidth: wide ? "72rem" : "40rem" }}
    >
      <style>{`
        .luna-panel form {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacePx(2)} ${spacePx(3)};
          align-items: end;
        }
        .luna-panel label {
          display: grid;
          gap: ${spacePx(1)};
          justify-items: start;
        }
        .luna-panel input,
        .luna-panel select,
        .luna-panel button {
          font: inherit;
        }
      `}</style>
      <h1 style={{ ...typeStyle("headlineMedium"), margin: 0 }}>{title}</h1>
      <div style={{ ...typeStyle("bodyMedium"), color: tokens.onSurfaceVariant }}>{children}</div>
    </section>
  );
}
