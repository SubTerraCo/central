# Cara Anytype bridge (`AT` host wiring)

Cara-side reverse proxy so Rook/Central can reach Anytype desktop Local API, which binds **loopback only** (`127.0.0.1:31009`).

Classification: **host/Cara wiring** for Dewey **AT** (Grok bot Anytype / `grok-bot-anytype`). Not a marketplace package. Not the Central client.

Related Central sketch (do not merge this PR into that one): `integrations/anytype` on [PR #2](https://github.com/SubTerraCo/luna-os/pull/2). Central owns the Anytype Local API **client**, first-pull, and later tag/view writes. This package only forwards HTTP to Cara localhost.

## Topology (locked)

| Hop | Who | Origin | Authorization |
| --- | --- | --- | --- |
| Anytype desktop | Cara | `127.0.0.1:31009` | Anytype Local API |
| This bridge | Cara | default `127.0.0.1:31010` (set a LAN host to expose) | Inbound: `BRIDGE_TOKEN` only |
| Central HTTP | Central/Rook | default `127.0.0.1:32109` (PR #2) | Central routes; client talks to this bridge via `ANYTYPE_BASE` |

**Never put `ANYTYPE_API_KEY` on the LAN.** Cara injects it only on the Cara → `127.0.0.1:31009` hop. Rook/Central send `Authorization: Bearer ${BRIDGE_TOKEN}`. Inbound Anytype Bearer values are ignored or rejected.

Cara holds a **local copy** of the key for injection. Central still owns the client and is the system of record for the credential. This is host wiring, not a move of ownership.

## Environment (names only)

Copy `.env.example` to `.env` on Cara. Do not commit `.env`. Never put secret values in git, PRs, tests, or logs.

| Name | Required | Default | Role |
| --- | --- | --- | --- |
| `BRIDGE_TOKEN` | **yes on LAN** | unset | Inbound Bearer for Rook/Central. Distinct from `ANYTYPE_API_KEY`. Process **refuses** to bind a non-loopback host without this. |
| `ANYTYPE_API_KEY` | yes for proxying | | Cara-local Anytype bearer. Injected only toward `127.0.0.1:31009`. Never forwarded from LAN clients. |
| `ANYTYPE_UPSTREAM` | no | `http://127.0.0.1:31009` | Cara → Anytype desktop. Preferred name on Cara. |
| `ANYTYPE_BASE` | no | same default | Alias for upstream if `ANYTYPE_UPSTREAM` is unset. On **Central**, `ANYTYPE_BASE` should point at **this bridge's LAN URL**, not Cara loopback. |
| `ANYTYPE_VERSION` | no | `2025-11-08` | `Anytype-Version` header on the Cara → localhost hop. |
| `BRIDGE_LISTEN_HOST` | no | `127.0.0.1` | Default is loopback so the process does not expose a LAN port without a token. |
| `BRIDGE_LISTEN_PORT` | no | `31010` | Bridge listen port (not Anytype `:31009`, not Central `:32109`). |

`BRIDGE_TOKEN` and `ANYTYPE_API_KEY` must not be the same string.

## Security

- Production LAN **must** set `BRIDGE_TOKEN` and a non-loopback `BRIDGE_LISTEN_HOST` (Cara LAN address or `0.0.0.0`).
- Default listen is `127.0.0.1:31010` so a forgotten token does not publish Anytype to the network.
- Inbound `Authorization` is never forwarded. The bridge sets `Authorization: Bearer ${ANYTYPE_API_KEY}` only toward localhost.
- If `BRIDGE_TOKEN` is set, every inbound route (including `/health`) requires that Bearer. The Anytype key as inbound Bearer is `401`.
- Logs print `set` / `missing` / `required` / `off` only. Secrets are redacted from errors and proxied text/json bodies.
- `/health` reports whether `127.0.0.1:31009` is reachable and whether the Cara key is configured. It does not return secret values.

## Run on Cara (next to Anytype desktop)

1. Anytype desktop Local API listening on `127.0.0.1:31009`.
2. From the monorepo root, after `pnpm install`:

```bash
cp integrations/anytype-bridge/.env.example integrations/anytype-bridge/.env
# set ANYTYPE_API_KEY and BRIDGE_TOKEN on Cara only; do not commit .env
# for LAN: BRIDGE_LISTEN_HOST=0.0.0.0 (or the Cara LAN IP) and BRIDGE_TOKEN required
pnpm dev:anytype-bridge
```

CI does not call live Anytype. Unit tests mock `fetch`.

## Central follow-up (not in this PR)

Once [PR #2](https://github.com/SubTerraCo/luna-os/pull/2) (or the Central host process) is wired:

1. Point Central `ANYTYPE_BASE` at the bridge LAN URL, e.g. `http://<cara-lan-ip>:31010`.
2. Central/Rook LAN Bearer must be `BRIDGE_TOKEN` only. Do not send `ANYTYPE_API_KEY` on the wire.
3. PR #2's client currently attaches `ANYTYPE_API_KEY` to whatever `ANYTYPE_BASE` is. That is a **follow-up on the Central side**: when `ANYTYPE_BASE` is this bridge, send `BRIDGE_TOKEN` inbound instead. Do not change PR #2 in this sketch.

Central HTTP default remains `127.0.0.1:32109` (PR #2). That is Central's own surface, not this proxy.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Reachability of `ANYTYPE_UPSTREAM`. No secrets. |
| `*` | everything else | Proxied to Anytype Local API on Cara loopback |

## Left to do (host wiring)

- Run this process on Cara beside Anytype desktop
- Set Cara-local `ANYTYPE_API_KEY` (name in `.env`, value never in git)
- Set `BRIDGE_TOKEN` before binding a LAN interface
- After PR #2: Central `ANYTYPE_BASE` = bridge LAN URL, Central LAN auth = `BRIDGE_TOKEN`
