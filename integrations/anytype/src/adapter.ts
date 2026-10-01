import {
  INTEGRATION_CLASSIFICATION,
  notImplementedWrite,
  type CredentialEnvVar,
  type DevelopmentTagInput,
  type DevelopmentViewInput,
  type FirstPullResult,
  type HealthStatus,
  type IntegrationAdapter,
  type NormalizedObject,
  type StubWriteResult,
} from "@central/integration-adapter";
import { AnytypeClient, AnytypeRequestError, type AnytypeObject, type AnytypeType } from "./client";
import {
  ANYTYPE_ENV,
  GROK_BOT_ANYTYPE_DEWEY,
  GROK_BOT_ANYTYPE_DISPLAY_NAME,
  GROK_BOT_ANYTYPE_ID,
  type AnytypeConfig,
} from "./config";

const TAG_PROPERTY_FORMATS = new Set(["select", "multi_select"]);

const FALLBACK_TYPE_KEYS = ["task", "note", "list", "collection", "set"] as const;

export const ANYTYPE_CREDENTIAL_ENV_VARS: readonly CredentialEnvVar[] = [
  {
    name: ANYTYPE_ENV.apiKey,
    required: true,
    description: "Anytype Local API bearer key. Central host env only. Never commit or log.",
  },
  {
    name: ANYTYPE_ENV.base,
    required: false,
    description: "Anytype Local API origin. Cara default http://127.0.0.1:31009.",
  },
  {
    name: ANYTYPE_ENV.version,
    required: false,
    description: "Anytype-Version header for v1. Default 2025-11-08.",
  },
  {
    name: ANYTYPE_ENV.spaceName,
    required: false,
    description: "Space first-pull resolves. Default Powerline.",
  },
  {
    name: ANYTYPE_ENV.bridgeToken,
    required: false,
    description: "Inbound Bearer for Central HTTP routes. Distinct from ANYTYPE_API_KEY.",
  },
];

type FetchFn = typeof fetch;

export class AnytypeAdapter implements IntegrationAdapter {
  readonly id = GROK_BOT_ANYTYPE_ID;
  readonly displayName = GROK_BOT_ANYTYPE_DISPLAY_NAME;
  readonly deweyCode = GROK_BOT_ANYTYPE_DEWEY;
  readonly classification = INTEGRATION_CLASSIFICATION;
  readonly credentialEnvVars = ANYTYPE_CREDENTIAL_ENV_VARS;

  private readonly client: AnytypeClient;

  constructor(
    private readonly config: AnytypeConfig,
    deps: { fetch?: FetchFn } = {},
  ) {
    this.client = new AnytypeClient(
      config.baseUrl,
      config.apiKey,
      config.apiVersion,
      deps.fetch ?? globalThis.fetch.bind(globalThis),
    );
  }

  async health(): Promise<HealthStatus> {
    const warnings: string[] = [];
    if (this.config.apiKey === "") {
      return {
        ok: false,
        service: this.id,
        deweyCode: this.deweyCode,
        displayName: this.displayName,
        warnings: [`${ANYTYPE_ENV.apiKey} is not set on the Central host`],
        details: { base: this.config.baseUrl, caraPort: 31009 },
      };
    }
    try {
      await this.client.ping();
    } catch (error) {
      warnings.push(describeSlice("Anytype Local API", error));
      return {
        ok: false,
        service: this.id,
        deweyCode: this.deweyCode,
        displayName: this.displayName,
        warnings,
        details: { base: this.config.baseUrl, caraPort: 31009 },
      };
    }
    return {
      ok: true,
      service: this.id,
      deweyCode: this.deweyCode,
      displayName: this.displayName,
      warnings,
      details: { base: this.config.baseUrl, caraPort: 31009 },
    };
  }

  async firstPull(): Promise<FirstPullResult> {
    const empty = emptyPull(this.id, this.deweyCode);
    if (this.config.apiKey === "") {
      return { ...empty, warnings: [`${ANYTYPE_ENV.apiKey} is not set on the Central host`] };
    }

    let spaces;
    try {
      spaces = await this.client.listSpaces();
    } catch (error) {
      return { ...empty, warnings: [describeSlice("list spaces", error)] };
    }

    const wanted = this.config.spaceName.trim().toLowerCase();
    const space = spaces.find((item) => item.name.trim().toLowerCase() === wanted) ?? null;
    if (!space) {
      return {
        ...empty,
        warnings: [
          `Space ${this.config.spaceName} was not found among ${spaces.length} space(s). Create Powerline in Anytype on Cara.`,
        ],
      };
    }

    const warnings: string[] = [];
    const types = await this.readTypes(space.id, warnings);
    const tags = await this.readTags(space.id, warnings);
    const objects = await this.readObjects(space.id, types, warnings);

    return {
      integrationId: this.id,
      deweyCode: this.deweyCode,
      space,
      types: types.map((item) => ({ id: item.id, key: item.key, name: item.name })),
      tags,
      objects,
      warnings,
    };
  }

