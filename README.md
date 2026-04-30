# Tic-Tac-Toe (Agents Test)

A two-player tic-tac-toe game over WebSocket — but the point of this repo isn't the game. It's the workflow: every line of code lands on `main` only after a **Builder** agent (Claude Code) implements a single phase from [`SPEC.md`](./SPEC.md) and a **Reviewer** agent (Codex) checks the PR against an explicit gate. Humans file the issue, define the gate, and merge. Agents do the rest.

> Status: in-progress. Phases land one at a time. The deployed app, the playable game, and the Phase 11 README do not exist yet — this README is a placeholder that will itself be rewritten in [Phase 11](./SPEC.md).

## Phase tracker

| Phase | Ships | State |
| --- | --- | --- |
| 0 | Type contract, design tokens, Tailwind removed | done |
| 1 | A11y tooling (html-validate, pa11y-ci, husky), minimal landing page | done |
| 2 | `/dev` page rendering `GameState` fixtures | pending |
| 3 | `Board` and `Cell` (static, fixture-driven) | pending |
| 4 | `StatusBar` and `Lobby` (static) | pending |
| 5 | `useMockGame` hook + interactive UI against a mock opponent | pending |
| 6 | Error states + "Play again" | pending |
| 6.5 | Pre-push hook + GitHub Actions for HTML/a11y validation | pending |
| 7 | Pure game logic and room manager, unit-tested with Vitest | pending |
| 8 | Custom `server.ts` + Socket.IO + real `useGameSocket` | pending |
| 9 | Dockerfile + `fly.toml` | pending |
| 10 | Deploy to Fly.io | pending |
| 11 | Final README (replaces this one) | pending |

## Local development

Requires Node 22+ and pnpm 10 (locked via the `packageManager` field):

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

A `/dev` page rendering `GameState` fixtures lands in Phase 2 and stays as a development tool throughout the rest of the build.

## Target architecture (Phase 8 onward)

```
┌──────────────────── one Node process ────────────────────┐
│                                                          │
│   Next.js (App Router)         Socket.IO server          │
│   handles HTTP requests        handles WS connections    │
│           │                              │               │
│           └─────────── http.Server ──────┘               │
│                            │                             │
│                       single port                        │
└────────────────────────────│─────────────────────────────┘
                             ▼
                       Browser tab(s)
                  (Client Components, useReducer,
                   socket.io-client only inside useEffect)
```

A custom `server.ts` at the repo root creates one `http.Server`, attaches both `app.getRequestHandler()` and a Socket.IO instance to it, and listens on a single port. Game logic lives in [`lib/`](./lib/) as pure TypeScript, unit-tested with Vitest, independent of Next.js or sockets. The server is the source of truth for game state; clients send intents (`join`, `move`, `rematch`) and render whatever state comes back.

The full event contract is frozen in [`SPEC.md`](./SPEC.md#event-contract-frozen-in-phase-0-do-not-modify) and mirrored in [`lib/types.ts`](./lib/types.ts).

## Conventions worth knowing before contributing

- **Package manager**: pnpm 10, no exceptions. `pnpm-lock.yaml` is committed; CI uses `--frozen-lockfile`. No `npm` / `yarn` / `npx` anywhere — use `pnpm exec` and `pnpm dlx`. New native deps with build scripts must be added explicitly to `pnpm.onlyBuiltDependencies` in [`package.json`](./package.json).
- **Styling**: CSS Modules with BEM (`block`, `block__element`, `block__element--modifier`), one `*.module.css` per component, colocated next to its `.tsx`. Design tokens (colors, spacing, focus ring) live in [`app/globals.css`](./app/globals.css) as custom properties; nothing else does. No Tailwind, no `clsx` / `classnames`, no CSS-in-JS, no Sass.
- **Modern CSS only**: `oklch()`, `color-mix()`, native nesting, logical properties (`padding-inline`, `inline-size`), `:focus-visible` (never bare `:focus`, never `outline: none` without an immediate replacement).
- **State**: `useReducer` only. No Context, no zustand, no redux, no react-query.
- **Client boundaries**: components using state, events, or sockets start with `"use client";`. `socket.io-client` and `WebSocket` are instantiated *only inside* `useEffect` — Client Components are prerendered on the server, where browser APIs are undefined.

The exhaustive constraint list is in [`SPEC.md`](./SPEC.md#hard-limits-apply-to-every-phase-every-agent) ("Hard limits"); the per-role rulebooks are [`CLAUDE.md`](./CLAUDE.md) (Builder) and [`AGENTS.md`](./AGENTS.md) (Reviewer).

## How agents work in this repo

1. The human files an issue scoped to a single SPEC phase.
2. The Builder (Claude Code) reads [`SPEC.md`](./SPEC.md), [`CLAUDE.md`](./CLAUDE.md), and the issue, then opens a branch `phase-N-short-description`.
3. The Builder implements the phase, runs every gate command from the SPEC locally, and opens a PR pasting the gate output into the description.
4. The Reviewer (Codex) checks out the PR, runs the same gate commands, and categorizes findings as `BLOCKER`, `SUGGESTION`, or `QUESTION` per [`AGENTS.md`](./AGENTS.md).
5. After approval, the human merges. Neither agent merges its own PR. Neither agent edits the SPEC silently — proposed changes are filed as PR comments.

`SPEC.md` is the only source of truth for *what* to build. The agent rulebooks govern *how*.

## Known limitations (planned, not bugs)

- **No persistence.** Rooms live in process memory; restarting the server drops them.
- **No reconnect.** Closing the tab forfeits the game.
- **No matchmaking.** Players join by sharing a short room code (Jackbox-style).
- **Single region.** Fly.io region `sea` only.
- **Machine sleeps when idle** (`auto_stop_machines = "stop"`). The first request after a quiet period takes a few seconds, and any open rooms are gone.

## Repository layout

```
SPEC.md          contract — what to build
CLAUDE.md        Builder agent rules
AGENTS.md        Reviewer agent rules
app/             Next.js App Router pages
  globals.css    design tokens, reset, base typography (no component styles)
lib/             pure TypeScript: types now; game logic, room manager, socket handlers later
components/      Board, Cell, Lobby, StatusBar, ErrorBanner (each with .module.css) — Phase 3+
hooks/           useMockGame (Phase 5), useGameSocket (Phase 8)
server.ts        custom Next + Socket.IO server (Phase 8)
Dockerfile       multi-stage, Node 22-alpine, pnpm via corepack (Phase 9)
fly.toml         Fly.io config (Phase 9)
```

`components/`, `hooks/`, and `server.ts` exist conceptually in the SPEC; they appear on disk as their phases land.
