import { describe, expect, it } from "vitest";
import { applyDotEnvContents } from "../src/dotenv";
import { redactSecret, safeErrorText } from "../src/redact";
import { TEST_ANYTYPE_API_KEY, TEST_BRIDGE_TOKEN } from "./fixtures";

describe("redaction", () => {
  it("strips Cara-local and LAN fixture secrets from error text", () => {
    expect(redactSecret(`failed ${TEST_ANYTYPE_API_KEY}`, TEST_ANYTYPE_API_KEY)).toBe("failed [redacted]");
    expect(safeErrorText(`${TEST_BRIDGE_TOKEN} leaked`, [TEST_BRIDGE_TOKEN])).toBe("[redacted] leaked");
  });
});

describe("dotenv", () => {
  it("fills names without overriding existing env", () => {
    const env: NodeJS.ProcessEnv = { BRIDGE_TOKEN: "already-set" };
    applyDotEnvContents("BRIDGE_TOKEN=from-file\nANYTYPE_API_KEY=\n# comment\nANYTYPE_VERSION=2025-11-08\n", env);
    expect(env.BRIDGE_TOKEN).toBe("already-set");
    expect(env.ANYTYPE_VERSION).toBe("2025-11-08");
    expect(env.ANYTYPE_API_KEY).toBe("");
  });
});
