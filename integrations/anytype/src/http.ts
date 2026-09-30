import { timingSafeEqual } from "node:crypto";
import type { IntegrationAdapter } from "@central/integration-adapter";

type Route =
  | { kind: "health" }
  | { kind: "first-pull" }
  | { kind: "development-tag" }
  | { kind: "development-view" }
  | { kind: "not-found" }
  | { kind: "method-not-allowed"; allow: string };

export type AnytypeHttpOptions = {
  adapter: IntegrationAdapter;
  bridgeToken?: string;
};

export function createAnytypeHttpHandler(options: AnytypeHttpOptions): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    if (!inboundAuthorized(request, options.bridgeToken)) {
      return json(401, { error: "unauthorized" });
    }
    const url = new URL(request.url);
    const route = parseRoute(request.method, url.pathname);
    switch (route.kind) {
      case "health": {
        const health = await options.adapter.health();
        return json(health.ok ? 200 : 503, health);
      }
      case "first-pull": {
        const pull = await options.adapter.firstPull();
        return json(200, pull);
      }
      case "development-tag": {
        const result = await options.adapter.createDevelopmentTag();
        return json(result.status, result);
      }
      case "development-view": {
        const result = await options.adapter.createDevelopmentView();
        return json(result.status, result);
      }
      case "not-found":
        return json(404, { error: "not found" });
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
    return allow(normalizedMethod, "GET", { kind: "health" });
  }
  if (path === "/v1/first-pull") {
    return allow(normalizedMethod, "GET", { kind: "first-pull" });
  }
  if (path === "/v1/development/tag") {
    return allow(normalizedMethod, "POST", { kind: "development-tag" });
  }
  if (path === "/v1/development/view") {
    return allow(normalizedMethod, "POST", { kind: "development-view" });
  }
  return { kind: "not-found" };
}

function allow(method: string, expected: "GET" | "POST", route: Exclude<Route, { kind: "method-not-allowed" } | { kind: "not-found" }>): Route {
  if (method === expected) return route;
  return { kind: "method-not-allowed", allow: expected };
}

function inboundAuthorized(request: Request, token: string | undefined): boolean {
  if (token === undefined) return true;
  const header = request.headers.get("authorization");
  if (header === null || !header.startsWith("Bearer ")) return false;
  const provided = header.slice("Bearer ".length);
  const want = Buffer.from(token);
  const got = Buffer.from(provided);
  if (want.length !== got.length) return false;
  return timingSafeEqual(want, got);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
