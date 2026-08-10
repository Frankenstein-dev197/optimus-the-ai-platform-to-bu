# Optimus UI Rebranding

Rebranding of the Coder-derived frontend into the **Optimus Platform** UI.
This document describes what changed, what stayed compatible with the engine,
and the API dependencies that constrain the rebrand.

## Summary

The UI no longer presents itself as "Coder". Logos, favicons, metadata, visible
copy, the Monaco syntax theme, page modules, and routes were renamed to
"Optimus". The REST/WebSocket API contract with `optimus-platform-engine` is
preserved verbatim: generated types, HTTP headers, `coderd`-referencing
comments, and Terraform resource names are untouched so the UI keeps talking
to the engine without changes.

## Visual identity

| Area | Before | After |
| --- | --- | --- |
| Browser title / `<meta application-name>` fallback | Coder | Optimus |
| `<meta name="theme-color">` | `#17172E` | `#1E40AF` (Optimus blue) |
| `static/manifest.json` name/description/theme_color | Coder Agents / powered by Coder | Optimus Agents / powered by Optimus |
| `package.json` name/description/repository | `@coder/coder` / Coder / coder/coder | `@optimus/platform-ui` / Optimus Platform UI / optimus-platform-ui |
| Logo glyph (ProductLogo, CoderCup) | Coder wordmark "C[]" | Optimus hexagonal "O" ring with center dot |
| Favicons (light/dark + status variants) | Coder glyph | Optimus glyph (PNGs regenerated from the new SVGs) |
| `static/icon/coder.svg` | Coder glyph | `static/icon/optimus.svg` added (Optimus glyph); `coder.svg` kept as a backend-data fallback |
| `static/open-in-coder.svg` button | "Open in Coder" | `static/open-in-optimus.svg` ("Open in Optimus"); legacy button retained |
| `static/error.html`, `static/oauth2allow.html` | Coder SVG + `.coder-svg` class | Optimus SVG + `.optimus-svg` class |
| `apple-touch-icon`, PWA `pwa-icon-192/512` PNGs | Coder mark | Optimus mark on `#1E40AF` background |
| `favicon.ico` (service-worker push fallback) | Coder mark | Optimus mark (16px) |

The Optimus logo is a six-sided ring ("O") with a small hexagonal center dot,
single-color (`currentColor` / white / navy `#1E40AF`), generated from a single
SVG path so it scales to every size and theme.

Color note: the `theme-color`/manifest accent is `#1E40AF` (Optimus blue).
The application surface background stays `#17172E` to preserve the existing
dark theme. The Tailwind semantic color tokens (`content`, `surface`,
`border`, `highlight`) were intentionally not renamed or recolored; they are a
cross-cutting design system shared by every component and are out of scope for
this pre-merge rebrand.

## Code renames

| Symbol / file | Before | After |
| --- | --- | --- |
| Monaco syntax theme hook | `useCoderTheme` in `coderTheme.ts` | `useOptimusTheme` in `optimusTheme.ts` |
| Monaco theme name string | `"coder"` | `"optimus"` |
| AI settings page module | `pages/AISettingsPage/CoderAgentsPage/*` | `pages/AISettingsPage/OptimusAgentsPage/*` (`OptimusAgentsPage`, `OptimusAgentsPageView`, ...) |
| Easter-egg page module | `pages/CoderCupPage/*` | `pages/OptimusCupPage/*` (`OptimusCupPage`) |
| Route paths | `/ai/settings/coder-agents`, `/coder-cup` | `/ai/settings/optimus-agents`, `/optimus-cup` |
| Route redirects (legacy bookmarks) | - | `/ai/settings/coder-agents` -> `/ai/settings/optimus-agents`; `/coder-cup` -> `/optimus-cup` |
| Debug export filename | `coder-agents-debug-*.json` | `optimus-agents-debug-*.json` |
| Terminal symbol font | `coder-terminal-symbols.css` / `"Coder Terminal Symbols"` | `optimus-terminal-symbols.css` / `"Optimus Terminal Symbols"` (woff2 asset renamed too) |
| `getApplicationName()` default | `"Coder"` | `"Optimus"` |
| Visible copy ("Welcome to Coder", "Coder Technologies, Inc.", "Coder Discord", "Install the Coder CLI", "Browse the Coder Registry", "Coder will ...", "Coder deployment", "Coder group/role", "within Coder Workspaces", "Coder's ...", etc.) | Coder | Optimus |
| Contact + fixture email host | `sales@coder.com`, `*@coder.com` | `sales@optimus.com`, `*@optimus.com` |
| "Coder Agents" product label (sidebar, headings, instructions) | Coder Agents | Optimus Agents |

Internal identifiers such as `coderGroups`, `coderRoles`, `coderOrgs`,
`forwardCoderHeaders`, `MockCoderMCPServer`, and the `CoderResources`/`Coder_Provisioned`
AWS-policy fixture strings are left as-is; they are non-visible code symbols or
mock data and renaming them adds risk without brand benefit.

