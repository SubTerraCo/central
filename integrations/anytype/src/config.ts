export const GROK_BOT_ANYTYPE_ID = "grok-bot-anytype";
export const GROK_BOT_ANYTYPE_DISPLAY_NAME = "Grok bot Anytype";
export const GROK_BOT_ANYTYPE_DEWEY = "AT";

export const ANYTYPE_ENV = {
  base: "ANYTYPE_BASE",
  apiKey: "ANYTYPE_API_KEY",
  version: "ANYTYPE_VERSION",
  spaceName: "POWERLINE_SPACE_NAME",
  httpHost: "ANYTYPE_HTTP_HOST",
  httpPort: "ANYTYPE_HTTP_PORT",
  bridgeToken: "BRIDGE_TOKEN",
} as const;

export const DEFAULT_ANYTYPE_BASE = "http://127.0.0.1:31009";
export const DEFAULT_ANYTYPE_VERSION = "2025-11-08";
export const DEFAULT_POWERLINE_SPACE_NAME = "Powerline";
export const DEFAULT_HTTP_HOST = "127.0.0.1";
export const DEFAULT_HTTP_PORT = 32109;

export type AnytypeConfig = {
  baseUrl: string;
  apiKey: string;
  apiVersion: string;
  spaceName: string;
};

export type BridgeListenConfig = {
  host: string;
  port: number;
  token: string | undefined;
};

function readTrimmed(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const raw = env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function loadAnytypeConfigFromEnv(env: NodeJS.ProcessEnv = process.env): AnytypeConfig {
  return {
    baseUrl: stripTrailingSlash(readTrimmed(env, ANYTYPE_ENV.base) ?? DEFAULT_ANYTYPE_BASE),
    apiKey: readTrimmed(env, ANYTYPE_ENV.apiKey) ?? "",
    apiVersion: readTrimmed(env, ANYTYPE_ENV.version) ?? DEFAULT_ANYTYPE_VERSION,
    spaceName: readTrimmed(env, ANYTYPE_ENV.spaceName) ?? DEFAULT_POWERLINE_SPACE_NAME,
  };
}

export function loadBridgeListenConfigFromEnv(env: NodeJS.ProcessEnv = process.env): BridgeListenConfig {
  const portRaw = readTrimmed(env, ANYTYPE_ENV.httpPort);
  const parsed = portRaw === undefined ? DEFAULT_HTTP_PORT : Number.parseInt(portRaw, 10);
  const port = Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : DEFAULT_HTTP_PORT;
  return {
    host: readTrimmed(env, ANYTYPE_ENV.httpHost) ?? DEFAULT_HTTP_HOST,
    port,
    token: readTrimmed(env, ANYTYPE_ENV.bridgeToken),
  };
}
