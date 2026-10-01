/**
 * Shared Central integration adapter.
 *
 * Central owns credentials, first-pull, and later tag/view writes.
 * Hermes will implement this same interface so Central can mount it
 * the same way as Grok bot Anytype (`AT`).
 */

export const INTEGRATION_CLASSIFICATION = "integration" as const;

export type IntegrationClassification = typeof INTEGRATION_CLASSIFICATION;

export type CredentialEnvVar = {
  name: string;
  required: boolean;
  description: string;
};

export type HealthStatus = {
  ok: boolean;
  service: string;
  deweyCode: string;
  displayName: string;
  warnings: string[];
  details?: Record<string, unknown>;
};

export type NormalizedSpace = {
  id: string;
  name: string;
};

export type NormalizedType = {
  id: string;
  key: string;
  name: string;
};

export type NormalizedTag = {
  id: string;
  key: string;
  name: string;
  color?: string;
  propertyId: string;
  propertyKey: string;
};

export type NormalizedObject = {
  id: string;
  name: string;
  typeKey: string;
  spaceId: string;
  snippet?: string;
};

export type FirstPullResult = {
  integrationId: string;
  deweyCode: string;
  space: NormalizedSpace | null;
  types: NormalizedType[];
  tags: NormalizedTag[];
  objects: {
    tasks: NormalizedObject[];
    notes: NormalizedObject[];
    lists: NormalizedObject[];
  };
  warnings: string[];
};

export type DevelopmentTagInput = {
  name?: string;
  propertyId?: string;
};

export type DevelopmentViewInput = {
  name?: string;
  listId?: string;
};

export type StubWriteResult = {
  implemented: false;
  status: 501;
  operation: string;
  message: string;
};

export type IntegrationAdapter = {
  readonly id: string;
  readonly displayName: string;
  readonly deweyCode: string;
  readonly classification: IntegrationClassification;
  readonly credentialEnvVars: readonly CredentialEnvVar[];
  health(): Promise<HealthStatus>;
  firstPull(): Promise<FirstPullResult>;
  createDevelopmentTag(input?: DevelopmentTagInput): Promise<StubWriteResult>;
  createDevelopmentView(input?: DevelopmentViewInput): Promise<StubWriteResult>;
};
