# Optimus monorepo

This repository is organized as a pnpm workspace monorepo.

## Applications

- `apps/web` — the existing Optimus landing page deployed on Vercel.
- `apps/coder` — placeholder for a future second application. No Coder backend, services, engine, or server dependencies are included.

## Packages

- `packages/ui` — shared UI package placeholder.
- `packages/config` — shared configuration package placeholder.
- `packages/types` — shared type package placeholder.
- `packages/utils` — shared utility package placeholder.

## Scripts

Run commands from the repository root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm start
```

The root scripts delegate to `@optimus/web`, so the deployed project remains the existing web application.
