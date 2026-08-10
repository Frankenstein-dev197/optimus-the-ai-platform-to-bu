# optimus-platform-ui

Frontend (React/TypeScript) of the **Optimus Platform**, extracted from
[Coder](https://github.com/coder/coder).

## Scope

This repository contains the user-facing experience of the platform:

- React/TypeScript application (`src/`)
- End-to-end tests (`e2e/`)
- Static assets (`static/`)
- Design system, components, pages, dashboard, navigation
- Build configuration (Vite, Tailwind, TypeScript, pnpm)

## Communication with the engine

The UI communicates with [`optimus-platform-engine`](https://github.com/Frankenstein-dev197/optimus-platform-engine)
**only** via the REST API (`/api/v2`) and WebSocket endpoints. No Go code is
imported.

> **Note on the split:** The Go files that serve the SPA (`site.go`,
> `site_embed.go`, `site_slim.go`, `bin.go`, `site_test.go`) remain in the
> **engine** repository because they are a Go HTTP server tightly coupled to
> the backend (RBAC, `httpmw`, `database.Store`, HTML state prefill, and
> `//go:embed` of the built `out/` artifacts). See `REPOSITORY_SPLIT_PLAN.md`
> (option R1) for the planned hardening step that relocates these files into
> `coderd/siteserver/`.

## Build

```bash
pnpm install
pnpm build   # outputs to out/
```

## Origin

Extracted verbatim from the `site/` directory of Coder at commit
`1e578a69a4e568702ad0f9561b4804060d41c145`. No design or feature changes
were made — this is a structural extraction only.
