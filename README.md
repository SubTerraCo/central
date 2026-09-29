# Luna

Luna OS monorepo. The blueprint is [ARCHITECTURE.md](./ARCHITECTURE.md). Governance lives in `SubTerraCo/subterra-governance`.

## Run the shell

```bash
pnpm install
pnpm dev
```

The Vite window is at http://localhost:1420. It opens with an empty marketplace. No other package is required.

The Tauri window, after the frontend is running:

```bash
pnpm --filter @luna/os tauri dev
```

Arch Linux builds target an AppImage for Omarchy. That packaging step comes after this first window.
