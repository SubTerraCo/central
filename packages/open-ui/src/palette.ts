/**
 * Dark Material 3 roles for the shells.
 *
 * Snapshot of `colorRoles(true)` from `scheme.ts`, generated with
 * `@material/material-color-utilities`. Tests lock this file to that function
 * so a library upgrade cannot silently drift. Do not hand-tune hexes here.
 */
import { POWERLINE_SEEDS } from "./seeds";

export const darkColorRoles = {
  seed: POWERLINE_SEEDS.primary,
  seeds: POWERLINE_SEEDS,
  primary: "#d7baff",
  onPrimary: "#430783",
  primaryContainer: "#5b2a9b",
  onPrimaryContainer: "#eddcff",
  inversePrimary: "#7445b4",
  secondary: "#ffafd8",
  onSecondary: "#610045",
  secondaryContainer: "#890062",
  onSecondaryContainer: "#ffd8e9",
  tertiary: "#00e0b9",
  onTertiary: "#00382c",
  tertiaryContainer: "#005141",
  onTertiaryContainer: "#3ffdd4",
  accent: "#4cdada",
  onAccent: "#003737",
  accentContainer: "#004f4f",
  onAccentContainer: "#6ff7f6",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  background: "#151219",
  onBackground: "#e8e0eb",
  surface: "#151219",
  surfaceDim: "#151219",
  surfaceBright: "#3c3740",
  surfaceContainerLowest: "#100d14",
  surfaceContainerLow: "#1e1a22",
  surfaceContainer: "#221e26",
  surfaceContainerHigh: "#2c2831",
  surfaceContainerHighest: "#37333c",
  onSurface: "#e8e0eb",
  surfaceVariant: "#4c4357",
  onSurfaceVariant: "#cec2da",
  outline: "#988ca3",
  outlineVariant: "#4c4357",
  inverseSurface: "#e8e0eb",
  inverseOnSurface: "#332f37",
  shadow: "#000000",
  scrim: "#000000",
  surfaceTint: "#d7baff",
} as const;
