# Open Bill (`OL`)

Dewey **OL**. Former code **BI**. Display name **Open Bill**. Path `packages/open-bill`.

Invoicing and 1099 notes. This is not the budgeting package — that is **Open Books** (`OB`, `packages/open-books`). InvoiceShelf stays AGPL and is not vendored.

The host mounts the panel on Central and on Metro. Hub domain `bill` is on the Metro↔Central bridge allowlist with Open Books, Open Time, and Anytype (`OB+OL+OT+AT`).

## Run

From the monorepo root, after `pnpm install`:

```bash
pnpm --filter @central/open-bill typecheck
pnpm --filter @central/open-bill build
pnpm exec vitest run packages/open-bill
```

Smoke the panel in a shell (install **Open Bill** from Marketplace):

```bash
pnpm dev        # Central — http://localhost:1420
pnpm dev:web    # Metro — http://localhost:1421
```

Two localhost ports do not share `localStorage`.

## Left to do

- 1099 export files, tax year, and the real IRS threshold (this scaffold only stores a flag)
- Invoice PDF, due dates, tax lines, multi-line editor
- Billbot (`BB`) is an address alias, not a second package
- Actual Budget / `@actual-app/api` stays in Open Books
- Yjs + SQLCipher hub (Phase 2)
