# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Versions ahead of common training data

- **Next.js 16.2.4** (App Router) — APIs and conventions have breaking changes vs. older versions. The full docs ship with the install at `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`, plus `index.md`). Read the relevant guide there before writing or modifying Next.js code, rather than relying on memory.
- **React 19.2.4** — assume server components by default in `app/`; only opt into `"use client"` when needed.
- **ESLint v9 flat config** — [eslint.config.mjs](eslint.config.mjs) uses `defineConfig` and composes `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.

Styling is plain CSS via [app/globals.css](app/globals.css) — no Tailwind, no PostCSS config.

## Commands

This project uses **pnpm** (pinned via `packageManager` in [package.json](package.json)). Do not use `npm` or `yarn`; doing so will create a conflicting lockfile.

- `pnpm install` — install dependencies
- `pnpm dev` — start the dev server (http://localhost:3000)
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint (flat config; no extra args needed)

There is no test runner configured in this project.

## Architecture

- **App Router** under [app/](app/): [layout.tsx](app/layout.tsx) is the root layout (loads Geist fonts via `next/font/google` and applies them as CSS variables consumed by `@theme` in `globals.css`); [page.tsx](app/page.tsx) is the root route.
- **Path alias**: `@/*` resolves to the repo root (see [tsconfig.json](tsconfig.json)), so `@/app/...` works from anywhere.
- **TypeScript**: `strict` is on, `moduleResolution: "bundler"`, `jsx: "react-jsx"`. Don't commit changes to `next-env.d.ts` (auto-generated).
- **Static assets**: [public/](public/) is served at the site root (e.g. `/next.svg`).
