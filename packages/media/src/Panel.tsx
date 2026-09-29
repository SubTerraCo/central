import { useState } from "react";
import type { ShellId } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";

type Cue = { id: string; target: "obs" | "davinci" | "loupedeck"; label: string };

export function MediaPanel({ shellId }: { shellId: ShellId }) {
  const [cues, save] = useDomain<Cue>(shellId, "media");
  const [label, setLabel] = useState("");

  return (
    <PanelFrame title="Media">
      <p>Cues stay local. OBS connects later through its websocket. DaVinci stays on the machine that has Resolve.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (label.trim() === "") return;
          save([...cues, { id: crypto.randomUUID(), target: "obs", label: label.trim() }]);
          setLabel("");
        }}
      >
        <input aria-label="Cue" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Start stream" />
        <button type="submit">Add OBS cue</button>
      </form>
      <ul>
        {cues.map((cue) => (
          <li key={cue.id}>
            {cue.target} · {cue.label}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
