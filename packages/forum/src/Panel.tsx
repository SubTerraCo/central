import { useState } from "react";
import type { ShellId } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";

type Topic = { id: string; title: string; votes: number };

export function ForumPanel({ shellId }: { shellId: ShellId }) {
  const [topics, save] = useDomain<Topic>(shellId, "forum");
  const [title, setTitle] = useState("");

  return (
    <PanelFrame title="Forum">
      <p>Flarum is the upstream to adopt later. These topics are local and optional.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim() === "") return;
          save([...topics, { id: crypto.randomUUID(), title: title.trim(), votes: 1 }]);
          setTitle("");
        }}
      >
        <input aria-label="Topic" value={title} onChange={(event) => setTitle(event.target.value)} />
        <button type="submit">Start topic</button>
      </form>
      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>
            {topic.title} · {topic.votes}{" "}
            <button
              type="button"
              onClick={() =>
                save(topics.map((item) => (item.id === topic.id ? { ...item, votes: item.votes + 1 } : item)))
              }
            >
              Vote
            </button>
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
