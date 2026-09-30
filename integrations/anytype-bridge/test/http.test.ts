import { describe, expect, it } from "vitest";
import { loadBridgeConfigFromEnv } from "../src/config";
import { createBridgeHandler } from "../src/http";
import {
  expectNoSecrets,
  TEST_ANYTYPE_API_KEY,
  TEST_BRIDGE_TOKEN,
  TEST_UPSTREAM,
  testConfig,
} from "./fixtures";

type Recorded = {
  url: string;
  method: string;
  authorization: string | null;
  anytypeVersion: string | null;
  cookie: string | null;
  body: string;
};

function handler(
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch,
): (request: Request) => Promise<Response> {
  return createBridgeHandler({
    config: loadBridgeConfigFromEnv(env),
    fetchImpl,
    healthTimeoutMs: 50,
  });
}

function mockUpstream(
  impl: (request: Request) => Promise<Response> | Response,
): { fetchImpl: typeof fetch; calls: Recorded[] } {
  const calls: Recorded[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(String(input), init);
    calls.push({
      url: request.url,
      method: request.method,
      authorization: request.headers.get("authorization"),
      anytypeVersion: request.headers.get("anytype-version"),
      cookie: request.headers.get("cookie"),
      body: await request.clone().text(),
    });
    return impl(request);
  };
  return { fetchImpl, calls };
}

async function read(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

describe("Cara anytype-bridge HTTP", () => {
  it("reports upstream reachability on /health without secrets", async () => {
    const { fetchImpl, calls } = mockUpstream(() => new Response("ok", { status: 401 }));
    const response = await handler(testConfig(), fetchImpl)(new Request("http://127.0.0.1:31010/health"));
    const body = (await read(response)) as {
      ok: boolean;
      upstreamReachable: boolean;
      anytypeKeyConfigured: boolean;
      upstream: string;
    };
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.upstreamReachable).toBe(true);
    expect(body.anytypeKeyConfigured).toBe(true);
    expect(body.upstream).toBe(TEST_UPSTREAM);
    expect(calls[0]?.authorization).toBeNull();
    expectNoSecrets(body);
  });

  it("returns 503 on /health when localhost:31009 is unreachable", async () => {
    const { fetchImpl } = mockUpstream(() => {
      throw new Error(`connect ${TEST_ANYTYPE_API_KEY}`);
    });
    const response = await handler(testConfig(), fetchImpl)(new Request("http://127.0.0.1:31010/health"));
    const body = await read(response);
    expect(response.status).toBe(503);
    expectNoSecrets(body);
    expect((body as { upstreamReachable: boolean }).upstreamReachable).toBe(false);
  });

  it("requires BRIDGE_TOKEN on inbound routes when set", async () => {
    const { fetchImpl } = mockUpstream(() => new Response("{}"));
    const env = testConfig({ BRIDGE_TOKEN: TEST_BRIDGE_TOKEN });
    const denied = await handler(env, fetchImpl)(new Request("http://127.0.0.1:31010/health"));
    expect(denied.status).toBe(401);
    expectNoSecrets(await read(denied));

    const allowed = await handler(env, fetchImpl)(
      new Request("http://127.0.0.1:31010/health", {
        headers: { authorization: `Bearer ${TEST_BRIDGE_TOKEN}` },
      }),
    );
    expect(allowed.status).toBe(200);
    expectNoSecrets(await read(allowed));
  });

  it("rejects the Anytype key as inbound LAN auth", async () => {
    const { fetchImpl, calls } = mockUpstream(() => new Response("{}"));
    const env = testConfig({ BRIDGE_TOKEN: TEST_BRIDGE_TOKEN });
    const response = await handler(env, fetchImpl)(
      new Request("http://127.0.0.1:31010/v1/spaces", {
        headers: { authorization: `Bearer ${TEST_ANYTYPE_API_KEY}` },
      }),
    );
    expect(response.status).toBe(401);
    expect(calls).toHaveLength(0);
    expectNoSecrets(await read(response));
  });

  it("injects the Cara-local Anytype key only on the localhost hop", async () => {
    const { fetchImpl, calls } = mockUpstream(
      () => new Response(JSON.stringify({ data: [] }), { headers: { "content-type": "application/json" } }),
    );
    const env = testConfig({ BRIDGE_TOKEN: TEST_BRIDGE_TOKEN });
    const response = await handler(env, fetchImpl)(
      new Request("http://192.168.1.8:31010/v1/spaces?limit=1", {
        method: "GET",
        headers: {
          authorization: `Bearer ${TEST_BRIDGE_TOKEN}`,
          cookie: "session=should-not-forward",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(`${TEST_UPSTREAM}/v1/spaces?limit=1`);
    expect(calls[0]?.authorization).toBe(`Bearer ${TEST_ANYTYPE_API_KEY}`);
    expect(calls[0]?.anytypeVersion).toBe("2025-11-08");
    expect(calls[0]?.cookie).toBeNull();
    expectNoSecrets(await read(response));
  });

  it("strips inbound Authorization even when BRIDGE_TOKEN is unset", async () => {
    const inboundAnytypeLooking = "test-inbound-anytype-looking-key";
    const { fetchImpl, calls } = mockUpstream(
      () => new Response("{}", { headers: { "content-type": "application/json" } }),
    );
    const response = await handler(testConfig({ BRIDGE_TOKEN: undefined }), fetchImpl)(
      new Request("http://127.0.0.1:31010/v1/spaces", {
        headers: { authorization: `Bearer ${inboundAnytypeLooking}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(calls[0]?.authorization).toBe(`Bearer ${TEST_ANYTYPE_API_KEY}`);
    expect(calls[0]?.authorization).not.toContain(inboundAnytypeLooking);
    expectNoSecrets(await read(response));
  });

  it("forwards method and body to upstream", async () => {
    const { fetchImpl, calls } = mockUpstream(
      () => new Response("{}", { status: 201, headers: { "content-type": "application/json" } }),
    );
    const env = testConfig();
    const response = await handler(env, fetchImpl)(
      new Request("http://127.0.0.1:31010/v1/spaces/abc/objects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "note" }),
      }),
    );
    expect(response.status).toBe(201);
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.body).toBe(JSON.stringify({ name: "note" }));
  });

  it("does not leak secrets if upstream echoes them", async () => {
    const { fetchImpl } = mockUpstream(
      () =>
        new Response(JSON.stringify({ error: TEST_ANYTYPE_API_KEY, token: TEST_BRIDGE_TOKEN }), {
          status: 500,
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${TEST_ANYTYPE_API_KEY}`,
          },
        }),
    );
    const env = testConfig({ BRIDGE_TOKEN: TEST_BRIDGE_TOKEN });
    const response = await handler(env, fetchImpl)(
      new Request("http://127.0.0.1:31010/v1/spaces", {
        headers: { authorization: `Bearer ${TEST_BRIDGE_TOKEN}` },
      }),
    );
    expect(response.headers.get("authorization")).toBeNull();
    const body = await read(response);
    expectNoSecrets(body);
  });

  it("fails closed when the Cara-local Anytype key is missing", async () => {
    const { fetchImpl, calls } = mockUpstream(() => new Response("{}"));
    const response = await handler(testConfig({ ANYTYPE_API_KEY: undefined }), fetchImpl)(
      new Request("http://127.0.0.1:31010/v1/spaces"),
    );
    expect(response.status).toBe(503);
    expect(calls).toHaveLength(0);
    const body = await read(response);
    expect(JSON.stringify(body)).toContain("ANYTYPE_API_KEY");
    expectNoSecrets(body);
  });
});
