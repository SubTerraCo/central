import { useState } from "react";
import type { ShellId } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";

type Feed = { id: string; provider: "simplefin" | "gocardless"; label: string };

export function BankingPanel({ shellId }: { shellId: ShellId }) {
  const [feeds, save] = useDomain<Feed>(shellId, "bank");
  const [label, setLabel] = useState("");

  return (
    <PanelFrame title="Banking">
      <p>Not connected until you add a feed. Open Books is not required.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (label.trim() === "") return;
          save([...feeds, { id: crypto.randomUUID(), provider: "simplefin", label: label.trim() }]);
          setLabel("");
        }}
      >
        <input aria-label="Account label" value={label} onChange={(event) => setLabel(event.target.value)} />
        <button type="submit">Add SimpleFIN feed</button>
      </form>
      <ul>
        {feeds.map((feed) => (
          <li key={feed.id}>
            {feed.label} · {feed.provider}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
