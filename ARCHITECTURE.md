# Enterprise monorepo blueprint

Resolved ingestion of the PoweredUp / SubTerra architecture. Conflicts with older governance are settled in [GV-0004](DESIGN_RECORDS/GV-0004-enterprise-monorepo.md). Where this file and an older ruling disagree, this file wins. Where this file is silent, `CI_OPS_CONSTITUTION.md` still applies.

Copy this file to the monorepo root at Phase 1. Until that repo exists, this copy is the source of truth.

## Stack

- TypeScript strict mode for UI, domain logic, and shared types. React 19. Vite.
- Two shells only: `apps/luna-os` (Tauri v2 for Windows, macOS, Android, iOS, and Arch Linux) and `apps/web-shell` (offline-first PWA).
- Arch builds install on Omarchy. That machine is the dedicated local AI host: Ollama runs there, and `packages/luna` calls it on localhost. Ship an AppImage and a PKGBUILD.
- Rust only inside Tauri bindings: filesystem, local IPC, NFC hardware, DaVinci socket.
- Local hub store: SQLite via SQLCipher, hub documents synced with Yjs.
- Finance store: Actual's own SQLite CRDT inside `packages/open-books` (`OB`), via `@actual-app/api`. Do not wrap Actual's file in a second CRDT. Invoicing is `packages/open-bill` (`BI`).
- PKM lives in a dedicated Anytype workspace. It is not a package in this monorepo. The shell hub does not require it.
- Material 3 tokens in `packages/open-ui`, generated with `@material/material-color-utilities`, applied through the Tailwind preset in `tooling/config-tailwind`. Seed color `#e8a54b`. No arbitrary Tailwind values. No hardcoded hex or RGB in `.tsx`.

## Apps and packages

```
apps/
  luna-os/               # LO — Tauri command center, including Arch / Omarchy
  web-shell/             # PWA runtime
  subterra-central/      # SC — gigs, events, NFC event page
  open-gig/              # OG — profile, listing, rate, date request
  community/             # CH — voting and discussion UI
packages/
  open-day/              # OD — tasks, timeline, Quick Blocks, Festy crew tools
  open-sort/             # OS — Gmail and IMAP labels and archive
  open-books/            # OB — @actual-app/api budgeting
  open-bill/             # BI — invoicing and 1099 exports
  subtoken/              # TK — NTAG424 challenge-response and tickets
  luna/                  # LU — Ollama, Gemma 4 12B default
  banking/               # BS — SimpleFIN and GoCardless
  forum/                 # FM — Flarum
  home-assistant/        # HA — Home Assistant client
  media/                 # MA — DaVinci, OBS, Loupedeck
  open-ui/               # Material 3 tokens. No app code
tooling/
  config-eslint/
  config-typescript/
  config-tailwind/
  design-governance/     # token check used by CI
```

Luna's provider list is `local-ollama`, `local-vllm`, `cloud-anthropic`, `cloud-openai`, `cloud-gemini`. On Omarchy, local-ollama is the default and the base URL is that machine. Tool definitions and prompt shape do not change when the provider changes. API keys are supplied by the user at runtime and are never committed.

## CI

The monorepo pipeline runs on `master` and `dev`, and on pull requests into `master`. Node 22. pnpm 9. Fail the job on lint, typecheck, token check, unit tests, then build. Playwright covers visual regression, offline Yjs convergence, the finance path (receipt to ledger to Billbot to a simulated bank match), tenant isolation, and mocked NFC plus a local Solana validator.

Create `SubTerraCo/luna` with `master` as the default branch. Do not use `main`.

## Upstream cores

Use these projects for the engine and the patches. Write the Material 3 screen and the shell grant in our package. Do not copy an AGPL server into the monorepo.