  createDevelopmentTag(_input?: DevelopmentTagInput): Promise<StubWriteResult> {
    return Promise.resolve(notImplementedWrite("createDevelopmentTag"));
  }

  createDevelopmentView(_input?: DevelopmentViewInput): Promise<StubWriteResult> {
    return Promise.resolve(notImplementedWrite("createDevelopmentView"));
  }

  private async readTypes(spaceId: string, warnings: string[]): Promise<AnytypeType[]> {
    try {
      return await this.client.listTypes(spaceId);
    } catch (error) {
      warnings.push(describeSlice("list types", error));
      return [];
    }
  }

  private async readTags(spaceId: string, warnings: string[]): Promise<FirstPullResult["tags"]> {
    let properties;
    try {
      properties = await this.client.listProperties(spaceId);
    } catch (error) {
      warnings.push(describeSlice("list properties", error));
      return [];
    }
    const tags: FirstPullResult["tags"] = [];
    for (const property of properties) {
      if (!TAG_PROPERTY_FORMATS.has(property.format)) continue;
      try {
        const listed = await this.client.listTags(spaceId, property);
        tags.push(...listed);
      } catch (error) {
        warnings.push(describeSlice(`list tags for ${property.key}`, error));
      }
    }
    return tags;
  }

  private async readObjects(
    spaceId: string,
    types: AnytypeType[],
    warnings: string[],
  ): Promise<FirstPullResult["objects"]> {
    const objects: FirstPullResult["objects"] = { tasks: [], notes: [], lists: [] };
    const keys = typeKeysToPull(types);
    if (keys.length === 0) {
      warnings.push("No task, note, or list types were found in Powerline; tried well-known keys.");
    }
    for (const typeKey of keys) {
      try {
        const listed = await this.client.listObjectsByType(spaceId, typeKey);
        for (const item of listed) {
          const bucket = objectBucket(item.typeKey || typeKey, item.typeName);
          if (!bucket) continue;
          objects[bucket].push(toNormalizedObject(item));
        }
      } catch (error) {
        warnings.push(describeSlice(`list ${typeKey} objects`, error));
      }
    }
    return objects;
  }
}

function emptyPull(integrationId: string, deweyCode: string): FirstPullResult {
  return {
    integrationId,
    deweyCode,
    space: null,
    types: [],
    tags: [],
    objects: { tasks: [], notes: [], lists: [] },
    warnings: [],
  };
}

function typeKeysToPull(types: AnytypeType[]): string[] {
  const fromSpace = types
    .filter((item) => objectBucket(item.key, item.name) !== null)
    .map((item) => item.key);
  const keys = fromSpace.length > 0 ? fromSpace : [...FALLBACK_TYPE_KEYS];
  return [...new Set(keys)];
}

function objectBucket(typeKey: string, typeName: string): keyof FirstPullResult["objects"] | null {
  const key = typeKey.toLowerCase();
  switch (key) {
    case "task":
      return "tasks";
    case "note":
      return "notes";
    case "list":
    case "collection":
    case "set":
      return "lists";
    default: {
      const name = typeName.toLowerCase();
      if (name === "task") return "tasks";
      if (name === "note") return "notes";
      if (name === "list" || name === "collection" || name === "set") return "lists";
      return null;
    }
  }
}

function toNormalizedObject(item: AnytypeObject): NormalizedObject {
  return {
    id: item.id,
    name: item.name,
    typeKey: item.typeKey,
    spaceId: item.spaceId,
    snippet: item.snippet,
  };
}

function describeSlice(label: string, error: unknown): string {
  if (error instanceof AnytypeRequestError) {
    const status = error.status === 0 ? "unreachable" : String(error.status);
    return `${label} failed (${status}): ${error.message}`;
  }
  if (error instanceof Error) return `${label} failed: ${error.message}`;
  return `${label} failed`;
}
