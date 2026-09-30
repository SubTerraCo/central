import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertBridgeBindSafety, loadBridgeConfigFromEnv, type BridgeConfig } from "./config";
import { loadDotEnvFile } from "./dotenv";
import { createBridgeHandler } from "./http";
import { redactSecrets, secretsFrom } from "./redact";

export type StartedBridge = {
  close: () => Promise<void>;
  config: BridgeConfig;
};

export async function startBridgeServer(
  env: NodeJS.ProcessEnv = process.env,
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<StartedBridge> {
  const config = loadBridgeConfigFromEnv(env);
  assertBridgeBindSafety(config);
  const secrets = secretsFrom(config);
  const handle = createBridgeHandler({ config, fetchImpl: deps.fetchImpl });

  const server = createServer((req, res) => {
    void dispatch(req, res, handle, secrets);
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(config.listenPort, config.listenHost, () => resolve());
    server.once("error", reject);
  });

  // Names only. Never print ANYTYPE_API_KEY or BRIDGE_TOKEN values.
  console.log(
    `Cara anytype-bridge (AT) listening on http://${config.listenHost}:${config.listenPort} — upstream ${config.upstream}`,
  );
  console.log(`BRIDGE_TOKEN inbound auth: ${config.bridgeToken ? "required" : "off (loopback only)"}`);
  console.log(`ANYTYPE_API_KEY: ${config.anytypeApiKey ? "set" : "missing"}`);

  return {
    config,
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
  secrets: readonly string[],
): Promise<void> {
  try {
    const request = await incomingToRequest(req);
    const response = await handle(request);
    await writeResponse(res, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "internal error";
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: redactSecrets(message, secrets) }));
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
  const here = dirname(fileURLToPath(import.meta.url));
  loadDotEnvFile(join(here, "..", ".env"));
  void startBridgeServer();
}
