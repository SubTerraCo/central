/**
 * Powerline brand seeds. These four colors are the system.
 *
 * Mapping into Material 3:
 * - primary   Purple     #400080  — source / primary palette
 * - secondary Pink       #ED1CAD  — secondary palette
 * - tertiary  Light blue #1CEDC5  — tertiary palette
 * - accent    Teal       #008080  — custom accent (not error)
 */
export const POWERLINE_SEEDS = {
  primary: "#400080",
  secondary: "#ED1CAD",
  tertiary: "#1CEDC5",
  accent: "#008080",
} as const;

export type PowerlineSeeds = typeof POWERLINE_SEEDS;
