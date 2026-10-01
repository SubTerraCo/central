import { useState } from "react";
import type { ShellId } from "@central/hub";
import { PanelFrame, useDomain } from "@central/open-ui";

type Note = { id: string; text: string };

export function CommunityPanel({ shellId }: { shellId: ShellId }) {
  const [notes, save] = useDomain<Note>(shellId, "community");
  const [text, setText] = useState("");

  return (
    <PanelFrame title="Community">
      <p>This runs with the shell hub alone. Install Forum if you want topics and votes.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim() === "") return;
          save([...notes, { id: crypto.randomUUID(), text: text.trim() }]);
          setText("");
        }}
      >
        <input aria-label="Note" value={text} onChange={(event) => setText(event.target.value)} />
        <button type="submit">Post</button>
      </form>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </PanelFrame>
  );
}
