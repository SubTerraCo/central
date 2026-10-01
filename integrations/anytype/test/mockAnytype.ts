import { AnytypeAdapter } from "../src/adapter";
import { DEFAULT_ANYTYPE_BASE, DEFAULT_ANYTYPE_VERSION, type AnytypeConfig } from "../src/config";
import { hasSecret } from "../src/redact";

export const TEST_ANYTYPE_KEY = "test-anytype-key-do-not-leak";

export const TEST_CONFIG: AnytypeConfig = {
  baseUrl: DEFAULT_ANYTYPE_BASE,
  apiKey: TEST_ANYTYPE_KEY,
  apiVersion: DEFAULT_ANYTYPE_VERSION,
  spaceName: "Powerline",
};

type FetchArgs = Parameters<typeof fetch>;

function asRequest(input: FetchArgs[0], init?: FetchArgs[1]): Request {
  if (input instanceof Request) return init ? new Request(input, init) : input;
  return new Request(input, init);
}

function page(data: unknown[], hasMore = false): string {
  return JSON.stringify({
    data,
    pagination: { has_more: hasMore, limit: 100, offset: 0, total: data.length },
  });
}

export function mockAnytypeFetch(): { fetch: typeof fetch; calls: Request[] } {
  const calls: Request[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const request = asRequest(input, init);
    calls.push(request);
    const url = new URL(request.url);
    if (request.headers.get("authorization") !== `Bearer ${TEST_ANYTYPE_KEY}`) {
      return new Response(JSON.stringify({ error: { message: "unauthorized" } }), { status: 401 });
    }
    if (request.headers.get("anytype-version") !== DEFAULT_ANYTYPE_VERSION) {
      return new Response(JSON.stringify({ error: { message: "version required" } }), { status: 400 });
    }
    if (url.pathname === "/v1/spaces") {
      return new Response(
        page([{ id: "space-powerline", name: "Powerline" }, { id: "space-other", name: "Scratch" }]),
      );
    }
    if (url.pathname === "/v1/spaces/space-powerline/types") {
      return new Response(
        page([
          { id: "type-task", key: "task", name: "Task" },
          { id: "type-note", key: "note", name: "Note" },
          { id: "type-set", key: "set", name: "Query" },
          { id: "type-page", key: "page", name: "Page" },
        ]),
      );
    }
    if (url.pathname === "/v1/spaces/space-powerline/properties") {
      return new Response(
        page([
          { id: "prop-tag", key: "tag", name: "Tag", format: "multi_select" },
          { id: "prop-desc", key: "description", name: "Description", format: "text" },
        ]),
      );
    }
    if (url.pathname === "/v1/spaces/space-powerline/properties/prop-tag/tags") {
      return new Response(page([{ id: "tag-now", key: "now", name: "now", color: "yellow" }]));
    }
    if (url.pathname === "/v1/spaces/space-powerline/objects" && url.searchParams.get("type") === "task") {
      return new Response(
        page([
          {
            id: "obj-task",
            name: "Ship AT",
            space_id: "space-powerline",
            snippet: "first pull",
            type: { key: "task", name: "Task" },
          },
        ]),
      );
    }
    if (url.pathname === "/v1/spaces/space-powerline/objects" && url.searchParams.get("type") === "note") {
      return new Response(
        page([{ id: "obj-note", name: "Powerline note", space_id: "space-powerline", type: { key: "note", name: "Note" } }]),
      );
    }
    if (url.pathname === "/v1/spaces/space-powerline/objects" && url.searchParams.get("type") === "set") {
      return new Response(
        page([{ id: "obj-list", name: "Development", space_id: "space-powerline", type: { key: "set", name: "Query" } }]),
      );
    }
    if (url.pathname.startsWith("/v1/spaces/space-powerline/objects")) {
      return new Response(page([]));
    }
    return new Response(JSON.stringify({ error: { message: "not mocked" } }), { status: 404 });
  };
  return { fetch: fetchImpl, calls };
}

export function adapterWith(fetchImpl: typeof fetch, config: AnytypeConfig = TEST_CONFIG): AnytypeAdapter {
  return new AnytypeAdapter(config, { fetch: fetchImpl });
}

export function expectNoKey(value: unknown): void {
  expectLeakFree(value, TEST_ANYTYPE_KEY);
}

export function expectLeakFree(value: unknown, secret: string): void {
  if (hasSecret(value, secret)) {
    throw new Error("payload leaked a credential");
  }
}
