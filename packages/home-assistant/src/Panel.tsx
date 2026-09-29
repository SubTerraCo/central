import { useState } from "react";
import type { ShellId } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";

type Link = { id: string; url: string };

export function HomeAssistantPanel({ shellId }: { shellId: ShellId }) {
  const [links, save] = useDomain<Link>(shellId, "home");
  const [url, setUrl] = useState("http://localhost:8123");

  return (
    <PanelFrame title="Home Assistant">
      <p>The server stays upstream. This package only stores where to reach it.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save([{ id: "local", url: url.trim() }]);
        }}
      >
        <input aria-label="Home Assistant URL" value={url} onChange={(event) => setUrl(event.target.value)} />
        <button type="submit">Save address</button>
      </form>
      <p>{links[0] ? `Saved ${links[0].url}` : "No address saved."}</p>
    </PanelFrame>
  );
}
