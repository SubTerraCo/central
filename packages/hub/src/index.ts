export type ShellId = "luna-os" | "web-shell";

export type InstalledPackage = {
  code: string;
  name: string;
};

export type PackagePanelProps = {
  shellId: ShellId;
  installedCodes?: readonly string[];
};

export const BRIDGED_DOMAINS = ["books", "bill", "day"] as const;

const PREFIX = "luna.";
const bridged = new Set<string>(BRIDGED_DOMAINS);

const memory = new Map<string, string>();

function browserStore(): Storage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function getItem(key: string): string | null {
  const live = browserStore();
  if (live) return live.getItem(key);
  return memory.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  const live = browserStore();
  if (live) {
    live.setItem(key, value);
    return;
  }
  memory.set(key, value);
}

function removeItem(key: string): void {
  const live = browserStore();
  if (live) {
    live.removeItem(key);
    return;
  }
  memory.delete(key);
}

function parseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowId(row: unknown): string {
  if (typeof row === "object" && row !== null && "id" in row) {
    const id = row.id;
    if (typeof id === "string") return id;
  }
  return JSON.stringify(row);
}

function mergeDomain(domain: string): void {
  const sharedKey = `${PREFIX}shared.${domain}`;
  if (getItem(sharedKey)) return;
  const rows = [
    ...parseArray(getItem(`${PREFIX}luna-os.${domain}`)),
    ...parseArray(getItem(`${PREFIX}web-shell.${domain}`)),
  ];
  if (rows.length === 0) return;
  const seen = new Set<string>();
  const merged: unknown[] = [];
  for (const row of rows) {
    const id = rowId(row);
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(row);
  }
  setItem(sharedKey, JSON.stringify(merged));
}

export function resetHub(): void {
  memory.clear();
  const live = browserStore();
  if (!live) return;
  const keys: string[] = [];
  for (let index = 0; index < live.length; index += 1) {
    const key = live.key(index);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  for (const key of keys) live.removeItem(key);
}

export function bridgeEnabled(): boolean {
  return getItem(`${PREFIX}bridge`) === "on";
}

export function setBridge(on: boolean): void {
  if (on && !bridgeEnabled()) {
    for (const domain of BRIDGED_DOMAINS) mergeDomain(domain);
  }
  setItem(`${PREFIX}bridge`, on ? "on" : "off");
}

export function recordKey(shell: ShellId, domain: string): string {
  if (bridgeEnabled() && bridged.has(domain)) {
    return `${PREFIX}shared.${domain}`;
  }
  return `${PREFIX}${shell}.${domain}`;
}

export function readRecords<T>(shell: ShellId, domain: string): T[] {
  return parseArray(getItem(recordKey(shell, domain))) as T[];
}

export function writeRecords<T>(shell: ShellId, domain: string, rows: readonly T[]): void {
  setItem(recordKey(shell, domain), JSON.stringify(rows));
}

export function listInstalled(shell: ShellId): string[] {
  const raw = getItem(`${PREFIX}${shell}.installed`);
  return parseArray(raw).filter((item): item is string => typeof item === "string");
}

export function install(shell: ShellId, code: string): void {
  const current = listInstalled(shell);
  if (current.includes(code)) return;
  setItem(`${PREFIX}${shell}.installed`, JSON.stringify([...current, code]));
}

export function uninstall(shell: ShellId, code: string): void {
  const next = listInstalled(shell).filter((item) => item !== code);
  setItem(`${PREFIX}${shell}.installed`, JSON.stringify(next));
}

export function clearDomain(shell: ShellId, domain: string): void {
  removeItem(recordKey(shell, domain));
}
