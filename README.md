# Optimus monorepo

This repository is organized as a pnpm workspace monorepo.

## Applications

- `apps/web` — the Optimus landing page (Next.js) deployed on Vercel.
- `apps/platform` — the Optimus Platform UI (React/TypeScript, Vite), the fully
  rebranded product frontend. It communicates with `optimus-platform-engine`
  only via REST/WebSocket; no backend code is included in this repo. See
  `apps/platform/OPTIMUS_UI_REBRANDING.md` for the rebranding details.

## Packages

- `packages/ui` — shared UI package placeholder.
- `packages/config` — shared configuration package placeholder.
- `packages/types` — shared type package placeholder.
- `packages/utils` — shared utility package placeholder.

## Scripts

Run commands from the repository root:

```bash
pnpm dev            # landing page (apps/web)
pnpm dev:platform   # platform UI (apps/platform)
pnpm build          # landing page
pnpm build:platform # platform UI
pnpm lint           # landing page
pnpm lint:platform  # platform UI (tsc)
```

The root scripts delegate to the filtered workspace packages:
`@optimus/web` (landing) and `@optimus/platform-ui` (platform). The deployed
Vercel project remains the landing page (`apps/web`).
