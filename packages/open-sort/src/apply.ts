export type SortMatch = "from_address" | "from_domain" | "subject";

export type SortAction = "label" | "archive";

export type MailRule = {
  id: string;
  matchType: SortMatch;
  value: string;
  action: SortAction;
  label: string;
};

export type MailMessage = {
  from: string;
  subject: string;
};

export type SortOutcome = {
  labels: string[];
  archived: boolean;
};

function matches(message: MailMessage, rule: MailRule): boolean {
  switch (rule.matchType) {
    case "from_address":
      return message.from.toLowerCase() === rule.value.toLowerCase();
    case "from_domain": {
      const domain = message.from.split("@")[1]?.toLowerCase() ?? "";
      return domain === rule.value.toLowerCase();
    }
    case "subject":
      return message.subject.toLowerCase().includes(rule.value.toLowerCase());
    default: {
      const unreachable: never = rule.matchType;
      return unreachable;
    }
  }
}

/** Label and archive only. Delete and trash are not actions. */
export function applyRules(message: MailMessage, rules: readonly MailRule[]): SortOutcome {
  const labels: string[] = [];
  let archived = false;
  for (const rule of rules) {
    if (!matches(message, rule)) continue;
    switch (rule.action) {
      case "label":
        if (rule.label !== "" && !labels.includes(rule.label)) labels.push(rule.label);
        break;
      case "archive":
        archived = true;
        break;
      default: {
        const unreachable: never = rule.action;
        return unreachable;
      }
    }
  }
  return { labels, archived };
}
