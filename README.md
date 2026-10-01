# Central

Central monorepo. Two shells share one marketplace. Packages do not import each other.

- `apps/central` is the local Tauri app (Windows, macOS, Android, iOS, and an Arch AppImage for Omarchy). Dewey code `CT`.
- `apps/metro` is the public PWA for social and ticketing. Dewey code `MT`.
- Pepper (`packages/pepper`, `PR`) is the agent router. Hermes is the runtime. Pepper installs on Central.
- `packages/host` is the only place that composes packages.
- `packages/hub` stores records. The finance and time bridge is off until you turn it on. It copies Open Books, Open Bill, and Open Day.

| Code | Package | Where it installs |
| --- | --- | --- |
| OD | Open Day | Both shells |
| OS | Open Sort | Central |
| OB | Open Books | Both shells |
| BI | Open Bill | Both shells |
| PR | Pepper | Central |
| TK | Subtoken | Both shells |
| OG | Open Gig | Both shells |
| CH | Community | Both shells |
| FM | Forum | Both shells |
| HA | Home Assistant | Central |
| MA | Media | Central |
| BS | Banking | Central |

Open Day carries the Blocks columns and the Festy Blocks crew draft, coverage check, and time clock. A published schedule is read-only. Open Sort follows the Mailbot rule shape and never deletes mail. Open Gig is free for a solo freelancer and bills a crew manager of 5 or more. Subtoken refuses a tag UID that has no SUN response.

The blueprint is [ARCHITECTURE.md](./ARCHITECTURE.md). Governance lives in `SubTerraCo/grounded-rules`. New code in this repo is BSL 1.1. See [LICENSE.md](./LICENSE.md).

## Run

```bash
pnpm install
pnpm dev
```

Central is at http://localhost:1420. Metro is:

```bash
pnpm dev:web
```

That window is at http://localhost:1421.

Each dev server keeps its own browser storage. The bridge shares Open Books, Open Bill, and Open Day when both shells use the same hub. That happens in the Tauri app and in the hub tests. Two localhost ports do not share `localStorage`.

The Tauri window, after the frontend is running:

```bash
pnpm --filter @central/central tauri dev
```

Arch Linux builds target an AppImage for Omarchy. That packaging step comes after this first window.
