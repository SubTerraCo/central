import { ANYTYPE_ENV } from "./config";
import { safeErrorText } from "./redact";

export class AnytypeRequestError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = "AnytypeRequestError";
    this.status = status;
    this.path = path;
  }
}

export type AnytypeSpace = {
  id: string;
  name: string;
};

export type AnytypeType = {
  id: string;
  key: string;
  name: string;
};

export type AnytypeProperty = {
  id: string;
  key: string;
  name: string;
  format: string;
};

export type AnytypeTag = {
  id: string;
  key: string;
  name: string;
  color?: string;
  propertyId: string;
  propertyKey: string;
};

export type AnytypeObject = {
  id: string;
  name: string;
  typeKey: string;
  typeName: string;
  spaceId: string;
  snippet?: string;
};

type FetchFn = typeof fetch;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  return asString(record[key]);
}

function mapSpace(value: unknown): AnytypeSpace | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  const name = readString(record, "name");
  if (!id || name === undefined) return null;
  return { id, name };
}

function mapType(value: unknown): AnytypeType | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  const key = readString(record, "key") ?? readString(record, "type_key");
  const name = readString(record, "name") ?? key;
  if (!id || !key || name === undefined) return null;
  return { id, key, name };
}

function mapProperty(value: unknown): AnytypeProperty | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  const key = readString(record, "key") ?? id;
  const name = readString(record, "name") ?? key;
  const format = readString(record, "format") ?? "";
  if (!id || !key || name === undefined) return null;
  return { id, key, name, format };
}

function mapTag(value: unknown, property: AnytypeProperty): AnytypeTag | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  const key = readString(record, "key") ?? id;
  const name = readString(record, "name");
  const color = readString(record, "color");
  if (!id || !key || name === undefined) return null;
  return { id, key, name, color, propertyId: property.id, propertyKey: property.key };
}

function mapObject(value: unknown, fallbackSpaceId: string): AnytypeObject | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  const name = readString(record, "name") ?? "";
  if (!id) return null;
  const typeRecord = asRecord(record.type);
  const typeKey =
    (typeRecord && (readString(typeRecord, "key") ?? readString(typeRecord, "type_key"))) ??
    asString(record.type) ??
    "";
  const typeName = (typeRecord && readString(typeRecord, "name")) ?? typeKey;
  const spaceId = readString(record, "space_id") ?? fallbackSpaceId;
  const snippet = readString(record, "snippet");
  return { id, name, typeKey, typeName, spaceId, snippet };
}

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

export class AnytypeClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly apiVersion: string,
    private readonly fetchImpl: FetchFn,
  ) {}

  async listSpaces(): Promise<AnytypeSpace[]> {
    return this.collect("/v1/spaces", mapSpace);
  }

  async listTypes(spaceId: string): Promise<AnytypeType[]> {
    return this.collect(`/v1/spaces/${encodeURIComponent(spaceId)}/types`, mapType);
  }

  async listProperties(spaceId: string): Promise<AnytypeProperty[]> {
    return this.collect(`/v1/spaces/${encodeURIComponent(spaceId)}/properties`, mapProperty);
  }

  async listTags(spaceId: string, property: AnytypeProperty): Promise<AnytypeTag[]> {
    const path = `/v1/spaces/${encodeURIComponent(spaceId)}/properties/${encodeURIComponent(property.id)}/tags`;
    return this.collect(path, (value) => mapTag(value, property));
  }

  async listObjectsByType(spaceId: string, typeKey: string): Promise<AnytypeObject[]> {
    const path = `/v1/spaces/${encodeURIComponent(spaceId)}/objects?type=${encodeURIComponent(typeKey)}`;
    return this.collect(path, (value) => mapObject(value, spaceId));
  }

  async ping(): Promise<void> {
    await this.getJson("/v1/spaces?limit=1&offset=0");
  }

  private headers(): Headers {
    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Anytype-Version", this.apiVersion);
    return headers;
  }

  private async collect<T>(path: string, mapItem: (value: unknown) => T | null): Promise<T[]> {
    const items: T[] = [];
    const [pathname, initialQuery] = splitPath(path);
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const params = new URLSearchParams(initialQuery);
      if (!params.has("limit")) params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      const payload = await this.getJson(`${pathname}?${params.toString()}`);
      const record = asRecord(payload);
      const rows = record && Array.isArray(record.data) ? record.data : [];
      for (const row of rows) {
        const mapped = mapItem(row);
        if (mapped) items.push(mapped);
      }
      const pagination = record ? asRecord(record.pagination) : null;
      if (pagination?.has_more !== true) break;
    }
    return items;
  }

  private async getJson(path: string): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, { method: "GET", headers: this.headers() });
    } catch (error) {
      throw new AnytypeRequestError(0, path, this.describeNetwork(error));
    }
    const text = await response.text();
    if (!response.ok) {
      throw new AnytypeRequestError(response.status, path, this.describeBody(text, response.status));
    }
    if (text.trim() === "") return {};
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new AnytypeRequestError(response.status, path, "Anytype returned non-JSON");
    }
  }

  private describeNetwork(error: unknown): string {
    const message = error instanceof Error ? error.message : "Anytype Local API unreachable";
    return safeErrorText(`${message}. Set ${ANYTYPE_ENV.apiKey} on the Central host; Cara must serve ${this.baseUrl}.`, this.apiKey);
  }

  private describeBody(text: string, status: number): string {
    return safeErrorText(text === "" ? `Anytype HTTP ${status}` : text, this.apiKey);
  }
}

function splitPath(path: string): [string, string] {
  const q = path.indexOf("?");
  if (q === -1) return [path, ""];
  return [path.slice(0, q), path.slice(q + 1)];
}
