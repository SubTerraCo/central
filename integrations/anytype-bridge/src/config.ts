export const GROK_BOT_ANYTYPE_DEWEY = "AT";
export const CARA_ANYTYPE_BRIDGE_ID = "cara-anytype-bridge";
export const CARA_ANYTYPE_BRIDGE_DISPLAY_NAME = "Cara Anytype bridge";

export const BRIDGE_ENV = {
  token: "BRIDGE_TOKEN",
  anytypeApiKey: "ANYTYPE_API_KEY",
  anytypeBase: "ANYTYPE_BASE",
  anytypeUpstream: "ANYTYPE_UPSTREAM",
  anytypeVersion: "ANYTYPE_VERSION",
  listenHost: "BRIDGE_LISTEN_HOST",
  listenPort: "BRIDGE_LISTEN_PORT",
} as const;

export const DEFAULT_ANYTYPE_UPSTREAM = "http://127.0.0.1:31009";
export const DEFAULT_ANYTYPE_VERSION = "2025-11-08";
export const DEFAULT_LISTEN_HOST = "127.0.0.1";
export const DEFAULT_LISTEN_PORT = 31010;

export type BridgeConfig = {
  upstream: string;
  anytypeApiKey: string;
  anytypeVersion: string;
  listenHost: string;
  listenPort: number;
  bridgeToken: string | undefined;
};

export class BridgeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BridgeConfigError";
  }
}

function readTrimmed(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const raw = env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function isLoopbackHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  switch (normalized) {
    case "127.0.0.1":
    case "::1":
    case "localhost":
    case "::ffff:127.0.0.1":
      return true;
    default:
      return false;
  }
}

export function loadBridgeConfigFromEnv(env: NodeJS.ProcessEnv = process.env): BridgeConfig {
  const upstreamRaw =
    readTrimmed(env, BRIDGE_ENV.anytypeUpstream) ??
    readTrimmed(env, BRIDGE_ENV.anytypeBase) ??
    DEFAULT_ANYTYPE_UPSTREAM;
  const portRaw = readTrimmed(env, BRIDGE_ENV.listenPort);
  const parsed = portRaw === undefined ? DEFAULT_LISTEN_PORT : Number.parseInt(portRaw, 10);
  const listenPort =
    Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : DEFAULT_LISTEN_PORT;

  return {
    upstream: stripTrailingSlash(upstreamRaw),
    anytypeApiKey: readTrimmed(env, BRIDGE_ENV.anytypeApiKey) ?? "",
    anytypeVersion: readTrimmed(env, BRIDGE_ENV.anytypeVersion) ?? DEFAULT_ANYTYPE_VERSION,
    listenHost: readTrimmed(env, BRIDGE_ENV.listenHost) ?? DEFAULT_LISTEN_HOST,
    listenPort,
    bridgeToken: readTrimmed(env, BRIDGE_ENV.token),
  };
}

/** Fail closed: LAN bind requires BRIDGE_TOKEN, and that token must not be the Anytype key. */
export function assertBridgeBindSafety(config: BridgeConfig): void {
  if (!isLoopbackHost(config.listenHost) && config.bridgeToken === undefined) {
    throw new BridgeConfigError(
      `${BRIDGE_ENV.token} is required when ${BRIDGE_ENV.listenHost} is not loopback. Production LAN must set ${BRIDGE_ENV.token}.`,
    );
  }
  if (
    config.bridgeToken !== undefined &&
    config.anytypeApiKey !== "" &&
    config.bridgeToken === config.anytypeApiKey
  ) {
    throw new BridgeConfigError(
      `${BRIDGE_ENV.token} must be distinct from ${BRIDGE_ENV.anytypeApiKey}. LAN Bearer is ${BRIDGE_ENV.token} only.`,
    );
  }
}
