import { describe, expect, it } from "vitest";
import { redactSecret, safeErrorText } from "../src/redact";
import { TEST_ANYTYPE_KEY } from "./mockAnytype";

describe("redaction", () => {
  it("strips the Anytype key from error text", () => {
    expect(redactSecret(`failed ${TEST_ANYTYPE_KEY}`, TEST_ANYTYPE_KEY)).toBe("failed [redacted]");
    expect(safeErrorText(TEST_ANYTYPE_KEY, TEST_ANYTYPE_KEY)).toBe("[redacted]");
  });
});
