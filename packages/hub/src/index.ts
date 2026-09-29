/** A package the shell can show. Packages do not import each other. */
export type InstalledPackage = {
  code: string;
  name: string;
};

/**
 * Shell-owned list of what is turned on.
 * SQLCipher persistence is the next step. An empty list is a valid shell.
 */
export function listInstalled(): InstalledPackage[] {
  return [];
}