| Package | Use | Leave out |
|---------|-----|-----------|
| Open Books `OB` | `@actual-app/api` (MIT). Actual already syncs SimpleFIN and GoCardless | A second ledger. The name Open Budget is already published |
| Open Day `OD` | The existing Blocks app, plus Festy crew screens | Super Productivity. It has no Quick Blocks, and forking it would throw away the kanban that already works |
| Open Bill `BI` | Our invoicing package | InvoiceShelf. We will outbuild it. Do not vendor the AGPL app |
| Open Sort `OS` | Our label-and-archive package | gmailctl and hosted inbox products. We will outbuild them |
| Subtoken `TK` | NXP's public SDM spec for NTAG424. Our ticket record and event page | pretix and Hi.Events. Both are AGPL with extra terms that block a white-label ticket platform |
| Community `CH` / Forum `FM` | Flarum (MIT) | Discourse (GPL) |
| Home Assistant `HA` | `home-assistant-js-websocket` against a local Home Assistant server (Apache 2.0) | Forking Home Assistant |
| Media `MA` | `obs-websocket-js` (MIT). DaVinci's scripting API ships with Resolve | A video editor |
| Luna `LU` | Ollama as the local runtime. Gemma 4 12B as the default weights on a 16GB GPU. Cloud Gemini stays available | Hermes as the default model. Gemma 4 31B and the 26B MoE at Q4_K_M as the daily default |
| Hub | Yjs and SQLCipher | A CRDT written here |
| UI | `@material/material-color-utilities` | A second design system |
| Booking `BO` | No maintained open marketplace matches a profile, a rate, and a date request | Team@Once and Mercur. They are staffing or product commerce, not this listing |
| Anytype `AT` | any-sync, optional | Making it required |

Existing SubTerraCo repos stay on `master` and keep calling governance workflows until they are folded in.

## License

New original code is BSL 1.1. Solos, artists, contributors, nonprofits, and organizations under 5 seats and under $100,000 annual gross revenue get a royalty-free production grant. Larger commercial use needs an Ed25519 license key from PoweredUpLabs. Each commit becomes Apache 2.0 after 36 months.

MIT upstream stays MIT. Already published SubTerra MIT files stay MIT. AGPL code is not vendored. any-sync stays under its own license.

## Marketplace

Every installable package stands alone. It may not import another package. The shell is the only dependency: Material 3, the marketplace, and a small SQLite hub. A package opens and works when the hub is empty.

Optional facts another package might have written are read from the hub only after the user grants that read. If the other package is not installed, those fields stay empty and the installed package still runs.

PKM stays in a dedicated Anytype workspace. It is not a package here, and Open Axiom is cut. The shell hub is the store for installed packages. Other people are not required to run Anytype.

The same package can be installed in Luna OS, in the SubTerra Central PWA, or in both. Each shell has its own hub. Installing it in one shell does not install it in the other.

A person who uses both shells may turn on a data bridge. It is off by default. The bridge copies only Open Books, Open Bill, and Open Day records that the person marks. Mail, banking, and home automation stay on Luna OS. Central's public pages never receive the unbridged Luna hub.

## SubTerra Central access

A tag opens an event page after NTAG424 challenge-response. A UID alone does not sign anyone in.

The tag holder is an anonymous member. They can buy tickets, keep a log of shows, hold digital goods, and follow artists on a limited profile. They may set an alias. Seeing which shows friends attend is off until they turn that permission on, and each person controls their own visibility.

A one-time charge upgrades that profile to Artist, Venue, or Vendor. The charge unlocks the profile tools for that type. Ticket buying, show history, digital goods, and follows stay available without the upgrade.

Booking listings are free for a single freelancer. A crew manager with 5 or more members pays the booking fee. The fee is for managing that crew, not for looking for work alone.

| Package | Luna OS (personal and white-label) | SubTerra Central (public events) | Sells as |
|---------|--------------------------------------|----------------------------------|----------|
| Open Books `OB` | Yes | Only through the owner's bridge | Back-office seat. Bridge is optional |
| Open Bill `BI` | Yes | Only through the owner's bridge | Back-office seat. Bridge is optional |
| Open Day `OD` | Yes. Personal tasks, plus Festy crew drafting | Public schedule only, when granted | Seat. Drafting stays on Luna OS |
| Open Sort `OS` | Yes | No | Back-office seat |
| Banking `BS` | Yes | No | Back-office seat |
| Home Assistant `HA` | Yes | No | Back-office seat |
| Media `MA` | Yes | No | Show-control seat |
| Luna `LU` | Yes | No | Seat. Tools exist only for packages that are installed |
| Subtoken `TK` | Organizer tools | Event page, tickets, show log, digital goods | Ticket price. Anonymous tag access. One-time profile upgrade is separate |
| Open Gig `OG` | Yes | Yes | Free for a solo freelancer. Fee for a crew manager of 5 or more |
| Community `CH` | Crew discussion | Public discussion | Free under the BSL grant. Commercial key past 5 seats |
| Forum `FM` | Optional richer discussion | Optional richer discussion | Same grant. Community still runs without it |

