import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";
import { AnytypeAdapter } from "./adapter";
import { loadAnytypeConfigFromEnv, loadBridgeListenConfigFromEnv } from "./config";
import { createAnytypeHttpHandler } from "./http";

export async function startAnytypeServer(env: NodeJS.ProcessEnv = process.env): Promise<{ close: () => Promise<void> }> {
  const config = loadAnytypeConfigFromEnv(env);
  const listen = loadBridgeListenConfigFromEnv(env);
  const adapter = new AnytypeAdapter(config);
  const handle = createAnytypeHttpHandler({ adapter, bridgeToken: listen.token });

  const server = createServer((req, res) => {
    void dispatch(req, res, handle);
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(listen.port, listen.host, () => resolve());
    server.once("error", reject);
  });

  // Names only. Never print ANYTYPE_API_KEY or BRIDGE_TOKEN values.
  console.log(
    `Grok bot Anytype (AT) listening on http://${listen.host}:${listen.port} — Central hosts this; Cara Local API is ${config.baseUrl}`,
  );
  console.log(`BRIDGE_TOKEN inbound auth: ${listen.token ? "required" : "off"}`);
  console.log(`ANYTYPE_API_KEY: ${config.apiKey ? "set" : "missing"}`);

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}

async function dispatch(
  req: IncomingMessage,
  res: ServerResponse,
  handle: (request: Request) => Promise<Response>,
): Promise<void> {
  try {
    const request = await incomingToRequest(req);
    const response = await handle(request);
    await writeResponse(res, response);
  } catch {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "internal error" }));
  }
}

async function incomingToRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? "127.0.0.1";
  const url = `http://${host}${req.url ?? "/"}`;
  const method = req.method ?? "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks);
  return new Request(url, { method, headers, body: body.length > 0 ? body : undefined });
}

async function writeResponse(res: ServerResponse, response: Response): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  void startAnytypeServer();
}
