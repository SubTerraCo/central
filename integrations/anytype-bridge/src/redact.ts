const REDACTED = "[redacted]";

export function redactSecret(text: string, secret: string): string {
  if (secret === "") return text;
  return text.split(secret).join(REDACTED);
}

export function redactSecrets(text: string, secrets: readonly string[]): string {
  return secrets.reduce((acc, secret) => redactSecret(acc, secret), text);
}

export function hasSecret(value: unknown, secret: string): boolean {
  if (secret === "") return false;
  try {
    return JSON.stringify(value).includes(secret);
  } catch {
    return false;
  }
}

export function safeErrorText(text: string, secrets: readonly string[]): string {
  const trimmed = text.trim();
  if (trimmed === "") return "bridge request failed";
  const redacted = redactSecrets(trimmed, secrets);
  return redacted.length > 280 ? `${redacted.slice(0, 277)}...` : redacted;
}

export function secretsFrom(config: { anytypeApiKey: string; bridgeToken?: string }): string[] {
  return [config.anytypeApiKey, config.bridgeToken ?? ""].filter((secret) => secret !== "");
}
