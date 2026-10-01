import { describe, expect, it } from "vitest";
import { formatCents, parseAmountToCents } from "../src/money";

describe("invoice money", () => {
  it("parses dollar amounts into cents", () => {
    expect(parseAmountToCents("400")).toBe(40000);
    expect(parseAmountToCents("$1,250.5")).toBe(125050);
    expect(parseAmountToCents("nope")).toBeNull();
  });

  it("formats cents without inventing a currency picker", () => {
    expect(formatCents(10250)).toBe("$102.50");
    expect(formatCents(0)).toBe("$0.00");
  });
});
