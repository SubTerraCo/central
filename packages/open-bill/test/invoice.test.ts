import { describe, expect, it } from "vitest";
import { invoiceTotalCents, needs1099 } from "../src/invoice";

describe("invoices", () => {
  it("sums lines and keeps a 1099 flag off an empty bill", () => {
    expect(invoiceTotalCents([{ cents: 10000 }, { cents: 250 }])).toBe(10250);
    expect(needs1099(0, true)).toBe(false);
    expect(needs1099(10250, true)).toBe(true);
  });
});
