import { describe, expect, it } from "vitest";
import { AnytypeAdapter } from "../src/adapter";
import { ANYTYPE_ENV, GROK_BOT_ANYTYPE_DEWEY, GROK_BOT_ANYTYPE_DISPLAY_NAME, GROK_BOT_ANYTYPE_ID, loadAnytypeConfigFromEnv } from "../src/config";
import { adapterWith, expectNoKey, mockAnytypeFetch, TEST_CONFIG } from "./mockAnytype";

describe("Grok bot Anytype identity", () => {
  it("uses Dewey AT and the locked display name", () => {
    const adapter = adapterWith(mockAnytypeFetch().fetch);
    expect(adapter.id).toBe(GROK_BOT_ANYTYPE_ID);
    expect(adapter.displayName).toBe(GROK_BOT_ANYTYPE_DISPLAY_NAME);
    expect(adapter.deweyCode).toBe(GROK_BOT_ANYTYPE_DEWEY);
    expect(adapter.classification).toBe("integration");
    expect(adapter.credentialEnvVars.some((item) => item.name === ANYTYPE_ENV.apiKey && item.required)).toBe(true);
  });
});

describe("config", () => {
  it("defaults Cara Local API to loopback 31009 without inventing a key", () => {
    const config = loadAnytypeConfigFromEnv({});
    expect(config.baseUrl).toBe("http://127.0.0.1:31009");
    expect(config.apiKey).toBe("");
    expect(config.apiVersion).toBe("2025-11-08");
    expect(config.spaceName).toBe("Powerline");
  });
});

describe("health", () => {
  it("fails closed when ANYTYPE_API_KEY is missing", async () => {
    const adapter = new AnytypeAdapter({ ...TEST_CONFIG, apiKey: "" }, { fetch: mockAnytypeFetch().fetch });
    const health = await adapter.health();
    expect(health.ok).toBe(false);
    expect(health.warnings[0]).toContain(ANYTYPE_ENV.apiKey);
    expectNoKey(health);
  });

  it("reports ok against a mocked Local API", async () => {
    const { fetch, calls } = mockAnytypeFetch();
    const health = await adapterWith(fetch).health();
    expect(health.ok).toBe(true);
    expect(health.details).toEqual({ base: "http://127.0.0.1:31009", caraPort: 31009 });
    expect(calls[0]?.headers.get("authorization")).toBe(`Bearer ${TEST_CONFIG.apiKey}`);
    expectNoKey(health);
  });
});

describe("firstPull", () => {
  it("resolves Powerline and buckets task, note, and list objects", async () => {
    const pulled = await adapterWith(mockAnytypeFetch().fetch).firstPull();
    expect(pulled.space).toEqual({ id: "space-powerline", name: "Powerline" });
    expect(pulled.types.map((item) => item.key)).toContain("task");
    expect(pulled.tags).toEqual([
      {
        id: "tag-now",
        key: "now",
        name: "now",
        color: "yellow",
        propertyId: "prop-tag",
        propertyKey: "tag",
      },
    ]);
    expect(pulled.objects.tasks).toEqual([
      { id: "obj-task", name: "Ship AT", typeKey: "task", spaceId: "space-powerline", snippet: "first pull" },
    ]);
    expect(pulled.objects.notes[0]?.id).toBe("obj-note");
    expect(pulled.objects.lists[0]?.id).toBe("obj-list");
    expect(pulled.warnings).toEqual([]);
    expectNoKey(pulled);
  });

  it("warns when Powerline is missing and still returns a partial shape", async () => {
    const fetchImpl: typeof fetch = async (input, init) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const url = new URL(request.url);
      if (url.pathname === "/v1/spaces") {
        return new Response(JSON.stringify({ data: [{ id: "space-other", name: "Scratch" }], pagination: { has_more: false } }));
      }
      return new Response("{}", { status: 500 });
    };
    const pulled = await adapterWith(fetchImpl).firstPull();
    expect(pulled.space).toBeNull();
    expect(pulled.warnings[0]).toMatch(/Powerline/i);
    expectNoKey(pulled);
  });

  it("keeps going when types fail", async () => {
    const { fetch: base } = mockAnytypeFetch();
    const fetchImpl: typeof fetch = async (input, init) => {
      const request = input instanceof Request ? input : new Request(input, init);
      if (new URL(request.url).pathname.endsWith("/types")) {
        return new Response("nope", { status: 500 });
      }
      return base(request);
    };
    const pulled = await adapterWith(fetchImpl).firstPull();
    expect(pulled.space?.name).toBe("Powerline");
    expect(pulled.warnings.some((item) => item.includes("list types"))).toBe(true);
    expect(pulled.objects.tasks[0]?.id).toBe("obj-task");
    expectNoKey(pulled);
  });
});

describe("write stubs", () => {
  it("returns 501 for development tag and view", async () => {
    const adapter = adapterWith(mockAnytypeFetch().fetch);
    const tag = await adapter.createDevelopmentTag({ name: "development" });
    const view = await adapter.createDevelopmentView({ name: "Development" });
    expect(tag.status).toBe(501);
    expect(view.status).toBe(501);
    expectNoKey(tag);
    expectNoKey(view);
  });
});
