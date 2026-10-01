export function redactSecret(text: string, secret: string): string {
  if (secret === "") return text;
  return text.split(secret).join("[redacted]");
}

export function hasSecret(value: unknown, secret: string): boolean {
  if (secret === "") return false;
  try {
    return JSON.stringify(value).includes(secret);
  } catch {
    return false;
  }
}

export function safeErrorText(text: string, secret: string): string {
  const trimmed = text.trim();
  if (trimmed === "") return "Anytype request failed";
  const redacted = redactSecret(trimmed, secret);
  return redacted.length > 280 ? `${redacted.slice(0, 277)}...` : redacted;
}
