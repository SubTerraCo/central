import { timingSafeEqual } from "node:crypto";
import {
  BRIDGE_ENV,
  CARA_ANYTYPE_BRIDGE_DISPLAY_NAME,
  CARA_ANYTYPE_BRIDGE_ID,
  GROK_BOT_ANYTYPE_DEWEY,
  type BridgeConfig,
} from "./config";
import { redactSecrets, safeErrorText, secretsFrom } from "./redact";

type FetchFn = typeof fetch;

type Route =
  | { kind: "health" }
  | { kind: "proxy" }
  | { kind: "method-not-allowed"; allow: string };

export type BridgeHttpOptions = {
  config: BridgeConfig;
  fetchImpl?: FetchFn;
  healthTimeoutMs?: number;
};

const STRIP_INBOUND_HEADERS = new Set([
  "authorization",
  "connection",
  "content-length",
  "cookie",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const STRIP_UPSTREAM_RESPONSE_HEADERS = new Set([
  "authorization",
  "proxy-authenticate",
  "set-cookie",
  "www-authenticate",
]);

const HEALTH_TIMEOUT_MS = 2000;

export function createBridgeHandler(options: BridgeHttpOptions): (request: Request) => Promise<Response> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const healthTimeoutMs = options.healthTimeoutMs ?? HEALTH_TIMEOUT_MS;
  const secrets = secretsFrom(options.config);

  return async (request: Request): Promise<Response> => {
    if (!inboundAuthorized(request, options.config.bridgeToken)) {
      return json(401, { error: "unauthorized" });
    }
    const url = new URL(request.url);
    const route = parseRoute(request.method, url.pathname);
    switch (route.kind) {
      case "health":
        return healthResponse(options.config, fetchImpl, healthTimeoutMs, secrets);
      case "proxy":
        return proxyRequest(request, url, options.config, fetchImpl, secrets);
      case "method-not-allowed":
        return json(405, { error: "method not allowed", allow: route.allow });
      default: {
        const unreachable: never = route;
        return unreachable;
      }
    }
  };
}

function parseRoute(method: string, pathname: string): Route {
  const path = pathname.replace(/\/+$/, "") || "/";
  const normalizedMethod = method.toUpperCase();
  if (path === "/health") {
    if (normalizedMethod === "GET" || normalizedMethod === "HEAD") {
      return { kind: "health" };
    }
    return { kind: "method-not-allowed", allow: "GET" };
  }
  return { kind: "proxy" };
}

function inboundAuthorized(request: Request, token: string | undefined): boolean {
  if (token === undefined) return true;
  const header = request.headers.get("authorization");
  if (header === null || !header.startsWith("Bearer ")) return false;
  const provided = header.slice("Bearer ".length);
  return timingSafeEqualString(token, provided);
}

function timingSafeEqualString(expected: string, provided: string): boolean {
  const want = Buffer.from(expected);
  const got = Buffer.from(provided);
  if (want.length !== got.length) return false;
  return timingSafeEqual(want, got);
}

async function healthResponse(
  config: BridgeConfig,
  fetchImpl: FetchFn,
  timeoutMs: number,
  secrets: readonly string[],
): Promise<Response> {
  const upstreamReachable = await probeUpstream(config.upstream, fetchImpl, timeoutMs);
  const anytypeKeyConfigured = config.anytypeApiKey !== "";
  const body = {
    ok: upstreamReachable,
    service: CARA_ANYTYPE_BRIDGE_ID,
    deweyCode: GROK_BOT_ANYTYPE_DEWEY,
    displayName: CARA_ANYTYPE_BRIDGE_DISPLAY_NAME,
    upstream: config.upstream,
    upstreamReachable,
    anytypeKeyConfigured,
    bridgeAuth: config.bridgeToken === undefined ? "off" : "required",
  };
  return json(upstreamReachable ? 200 : 503, body, secrets);
}

async function probeUpstream(upstream: string, fetchImpl: FetchFn, timeoutMs: number): Promise<boolean> {
  try {
    const response = await fetchImpl(upstream, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
    });
    await response.arrayBuffer();
    return true;
  } catch {
    return false;
  }
}

async function proxyRequest(
  request: Request,
  url: URL,
  config: BridgeConfig,
  fetchImpl: FetchFn,
  secrets: readonly string[],
): Promise<Response> {
  if (config.anytypeApiKey === "") {
    return json(503, {
      error: `${BRIDGE_ENV.anytypeApiKey} is not set on the Cara host`,
    });
  }

  const target = `${config.upstream}${url.pathname}${url.search}`;
  const headers = outboundHeaders(request.headers, config);

  let response: Response;
  try {
    response = await fetchImpl(target, {
      method: request.method,
      headers,
      body: await outboundBody(request),
      redirect: "manual",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anytype Local API unreachable";
    return json(502, { error: safeErrorText(message, secrets) });
  }

  return sanitizeProxiedResponse(response, secrets);
}

function outboundHeaders(inbound: Headers, config: BridgeConfig): Headers {
  const headers = new Headers();
  inbound.forEach((value, key) => {
    if (STRIP_INBOUND_HEADERS.has(key.toLowerCase())) return;
    headers.append(key, value);
  });
  headers.set("authorization", `Bearer ${config.anytypeApiKey}`);
  headers.set("Anytype-Version", config.anytypeVersion);
  return headers;
}

async function outboundBody(request: Request): Promise<ArrayBuffer | undefined> {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;
  const buffer = await request.arrayBuffer();
  return buffer.byteLength > 0 ? buffer : undefined;
}

async function sanitizeProxiedResponse(response: Response, secrets: readonly string[]): Promise<Response> {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (STRIP_UPSTREAM_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    headers.append(key, redactSecrets(value, secrets));
  });

  const contentType = headers.get("content-type") ?? "";
  const isText =
    contentType.startsWith("text/") ||
    contentType.includes("json") ||
    contentType.includes("xml") ||
    contentType === "";

  if (!isText) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const text = redactSecrets(await response.text(), secrets);
  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(status: number, body: unknown, secrets: readonly string[] = []): Response {
  return new Response(redactSecrets(JSON.stringify(body), secrets), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