## What stays compatible with the engine

The UI talks to `optimus-platform-engine` only through the REST API
(`/api/v2`) and WebSocket endpoints. The following were deliberately **not**
renamed because they are wire contracts or generated artifacts sourced from
the Go backend:

- **`src/api/typesGenerated.ts`** - generated types and constants. All
  `X-Coder-*` / `Coder-*` HTTP header constants are preserved:
  `Coder-Session-Token`, `X-Coder-Build-Version`, `X-Coder-Bypass-Ratelimit`,
  `Coder-CLI-Telemetry`, `Coder-Desktop-Telemetry`,
  `Coder-Provisioner-Daemon-Key/PSK`, `X-Coder-Entitlements-Warning`,
  `X-Coder-AI-Governance-Gateway-Key`, `X-Coder-Owner-Id`, `X-Coder-Chat-Id`,
  `X-Coder-Subchat-Id`, `X-Coder-Workspace-Id`, etc. Comments that reference
  "Coder instance", "coderd", `coderd/rbac/...`, and the provisioner are kept
  verbatim so the file stays diff-clean against the generator.
- **`src/api/api.ts`** - the `Coder-Session-Token` request header key and the
  file's docblock referencing the Coder API / VS Code extension / Backstage
  plugin are unchanged; they describe the public SDK contract consumed by
  external clients.
- **`src/api/rbacresourcesGenerated.ts`** - `coderd/rbac/policy.go` source
  comment preserved.
- **Terraform resource names** in stories/tests (`coder_agent`,
  `coder_workspace`, `coder_app`) - these are the provisioner's Terraform
  schema names, a contract with the engine.
- **`case "Coder Agents"` in `AIBridgeClientIcon.tsx`** - this string matches
  the AI Bridge client name emitted by `bridge.go` in the engine; only the
  icon `src` was swapped to `/icon/optimus.svg`, the case literal stays.
- **`forward_coder_headers` / `forwardCoderHeaders`** - this is a real API
  field and a UI form value; the form label was rebranded ("Forward Optimus
  identity headers") but the field/identifier is unchanged.
- **`coder:` app URL scheme and `coder_app`/`coder_agent` hostname checks**
  in `modules/apps` and `modules/resources` - these match the app/agent URL
  scheme produced by the engine; left as-is.
- **`@coder/pixel-storybook`** devDependency and the `playwright:test`
  `site/e2e/bin/coder` make target - external package / engine build binary.
- **`static/icon/coder.svg`** - kept on disk because backend fixtures and
  mock data still reference `/icon/coder.svg` as an arbitrary provider icon
  URL; `optimus.svg` was added alongside it for brand use.

## API dependencies (constraints for further work)

If the engine is later rebranded too, these are the seams to update together:

1. **HTTP headers** (`Coder-Session-Token`, the `X-Coder-*` family) - rename on
   both sides atomically. The UI currently sends/receives these exact strings.
2. **Generated types** (`typesGenerated.ts`, `rbacresourcesGenerated.ts`) -
   regenerate from the renamed engine instead of hand-editing.
3. **AI Bridge client name** - `case "Coder Agents"` matches
   `bridge.go`'s client list; rename the literal and the engine constant
   together, or add the new name as an accepted alias.
4. **`forward_coder_headers`** field - rename the API field and the form
   identifier together.
5. **Terraform schema** (`coder_agent`, `coder_workspace`, `coder_app`) - only
   if the provisioner schema is renamed; out of scope for the UI.
6. **App URL scheme** `coder:` - involves the desktop/app deep-link handling
   in the engine.

## Verification

- `pnpm lint:types` (`tsc -p .`) - passes.
- `pnpm format` - applied; only pre-existing Tailwind-CSS/HTML lint
  diagnostics remain (unchanged from the pre-rebrand baseline).
- Targeted unit tests pass: `externalImages.test.ts`, `constants.test.ts`,
  `debugExport.test.ts`, `modelOptions.test.ts`,
  `TemplateEmbedPage.test.tsx`.

## Follow-ups (not blocking)

- Validate that `sales@optimus.com` (replacing `sales@coder.com`) is a
  monitored mailbox before relying on the license/contact-sales links.
- Regenerate `favicon.ico` / `apple-touch-icon.png` / PWA PNGs at higher
  fidelity with a dedicated rasterizer if pixel-perfect masks are needed.
  Current PNGs were generated with `cairosvg`/PIL from the new SVGs.
- Update external doc links (`docs("/admin/templates/open-in-coder")`) once
  the docs site is rebranded; the link paths are left intact for now.
- Rebrand the Tailwind semantic color token layer and the MUI theme palette
  as a separate, design-coordinated change.
- Rename internal symbols (`coderGroups`, `forwardCoderHeaders`, etc.) in a
  follow-up cleanup pass if desired.
