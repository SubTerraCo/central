import { useState } from "react";
import type { PackagePanelProps } from "@central/hub";
import { PanelFrame, useDomain } from "@central/open-ui";
import { applyRules, type MailRule, type SortAction, type SortMatch } from "./apply";

const matchTypes: SortMatch[] = ["from_address", "from_domain", "subject"];
const sample = { from: "venue@shows.example", subject: "Load in Friday" };

function isMatch(value: string): value is SortMatch {
  return matchTypes.some((match) => match === value);
}

function isAction(value: string): value is SortAction {
  return value === "label" || value === "archive";
}

export function OpenSortPanel({ shellId }: PackagePanelProps) {
  const [rules, save] = useDomain<MailRule>(shellId, "sort");
  const [matchType, setMatchType] = useState<SortMatch>("from_domain");
  const [value, setValue] = useState("");
  const [action, setAction] = useState<SortAction>("label");
  const [label, setLabel] = useState("Gigs");
  const outcome = applyRules(sample, rules);

  return (
    <PanelFrame title="Open Sort">
      <p>Rules label or archive mail. Delete and trash stay off. This follows the Mailbot rule shape.</p>
      <p>
        Sample from {sample.from}: {outcome.archived ? "archived" : "in the inbox"}
        {outcome.labels.length > 0 ? ` · ${outcome.labels.join(", ")}` : ""}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim() === "") return;
          save([
            ...rules,
            {
              id: crypto.randomUUID(),
              matchType,
              value: value.trim(),
              action,
              label: action === "label" ? label.trim() : "",
            },
          ]);
          setValue("");
        }}
      >
        <select
          aria-label="Match type"
          value={matchType}
          onChange={(event) => {
            const next = event.target.value;
            if (isMatch(next)) setMatchType(next);
          }}
        >
          <option value="from_address">From address</option>
          <option value="from_domain">From domain</option>
          <option value="subject">Subject</option>
        </select>
        <input
          aria-label="Match"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="shows.example"
        />
        <select
          aria-label="Action"
          value={action}
          onChange={(event) => {
            const next = event.target.value;
            if (isAction(next)) setAction(next);
          }}
        >
          <option value="label">Label</option>
          <option value="archive">Archive</option>
        </select>
        {action === "label" ? (
          <input aria-label="Label" value={label} onChange={(event) => setLabel(event.target.value)} />
        ) : null}
        <button type="submit">Add rule</button>
      </form>
      <ul>
        {rules.map((rule) => (
          <li key={rule.id}>
            {rule.action} {rule.matchType} “{rule.value}”{rule.label ? ` · ${rule.label}` : ""}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
