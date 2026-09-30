import { describe, expect, it } from "vitest";
import {
  assertBridgeBindSafety,
  BridgeConfigError,
  DEFAULT_ANYTYPE_UPSTREAM,
  DEFAULT_LISTEN_HOST,
  DEFAULT_LISTEN_PORT,
  isLoopbackHost,
  loadBridgeConfigFromEnv,
} from "../src/config";
import { TEST_ANYTYPE_API_KEY, TEST_BRIDGE_TOKEN, testConfig } from "./fixtures";

describe("bridge config", () => {
  it("defaults to Cara loopback upstream and a loopback listen", () => {
    const config = loadBridgeConfigFromEnv({});
    expect(config.upstream).toBe(DEFAULT_ANYTYPE_UPSTREAM);
    expect(config.listenHost).toBe(DEFAULT_LISTEN_HOST);
    expect(config.listenPort).toBe(DEFAULT_LISTEN_PORT);
    expect(config.anytypeVersion).toBe("2025-11-08");
    expect(config.bridgeToken).toBeUndefined();
    expect(config.anytypeApiKey).toBe("");
  });

  it("prefers ANYTYPE_UPSTREAM over ANYTYPE_BASE", () => {
    const config = loadBridgeConfigFromEnv(
      testConfig({
        ANYTYPE_UPSTREAM: "http://127.0.0.1:31009",
        ANYTYPE_BASE: "http://192.168.1.8:31010",
      }),
    );
    expect(config.upstream).toBe("http://127.0.0.1:31009");
  });

  it("uses ANYTYPE_BASE when ANYTYPE_UPSTREAM is unset", () => {
    const config = loadBridgeConfigFromEnv(
      testConfig({
        ANYTYPE_UPSTREAM: undefined,
        ANYTYPE_BASE: "http://127.0.0.1:31009/",
      }),
    );
    expect(config.upstream).toBe("http://127.0.0.1:31009");
  });

  it("treats loopback hosts as safe without BRIDGE_TOKEN", () => {
    expect(isLoopbackHost("127.0.0.1")).toBe(true);
    expect(isLoopbackHost("localhost")).toBe(true);
    const config = loadBridgeConfigFromEnv(testConfig({ BRIDGE_TOKEN: undefined }));
    expect(() => assertBridgeBindSafety(config)).not.toThrow();
  });

  it("refuses a LAN bind without BRIDGE_TOKEN", () => {
    const config = loadBridgeConfigFromEnv(
      testConfig({
        BRIDGE_LISTEN_HOST: "0.0.0.0",
        BRIDGE_TOKEN: undefined,
      }),
    );
    expect(() => assertBridgeBindSafety(config)).toThrow(BridgeConfigError);
    expect(() => assertBridgeBindSafety(config)).toThrow(/BRIDGE_TOKEN is required/);
  });

  it("allows a LAN bind when BRIDGE_TOKEN is set and distinct", () => {
    const config = loadBridgeConfigFromEnv(
      testConfig({
        BRIDGE_LISTEN_HOST: "0.0.0.0",
        BRIDGE_TOKEN: TEST_BRIDGE_TOKEN,
      }),
    );
    expect(() => assertBridgeBindSafety(config)).not.toThrow();
  });

  it("refuses using the Anytype key as BRIDGE_TOKEN", () => {
    const config = loadBridgeConfigFromEnv(
      testConfig({
        BRIDGE_LISTEN_HOST: "0.0.0.0",
        BRIDGE_TOKEN: TEST_ANYTYPE_API_KEY,
      }),
    );
    expect(() => assertBridgeBindSafety(config)).toThrow(/must be distinct/);
  });
});
