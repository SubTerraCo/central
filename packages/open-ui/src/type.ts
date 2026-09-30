/**
 * Interim Material 3 type scale.
 *
 * Powerline has not named a brand family yet. Roboto is the M3 default and is
 * **interim** until that pick. The stack is not bundled; system UI covers the
 * fallback. Sizes are dp (1dp = 1px at default density).
 *
 * @see https://m3.material.io/styles/typography/type-scale-tokens
 */
export const FONT_FAMILY = `"Roboto", system-ui, -apple-system, "Segoe UI", sans-serif`;

export const FONT_STATUS = "interim" as const;

export const typeScale = {
  displayLarge: { size: 57, lineHeight: 64, weight: 400, tracking: -0.25 },
  displayMedium: { size: 45, lineHeight: 52, weight: 400, tracking: 0 },
  displaySmall: { size: 36, lineHeight: 44, weight: 400, tracking: 0 },
  headlineLarge: { size: 32, lineHeight: 40, weight: 400, tracking: 0 },
  headlineMedium: { size: 28, lineHeight: 36, weight: 400, tracking: 0 },
  headlineSmall: { size: 24, lineHeight: 32, weight: 400, tracking: 0 },
  titleLarge: { size: 22, lineHeight: 28, weight: 400, tracking: 0 },
  titleMedium: { size: 16, lineHeight: 24, weight: 500, tracking: 0.15 },
  titleSmall: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
  bodyLarge: { size: 16, lineHeight: 24, weight: 400, tracking: 0.5 },
  bodyMedium: { size: 14, lineHeight: 20, weight: 400, tracking: 0.25 },
  bodySmall: { size: 12, lineHeight: 16, weight: 400, tracking: 0.4 },
  labelLarge: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
  labelMedium: { size: 12, lineHeight: 16, weight: 500, tracking: 0.5 },
  labelSmall: { size: 11, lineHeight: 16, weight: 500, tracking: 0.5 },
} as const;

export type TypeRole = keyof typeof typeScale;

export type TypeStyle = {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing: string;
};

export function typeStyle(role: TypeRole): TypeStyle {
  const spec = typeScale[role];
  return {
    fontFamily: FONT_FAMILY,
    fontSize: `${spec.size}px`,
    lineHeight: `${spec.lineHeight}px`,
    fontWeight: spec.weight,
    letterSpacing: `${spec.tracking}px`,
  };
}
