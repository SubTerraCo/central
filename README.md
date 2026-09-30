# SubTerra Metro

SubTerra Metro monorepo. Hosts SubTerra Metro, SubTerra Central, and shared packages. Packages do not import each other.

- `apps/subterra-metro` is the Tauri shell for SubTerra Metro, the social media app (Windows, macOS, Android, iOS, and an Arch AppImage for Omarchy). Dewey code `SM`. Address alias `LO`.
- `apps/web-shell` is the current Metro web entry (same product, PWA).
- `apps/subterra-central` is SubTerra Central, the personal AI hub, when that app is present. Dewey code `SC`. Anytype Central integration is Central-side.
- Personal agent Luna (`LU`, `packages/luna`) stays Luna. It is not Metro.
- `packages/host` is the only place that composes packages.
- `packages/hub` stores records. The finance and time bridge is off until you turn it on. It copies Open Books, Open Bill, and Open Day.

| Code | Package | Where it installs |
| --- | --- | --- |
| OD | Open Day | Both Metro shells |
| OS | Open Sort | SubTerra Metro Tauri |
| OB | Open Books | Both Metro shells |
| BI | Open Bill | Both Metro shells |
| LU | Luna | SubTerra Metro Tauri |
| TK | Subtoken | Both Metro shells |
| OG | Open Gig | Both Metro shells |
| CH | Community | Both Metro shells |
| FM | Forum | Both Metro shells |
| HA | Home Assistant | SubTerra Metro Tauri |
| MA | Media | SubTerra Metro Tauri |
| BS | Banking | SubTerra Metro Tauri |

Open Day carries the Blocks columns and the Festy Blocks crew draft, coverage check, and time clock. A published schedule is read-only. Open Sort follows the Mailbot rule shape and never deletes mail. Open Gig is free for a solo freelancer and bills a crew manager of 5 or more. Subtoken refuses a tag UID that has no SUN response.

The blueprint is [ARCHITECTURE.md](./ARCHITECTURE.md). Governance lives in `SubTerraCo/subterra-governance`. New code in this repo is BSL 1.1. See [LICENSE.md](./LICENSE.md).

## Run

```bash
pnpm install
pnpm dev
```

SubTerra Metro (Tauri / Vite) is at http://localhost:1420. The current Metro web entry is:

```bash
pnpm dev:web
```

That window is at http://localhost:1421.

Each dev server keeps its own browser storage. The bridge shares Open Books, Open Bill, and Open Day when both shells use the same hub. That happens in the Tauri app and in the hub tests. Two localhost ports do not share `localStorage`.

The Tauri window, after the frontend is running:

```bash
pnpm --filter @subterra/metro tauri dev
```

Arch Linux builds target an AppImage for Omarchy. That packaging step comes after this first window.
