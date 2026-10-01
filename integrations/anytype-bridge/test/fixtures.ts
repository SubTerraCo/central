/** Obvious fixtures only. Never real Anytype or LAN secrets. */
export const TEST_ANYTYPE_API_KEY = "test-cara-local-anytype-key";
export const TEST_BRIDGE_TOKEN = "test-lan-bridge-token";
export const TEST_UPSTREAM = "http://127.0.0.1:31009";

export function expectNoSecrets(value: unknown): void {
  const text = JSON.stringify(value);
  if (text.includes(TEST_ANYTYPE_API_KEY) || text.includes(TEST_BRIDGE_TOKEN)) {
    throw new Error("response leaked a fixture secret");
  }
}

export function testConfig(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    ANYTYPE_API_KEY: TEST_ANYTYPE_API_KEY,
    ANYTYPE_UPSTREAM: TEST_UPSTREAM,
    ANYTYPE_VERSION: "2025-11-08",
    BRIDGE_LISTEN_HOST: "127.0.0.1",
    BRIDGE_LISTEN_PORT: "31010",
    ...overrides,
  };
}
