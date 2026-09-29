import { describe, expect, it } from "vitest";
import { applyRules, type MailRule } from "../src/apply";

const message = { from: "venue@shows.example", subject: "Load in Friday" };

describe("mail rules", () => {
  it("labels a matching domain and archives a matching subject", () => {
    const rules: MailRule[] = [
      {
        id: "1",
        matchType: "from_domain",
        value: "shows.example",
        action: "label",
        label: "Gigs",
      },
      {
        id: "2",
        matchType: "subject",
        value: "load in",
        action: "archive",
        label: "",
      },
    ];
    expect(applyRules(message, rules)).toEqual({ labels: ["Gigs"], archived: true });
  });

  it("leaves unrelated mail alone", () => {
    const rules: MailRule[] = [
      {
        id: "1",
        matchType: "from_address",
        value: "other@example.com",
        action: "archive",
        label: "",
      },
    ];
    expect(applyRules(message, rules)).toEqual({ labels: [], archived: false });
  });
});
