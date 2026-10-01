import { describe, expect, it } from "vitest";
import { createAnytypeHttpHandler } from "../src/http";
import { adapterWith, expectNoKey, mockAnytypeFetch, TEST_ANYTYPE_KEY } from "./mockAnytype";

const BRIDGE = "test-bridge-token-not-anytype-key";

function handler(bridgeToken?: string) {
  return createAnytypeHttpHandler({ adapter: adapterWith(mockAnytypeFetch().fetch), bridgeToken });
}

async function read(response: Response): Promise<unknown> {
  return response.json() as Promise<unknown>;
}

describe("Central HTTP surface", () => {
  it("serves health without the Anytype key", async () => {
    const response = await handler()(new Request("http://127.0.0.1:32109/health"));
    const body = await read(response);
    expect(response.status).toBe(200);
    expectNoKey(body);
    expect(JSON.stringify(body)).not.toContain(TEST_ANYTYPE_KEY);
  });

  it("serves first-pull", async () => {
    const response = await handler()(new Request("http://127.0.0.1:32109/v1/first-pull"));
    const body = (await read(response)) as { space: { name: string } };
    expect(response.status).toBe(200);
    expect(body.space.name).toBe("Powerline");
    expectNoKey(body);
  });

  it("stubs development writes with 501", async () => {
    const tag = await handler()(new Request("http://127.0.0.1:32109/v1/development/tag", { method: "POST" }));
    const view = await handler()(new Request("http://127.0.0.1:32109/v1/development/view", { method: "POST" }));
    expect(tag.status).toBe(501);
    expect(view.status).toBe(501);
    expectNoKey(await read(tag));
    expectNoKey(await read(view));
  });

  it("requires BRIDGE_TOKEN on inbound routes when set", async () => {
    const denied = await handler(BRIDGE)(new Request("http://127.0.0.1:32109/health"));
    expect(denied.status).toBe(401);
    const allowed = await handler(BRIDGE)(
      new Request("http://127.0.0.1:32109/health", { headers: { authorization: `Bearer ${BRIDGE}` } }),
    );
    expect(allowed.status).toBe(200);
    expectNoKey(await read(allowed));
  });

  it("rejects the Anytype key as inbound auth", async () => {
    const response = await handler(BRIDGE)(
      new Request("http://127.0.0.1:32109/v1/first-pull", {
        headers: { authorization: `Bearer ${TEST_ANYTYPE_KEY}` },
      }),
    );
    expect(response.status).toBe(401);
  });
});
