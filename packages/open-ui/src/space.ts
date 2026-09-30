/**
 * 4dp spacing grid. `space[1]` is 4. Prefer `spacePx(step)` in CSS/style props
 * instead of rem or magic pixel values.
 */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpaceStep = keyof typeof space;

export function spacePx(step: SpaceStep): string {
  return `${space[step]}px`;
}
