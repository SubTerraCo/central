import { describe, expect, it } from "vitest";
import { balanceCents, parseAmountToCents } from "../src/ledger";

describe("ledger", () => {
  it("parses dollar amounts into cents", () => {
    expect(parseAmountToCents("$1,250.5")).toBe(125050);
    expect(parseAmountToCents("nope")).toBeNull();
  });

  it("subtracts money out from money in", () => {
    expect(
      balanceCents([
        { id: "1", payee: "Door", amountCents: 40000, direction: "in" },
        { id: "2", payee: "Gas", amountCents: 2500, direction: "out" },
      ]),
    ).toBe(37500);
  });
});
