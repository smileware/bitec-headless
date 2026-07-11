# AGENTS.md — BITEC Headless

Headless Next.js (App Router) site for BITEC. CMS is WordPress + WPML + GreenShift over GraphQL. JavaScript only.

## Quick orientation

- App code: `src/app/`
- Page HTML from WP is rendered by `components/BlockRenderer.js`, which swaps `id="block-*"` nodes for React components in `components/block/`
- Block data: `hooks/useBlockQueries.js` → `lib/block.js` → GraphQL; pages prefetch via `lib/prefetchBlockQueries.js` + `HydrationBoundary`
- Core GraphQL client + page fetch: `lib/api.js`
- Thai = `/th` URL prefix; CPT detail pages are mirrored under `src/app/th/`
- Styles: Tailwind in `globals.css` + block/chrome SCSS in `css/scss/main.scss`

## Cursor rules

Project AI rules live in `.cursor/rules/`:

- `project-overview.mdc` — always on
- `block-system.mdc` — adding/editing blocks
- `data-fetching.mdc` — GraphQL + React Query
- `i18n-routing.mdc` — EN/TH routing
- `styling.mdc` — SCSS vs Tailwind

Read those before changing architecture, blocks, fetching, i18n, or styles.

## Block data prefetch

Pages dehydrate React Query via `lib/prefetchBlockQueries.js` + `HydrationBoundary`. New blocks must register matching `queryKey`/`queryFn` in that file and in `hooks/useBlockQueries.js`, plus an id in `lib/detectBlocks.js`.

## Do not

- Add TypeScript, next-intl, or a `locales/` folder
- Bypass the block registration pipeline (BlockRenderer + block.js + useBlockQueries + main.scss + prefetch registry)
- Put secrets in docs or rules — env var **names** only
