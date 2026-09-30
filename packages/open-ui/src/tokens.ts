/**
 * Luna / SubTerra design tokens (Powerline).
 *
 * Palette — four brand seeds mapped to Material 3 roles via
 * `@material/material-color-utilities` (`DynamicScheme`, `Variant.TONAL_SPOT`):
 * - primary   Purple     #400080
 * - secondary Pink       #ED1CAD
 * - tertiary  Light blue #1CEDC5
 * - accent    Teal       #008080  (custom; error stays M3 red)
 *
 * `tokens.primary` (and other roles) are generated tones for contrast on the
 * dark shell, snapshotted in `palette.ts`. Exact seeds live on `tokens.seeds`.
 * Amber `#e8a54b` is retired.
 *
 * Type — interim Material 3 type scale, Roboto + system-ui. Font family is
 * pending a later Powerline pick (`FONT_STATUS = "interim"`).
 *
 * Spacing — 4dp grid (`space[1] === 4`).
 *
 * Default `tokens` is the dark scheme the shells use today.
 */
import { darkColorRoles } from "./palette";
import { POWERLINE_SEEDS } from "./seeds";
import { space } from "./space";
import { FONT_FAMILY, FONT_STATUS, typeScale } from "./type";

export const seeds = POWERLINE_SEEDS;

export const tokens = {
  ...darkColorRoles,
  type: {
    fontFamily: FONT_FAMILY,
    status: FONT_STATUS,
    scale: typeScale,
  },
  space,
} as const;

export type ShellSection = "home" | "marketplace";

export { FONT_FAMILY, FONT_STATUS, typeScale, typeStyle, type TypeRole, type TypeStyle } from "./type";
export { space, spacePx, type SpaceStep } from "./space";
export { POWERLINE_SEEDS } from "./seeds";