UI is not a marketplace item. It ships inside both shells.

Monetization is the BSL seat key and PoweredUpLabs hosting for Luna OS, ticket prices on SubTerra Central, a one-time Artist, Venue, or Vendor profile upgrade, and the Open Gig fee for crew managers of 5 or more. A solo freelancer does not pay that fee. A package that is not installed is not billed and is not loaded.

## Phases

1. Workspace skeleton matching this layout, strict TypeScript, ESLint 9 flat config, pnpm workspace, Turborepo.
2. Shell hub on SQLite (`better-sqlite3` in Tauri, SQL.js or WASM on the web) and Yjs. `budget` around `@actual-app/api`. `billbot` stays a separate invoicing package. `anytype` is an optional mirror of the hub, not the store packages require.
3. `luna` with the provider interface and a tool registry for budget, blocks, and media. Default the local provider at the Omarchy host.
4. `packages/open-ui` Material 3 tokens and domain widgets: schedule kanban, receipt inspector, invoice preview, topic voting.
5. Bundle `luna-os` in Tauri, including the Arch Linux / Omarchy target, and `subterra-central` as the PWA. Confirm an unlinked Luna OS hub cannot read SubTerra Central data. Confirm a linked bridge copies only Open Books, Open Bill, and Open Day records the owner marked.
6. Playwright suites listed under CI.

## Festy Blocks

`SubTerraCo/festy-blocks` is the working festival crew app. It does not get its own code. The Firebase app and the Vite shell are not carried forward.

| Screen | Home |
|--------|------|
| Team setup, lobby, shift wishlist, conflict resolver, draft board, coverage, time clock | Open Day (`OD`), inside Luna OS |
| The finished schedule | SubTerra Central, read-only, and only when the owner grants it |

Wishlists and the draft are crew-private. They do not appear on the public event page. Booking (`BO`) is still a hire for a date, not this draft.

## Prior plans

These files were searched before building. Vendor roadmaps inside `actual/` stay upstream and are not edited.

| Plan | Still used | Dropped |
|------|------------|---------|
| `subterra-shell` roadmap, August 2026 | Marketplace of optional packages | Electron and Next shells, `apps/nexus`, separate Apps and Integrations tabs, code `ST` as the thing to build |
| `blocks` roadmap | Kanban, timeline, quick-add, and task fields are the Blocks (`BK`) screen spec | Windows-desktop-first order. Luna OS Tauri is the shell for every platform |
| `blocks/Docs/Integrations/HERMES_ECOSYSTEM_ARCHITECTURE.md` | A local agent with tools for Blocks, Billbot, Mailbot, and Anytype | Separate repos and MCP as the architecture. The agent is `packages/luna`. Packages do not import each other |
| `mailbot/cursor_gmail_api_auto_sorting_bot_strat.md` | A later Mailbot slice can pull a bill PDF and hand line items to Billbot if both are installed | Google Sheets as the system of record. The chat export is not a spec |
| GV-0001, GV-0002 | Dewey codes, audience, NFC challenge-response, vendor `upstream` remotes | Admin/Nexus folder layout, Electron shell, polyrepo as the product shape |

Do not start a build from those files. Start from this blueprint.

## Kept from governance

Dewey addresses, manifest registration, fail-closed audience, vendor `upstream` remotes, NFC challenge-response, and the rule that product e2e stays beside the product while cross-repo contracts stay in governance `tests/` until the monorepo `tests/contract` replaces them.
