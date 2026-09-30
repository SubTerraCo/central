import {
  argbFromHex,
  customColor,
  DynamicScheme,
  Hct,
  hexFromArgb,
  TonalPalette,
  Variant,
} from "@material/material-color-utilities";
import { POWERLINE_SEEDS } from "./seeds";

export { POWERLINE_SEEDS } from "./seeds";

function toHex(argb: number): string {
  return hexFromArgb(argb).toLowerCase();
}

function schemeFromSeeds(isDark: boolean): DynamicScheme {
  const sourceColorHct = Hct.fromInt(argbFromHex(POWERLINE_SEEDS.primary));
  return new DynamicScheme({
    sourceColorHct,
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
    isDark,
    primaryPalette: TonalPalette.fromInt(argbFromHex(POWERLINE_SEEDS.primary)),
    secondaryPalette: TonalPalette.fromInt(argbFromHex(POWERLINE_SEEDS.secondary)),
    tertiaryPalette: TonalPalette.fromInt(argbFromHex(POWERLINE_SEEDS.tertiary)),
    neutralPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 8),
    neutralVariantPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16),
  });
}

function accentRoles(isDark: boolean) {
  const group = customColor(argbFromHex(POWERLINE_SEEDS.primary), {
    name: "accent",
    value: argbFromHex(POWERLINE_SEEDS.accent),
    blend: false,
  });
  const pair = isDark ? group.dark : group.light;
  return {
    accent: toHex(pair.color),
    onAccent: toHex(pair.onColor),
    accentContainer: toHex(pair.colorContainer),
    onAccentContainer: toHex(pair.onColorContainer),
  };
}

/** Live Material 3 roles from the Powerline seeds. `palette.ts` snapshots the dark result. */
export function colorRoles(isDark: boolean) {
  const scheme = schemeFromSeeds(isDark);
  return {
    seed: POWERLINE_SEEDS.primary,
    seeds: POWERLINE_SEEDS,
    primary: toHex(scheme.primary),
    onPrimary: toHex(scheme.onPrimary),
    primaryContainer: toHex(scheme.primaryContainer),
    onPrimaryContainer: toHex(scheme.onPrimaryContainer),
    inversePrimary: toHex(scheme.inversePrimary),
    secondary: toHex(scheme.secondary),
    onSecondary: toHex(scheme.onSecondary),
    secondaryContainer: toHex(scheme.secondaryContainer),
    onSecondaryContainer: toHex(scheme.onSecondaryContainer),
    tertiary: toHex(scheme.tertiary),
    onTertiary: toHex(scheme.onTertiary),
    tertiaryContainer: toHex(scheme.tertiaryContainer),
    onTertiaryContainer: toHex(scheme.onTertiaryContainer),
    ...accentRoles(isDark),
    error: toHex(scheme.error),
    onError: toHex(scheme.onError),
    errorContainer: toHex(scheme.errorContainer),
    onErrorContainer: toHex(scheme.onErrorContainer),
    background: toHex(scheme.background),
    onBackground: toHex(scheme.onBackground),
    surface: toHex(scheme.surface),
    surfaceDim: toHex(scheme.surfaceDim),
    surfaceBright: toHex(scheme.surfaceBright),
    surfaceContainerLowest: toHex(scheme.surfaceContainerLowest),
    surfaceContainerLow: toHex(scheme.surfaceContainerLow),
    surfaceContainer: toHex(scheme.surfaceContainer),
    surfaceContainerHigh: toHex(scheme.surfaceContainerHigh),
    surfaceContainerHighest: toHex(scheme.surfaceContainerHighest),
    onSurface: toHex(scheme.onSurface),
    surfaceVariant: toHex(scheme.surfaceVariant),
    onSurfaceVariant: toHex(scheme.onSurfaceVariant),
    outline: toHex(scheme.outline),
    outlineVariant: toHex(scheme.outlineVariant),
    inverseSurface: toHex(scheme.inverseSurface),
    inverseOnSurface: toHex(scheme.inverseOnSurface),
    shadow: toHex(scheme.shadow),
    scrim: toHex(scheme.scrim),
    surfaceTint: toHex(scheme.surfaceTint),
  };
}
