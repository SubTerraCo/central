# @luna/open-ui

Material 3 tokens for Luna OS and SubTerra Central.

## Powerline palette

These four colors are the system. Roles are generated with
`@material/material-color-utilities` (`DynamicScheme`, `Variant.TONAL_SPOT`,
custom palettes) and snapshotted for the dark shells in `src/palette.ts`.
Default `tokens` is that dark scheme.

| M3 role | Name | Seed | Notes |
| --- | --- | --- | --- |
| Primary | Purple | `#400080` | Source color. `tokens.primary` is a generated tone of this seed. |
| Secondary | Pink | `#ED1CAD` | Secondary palette. |
| Tertiary | Light blue | `#1CEDC5` | Tertiary palette. |
| Accent (custom) | Teal | `#008080` | Custom accent group (`accent`, `onAccent`, containers). Not error. |

Exact seeds are `tokens.seeds` / `POWERLINE_SEEDS`. Error stays Material 3 red.
Amber `#e8a54b` is retired and must not be used as a live seed.

Surfaces and outlines come from a low-chroma purple-keyed neutral palette so
the shell no longer inherits the old amber warmth.

## Type (interim)

Material 3 type scale (`tokens.type.scale`, `typeStyle(role)`).

Font stack (`tokens.type.fontFamily`):

```
"Roboto", system-ui, -apple-system, "Segoe UI", sans-serif
```

**Interim.** Powerline has not named a brand family yet. Roboto is the M3
default and is **not bundled**; the stack falls back to system UI until that
pick. `tokens.type.status` is `"interim"`.

| Role | Size | Line height | Weight |
| --- | --- | --- | --- |
| displayLarge | 57 | 64 | 400 |
| displayMedium | 45 | 52 | 400 |
| displaySmall | 36 | 44 | 400 |
| headlineLarge | 32 | 40 | 400 |
| headlineMedium | 28 | 36 | 400 |
| headlineSmall | 24 | 32 | 400 |
| titleLarge | 22 | 28 | 400 |
| titleMedium | 16 | 24 | 500 |
| titleSmall | 14 | 20 | 500 |
| bodyLarge | 16 | 24 | 400 |
| bodyMedium | 14 | 20 | 400 |
| bodySmall | 12 | 16 | 400 |
| labelLarge | 14 | 20 | 500 |
| labelMedium | 12 | 16 | 500 |
| labelSmall | 11 | 16 | 500 |

Sizes are dp (1dp = 1px at default density).

## Spacing

4dp grid. `tokens.space[1] === 4`. Use `spacePx(step)` in style props.

| Step | dp |
| --- | --- |
| 0 | 0 |
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 8 | 32 |
| 10 | 40 |
| 12 | 48 |
| 16 | 64 |
