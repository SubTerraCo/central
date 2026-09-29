# Luna

Luna OS monorepo. Two shells share one marketplace. Packages do not import each other.

- `apps/luna-os` is the Tauri shell for this machine (Windows, macOS, Android, iOS, and an Arch AppImage for Omarchy).
- `apps/web-shell` is SubTerra Central, the gig and event hub.
- `packages/host` is the only place that composes packages.
- `packages/hub` stores records. The finance and time bridge is off until you turn it on. It copies Open Books, Open Bill, and Open Day.

| Code | Package | Where it installs |
| --- | --- | --- |
| OD | Open Day | Both shells |
| OS | Open Sort | Luna OS |
| OB | Open Books | Both shells |
| BI | Open Bill | Both shells |
| LU | Luna | Luna OS |
| TK | Subtoken | Both shells |
| OG | Open Gig | Both shells |
| CH | Community | Both shells |
| FM | Forum | Both shells |
| HA | Home Assistant | Luna OS |
| MA | Media | Luna OS |
| BS | Banking | Luna OS |

Open Day carries the Blocks columns and the Festy Blocks crew draft, coverage check, and time clock. A published schedule is read-only. Open Sort follows the Mailbot rule shape and never deletes mail. Open Gig is free for a solo freelancer and bills a crew manager of 5 or more. Subtoken refuses a tag UID that has no SUN response.

The blueprint is [ARCHITECTURE.md](./ARCHITECTURE.md). Governance lives in `SubTerraCo/subterra-governance`. New code in this repo is BSL 1.1. See [LICENSE.md](./LICENSE.md).

## Run

```bash
pnpm install
pnpm dev
```

Luna OS is at http://localhost:1420. SubTerra Central is:

```bash
pnpm dev:web
```

That window is at http://localhost:1421.

Each dev server keeps its own browser storage. The bridge shares Open Books, Open Bill, and Open Day when both shells use the same hub. That happens in the Tauri app and in the hub tests. Two localhost ports do not share `localStorage`.

The Tauri window, after the frontend is running:

```bash
pnpm --filter @luna/os tauri dev
```

Arch Linux builds target an AppImage for Omarchy. That packaging step comes after this first window.
