# Central Roadmap

> **Release:** v26.09.30  
> **Last Updated:** 2026-09-30  
> **Status:** Sprint 0 — Windows, then Linux, then the Metro PWA  
> **APP code:** CT  
> **Grounded Rules:** SubTerraCo/grounded-rules  

Blueprint: Grounded Rules `Docs/ARCHITECTURE.md`. Central (`apps/central`) is the local Tauri app and package host. Metro (`apps/metro`) is the public PWA. Pepper (`packages/pepper`) installs here. The first package on this shell is Open Time (`OT`).

## Batch log

| Batch | Status | Notes |
|-------|--------|-------|
| v26.09.30b1 | draft | Windows Central + Open Time, then Linux AppImage, then Metro PWA. Merges stay draft until Powerline says go. |

## Active sprint 0 (v26.09.30)

Build order. The hub for these three builds is the current browser store. SQLite + Yjs comes after the PWA.

- [x] Point this repo at pnpm 11.14.0 (PI-007).
- [ ] Land product [#7](https://github.com/SubTerraCo/central/pull/7) (Central Tauri, Metro PWA, Pepper), including this Open Time commit.
- [x] Open Time is `packages/open-time`, code `OT`. Live package letters on this branch: Open Bill `OL`, Community `CM`, Media `MD`, Banking `BK`.
- [ ] **Windows.** `pnpm dev`, then `pnpm --filter @central/central tauri dev`. Smoke: Open Time is in the catalog, a task can be added, the crew draft works, the bridge stays off until toggled.
- [ ] Unsigned Windows `tauri build` (NSIS or MSI). No signing.
- [ ] **Linux.** After the Windows smoke, and after Grounded Rules [#17](https://github.com/SubTerraCo/grounded-rules/pull/17) (PI-008, platform code `PP.LX`). Omarchy AppImage plus the PKGBUILD. Same Open Time smoke.
- [ ] **PWA.** After Linux. Metro at `apps/metro` (`pnpm dev:web`, port 1421). Product [#6](https://github.com/SubTerraCo/central/pull/6) (Home / Profile) rebases onto #7 and lands here. Open Time drafting stays on the Central builds. Metro shows a schedule only when granted.

## Docs lock (before the Windows build)

Merge only when Powerline says go.

- [x] Grounded Rules [#22](https://github.com/SubTerraCo/grounded-rules/pull/22) — PI-021. Merged to `master`.
- [ ] Rebase Grounded Rules [#12](https://github.com/SubTerraCo/grounded-rules/pull/12) onto current `master` and rewrite the display to PI-021 before merge. Do not merge it as written.
- [x] [#11](https://github.com/SubTerraCo/grounded-rules/pull/11) content is on [#23](https://github.com/SubTerraCo/grounded-rules/pull/23), waiting on master branch protection. The first merge of #11 landed on the old shell-swap branch, not `master`.
- [ ] [#13](https://github.com/SubTerraCo/grounded-rules/pull/13), [#14](https://github.com/SubTerraCo/grounded-rules/pull/14), and [#16](https://github.com/SubTerraCo/grounded-rules/pull/16) conflict with the shell-swap branch. Rebase them onto `master`. #14 overlaps the Dewey edits still local in Grounded Rules.
- [ ] Hold Grounded Rules [#15](https://github.com/SubTerraCo/grounded-rules/pull/15) until the stub is a Central Tauri release workflow. It does not block Windows.
- [ ] Review product [#4](https://github.com/SubTerraCo/central/pull/4) against #7. Close it or rebase it. Do not merge it in front of #7.

## After the PWA

- [ ] Grounded Rules [#20](https://github.com/SubTerraCo/grounded-rules/pull/20) — Playwright kit and the `subterra-governance` URL sweep.
- [ ] Retargeted [#15](https://github.com/SubTerraCo/grounded-rules/pull/15) — Central Tauri release stub only. No binaries.
- [ ] Product [#3](https://github.com/SubTerraCo/central/pull/3) — Open Bill.
- [ ] Product [#2](https://github.com/SubTerraCo/central/pull/2), then [#5](https://github.com/SubTerraCo/central/pull/5) — Grok bot Anytype stub, then the Cara bridge sketch.
- [ ] SQLite (`better-sqlite3` in Tauri) and Yjs, then Open Books on `@actual-app/api`.
- [ ] Catalog follow-up: Open Books and Open Bill install on Central. Metro receives them only through the bridge.

## Already done

- Grounded Rules #10 merged (Roboto + Roboto Flex, pnpm 11.x).
- Grounded Rules #18 (GV-0007) and #19 merged.
- Grounded Rules #21 closed. The shell-swap drafts replace it.
- This repo's remote is `SubTerraCo/central`.
