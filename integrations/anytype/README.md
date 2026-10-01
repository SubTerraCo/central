# Grok bot Anytype (`AT`)

Central integration for Dewey **AT**. Display name **Grok bot Anytype**. Machine key `grok-bot-anytype`. Classification: **integration** only — not a marketplace package and not a Cara Node service.

**Central hosts this HTTP surface.** Cara only runs Anytype desktop Local API on `127.0.0.1:31009`. When `apps/subterra-central` exists as a process, it should import `createAnytypeHttpHandler` from `@central/anytype`. Until then, run this package on the Central host.

The reusable adapter lives in `@central/integration-adapter` so **Hermes** can implement the same interface later and mount through Central the same way.

APP_REGISTRY leftover path: `integrations/anytype`.

## What Central owns

- Anytype Local API client and credentials (`ANYTYPE_API_KEY` on the Central host env, never in git)
- First-pull of the **Powerline** space (types, tags, task/note/list objects; partial results with warnings)
- Later development tag and view writes (stubbed `501` on this PR)

## What Cara owns

- Anytype desktop, Local API bound to `127.0.0.1:31009` only

## Environment (names only)

Copy `.env.example` to `.env` on the host. Do not commit `.env`.

| Name | Required | Default | Role |
| --- | --- | --- | --- |
| `ANYTYPE_BASE` | no | `http://127.0.0.1:31009` | Cara Local API origin |
| `ANYTYPE_API_KEY` | yes for live calls | | Anytype bearer key. Never logged or returned |
| `ANYTYPE_VERSION` | no | `2025-11-08` | `Anytype-Version` header for v1 |
| `POWERLINE_SPACE_NAME` | no | `Powerline` | Space first-pull resolves |
| `ANYTYPE_HTTP_HOST` | no | `127.0.0.1` | Central listen address |
| `ANYTYPE_HTTP_PORT` | no | `32109` | Central listen port (not Cara `:31009`) |
| `BRIDGE_TOKEN` | if exposing beyond localhost | | Inbound Bearer for Central routes. Distinct from `ANYTYPE_API_KEY` |

## Endpoints (Central host)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Adapter health. Does not return the Anytype key |
| `GET` | `/v1/first-pull` | List spaces → resolve Powerline → types, tags, task/note/list objects |
| `POST` | `/v1/development/tag` | Stub `501` |
| `POST` | `/v1/development/view` | Stub `501` |

When `BRIDGE_TOKEN` is set, every inbound route requires `Authorization: Bearer <BRIDGE_TOKEN>`.

## Run

From the monorepo root, after `pnpm install`:

```bash
cp integrations/anytype/.env.example integrations/anytype/.env
# set ANYTYPE_API_KEY on the Central host; Cara must already serve :31009
pnpm dev:anytype
```

CI does not call live Anytype. Unit tests mock `fetch`.

## Left to do

- Cara: Anytype desktop Local API up on `127.0.0.1:31009`
- Host env: `ANYTYPE_API_KEY` on the Central host (not in git)
- `BRIDGE_TOKEN` when Central is reachable on the LAN
- LAN reachability Cara ↔ Central host (Cara binds loopback; Central must run on the same machine as Anytype or use a local tunnel you control)
- Implement development tag and view writes (replace `501`)
- Mount into `apps/subterra-central` UI when that app exists
- Optional: Hermes `IntegrationAdapter` implementation using this same package
