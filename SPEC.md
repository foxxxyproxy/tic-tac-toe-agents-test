# Tic-Tac-Toe Multiplayer — Specification

## Context and goal

Build a two-player tic-tac-toe game over WebSocket. The server is the single source of truth for game state; the client only renders and sends intents. Players join via a short room code (Jackbox-style). The final result is a deployed app reachable via a public URL.

**Development strategy**: UI-first. Build the UI with mocks first and verify visually at every step via a DevPage that shows fixtures of every game state. Once the UI is frozen, implement the server logic (inside the same Next.js custom server) and swap the mock hook for a real socket hook with the same signature.

## Audience

This SPEC is read by:
- **Human** (project owner) — final source of truth for what to build, makes the call when SPEC is ambiguous
- **Builder agent** (Claude Code) — implements one phase at a time, scoped by the assigned issue
- **Reviewer agent** (Codex) — validates each phase against its gate before approval

When SPEC and code disagree, SPEC wins unless the human explicitly overrides.

## What is already in the repo (do not reinstall)

- Next.js 16.2.4 with App Router (`app/` directory)
- React 19.2.4
- TypeScript 5
- ESLint 9 with `eslint-config-next`
- **pnpm 10.33.2** (locked via `packageManager` field in `package.json`, `pnpm-lock.yaml` committed) — **use pnpm, not npm or yarn**
- `pnpm.onlyBuiltDependencies: ["sharp", "unrs-resolver"]` already configured — when adding new native deps that need build scripts, extend this list explicitly
- `AGENTS.md` and `CLAUDE.md` already in the root (replace contents with provided versions in Phase 0)

**Tailwind is shipped by `create-next-app` but is REMOVED in Phase 0** (see Phase 0 below). This project uses **CSS Modules with BEM-style class names**, not Tailwind.

## Architecture

**Custom Next.js server + Socket.IO in a single process.** A `server.ts` file at the repo root:
1. Creates an `http.Server`
2. Attaches the Next.js request handler (`app.getRequestHandler()`)
3. Attaches Socket.IO to the same server

One process serves both HTTP pages and WebSocket connections. Deployment target is Fly.io (single container, single service).

**Game logic lives in `lib/`** — pure TypeScript functions independent of Next.js or Socket.IO. Tested with Vitest.

## Technical constraints (do not deviate without human approval)

- `tsx` to run TypeScript `server.ts` (no bundling step)
- Socket.IO 4.x on the server, `socket.io-client` on the client
- `zod` for validating incoming socket events on the server
- Vitest for unit tests of game logic
- All interactive game components are Client Components (`"use client";` as the first line)
- Client-side state via `useReducer`, not Context, not third-party state managers
- React Compiler is **NOT** enabled (kept in TODO)
- Deploy: Fly.io (one container, one service)

## Styling approach

This project uses **CSS Modules with BEM-style class names**. No Tailwind, no CSS-in-JS, no Sass.

### Rules

- One `*.module.css` file per component, colocated next to the `.tsx` file
- Class names inside modules follow BEM: `block`, `block__element`, `block__element--modifier`
- Example for `Board.module.css`:
  ```css
  .board { ... }
  .board__cell { ... }
  .board__cell--winning { ... }
  .board__cell--disabled { ... }
  ```
- Imported as `import styles from "./Board.module.css"` and used as `className={styles.board}` / `className={styles["board__cell--winning"]}`
- For multiple classes, use a tiny inline helper or template literal — **do not** install `clsx` or `classnames`:
  ```ts
  className={[styles.board__cell, isWinning && styles["board__cell--winning"]].filter(Boolean).join(" ")}
  ```
- Global styles live in `app/globals.css` only — design tokens (CSS custom properties), CSS reset, base typography. No component-specific styles in `globals.css`.

### Modern CSS features to use
- **Native CSS nesting** — well-supported in all modern browsers in 2026
- **Custom properties** for all design tokens (colors, spacing, focus ring, breakpoints)
- **`oklch()`** for colors (better perceptual uniformity than hex/hsl)
- **`color-mix()`** when manipulating tokens
- **Logical properties** (`padding-inline`, `margin-block`) — better for i18n and a11y
- **`:focus-visible`** for the accessible focus ring (never bare `:focus`)
- **Container queries** only if a component genuinely needs them (probably not in this project)
- **No** Sass, Less, PostCSS plugins beyond what Next.js bundles itself

### Design tokens (in `app/globals.css`)

```css
:root {
  /* Colors */
  --color-bg: oklch(98% 0 0);
  --color-fg: oklch(20% 0 0);
  --color-accent: oklch(55% 0.18 250);
  --color-x: oklch(50% 0.2 25);
  --color-o: oklch(50% 0.18 200);
  --color-winning-bg: oklch(90% 0.12 100);
  --color-error: oklch(50% 0.22 25);
  --color-muted: oklch(60% 0 0);
  --color-border: oklch(85% 0 0);

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Typography */
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-cell: 3rem;

  /* Focus */
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--color-accent);

  /* Layout */
  --cell-size-min: 56px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: oklch(15% 0 0);
    --color-fg: oklch(95% 0 0);
    --color-border: oklch(30% 0 0);
    /* rebalance other tokens */
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus ring rule (a11y critical)

Every interactive element must have a visible focus ring:
```css
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```
Never use `outline: none` without an immediate replacement.

## Target repository structure

```
tic-tac-toe-agents-test/
├── AGENTS.md
├── CLAUDE.md
├── SPEC.md
├── README.md
├── server.ts             # Phase 8
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs    # REMOVED in Phase 0
├── .htmlvalidate.json    # Phase 1
├── .pa11yci.json         # Phase 1
├── .husky/
│   └── pre-push          # Phase 6.5
├── .github/
│   └── workflows/
│       └── validate.yml  # Phase 6.5
├── Dockerfile            # Phase 9
├── fly.toml              # Phase 9
├── lib/
│   ├── types.ts          # Phase 0
│   ├── game.ts           # Phase 7
│   ├── game.test.ts
│   ├── rooms.ts          # Phase 7
│   ├── rooms.test.ts
│   └── socket-handlers.ts # Phase 8
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dev/
│   │   └── page.tsx
│   └── globals.css       # tokens, reset, base typography only
├── components/
│   ├── Board.tsx + Board.module.css
│   ├── Cell.tsx + Cell.module.css
│   ├── Lobby.tsx + Lobby.module.css
│   ├── StatusBar.tsx + StatusBar.module.css
│   └── ErrorBanner.tsx + ErrorBanner.module.css
├── hooks/
│   ├── useMockGame.ts    # Phase 5
│   └── useGameSocket.ts  # Phase 8
└── public/
```

## Event contract (frozen in Phase 0, do not modify)

**Client → Server**
- `join`: `{ roomId: string }`
- `move`: `{ roomId: string, index: number }`
- `rematch`: `{ roomId: string }`

**Server → Client**
- `assigned`: `{ mark: "X" | "O", playerId: string }`
- `state`: `GameState`
- `opponent_left`: void
- `error_msg`: `{ code: ErrorCode, message: string }`

**Types**
```ts
type Mark = "X" | "O";
type Cell = null | Mark;

type GameState = {
  board: Cell[];                    // length 9
  turn: Mark;
  status: "waiting" | "playing" | "won_X" | "won_O" | "draw";
  winningLine: number[] | null;
};

type ErrorCode =
  | "ROOM_FULL"
  | "INVALID_MOVE"
  | "NOT_YOUR_TURN"
  | "ROOM_NOT_FOUND";
```

## How phases work

- **One phase = one issue = one branch = one PR**.
- Branch name: `phase-N-short-description`
- PR title: `Phase N: <short description>`
- Builder implements the phase, opens the PR, transitions the issue to `review`
- Reviewer checks out the PR locally, runs the gate commands, categorizes findings, and either approves or sends back
- After Reviewer approval, the human merges and signals "ok, Phase N+1"
- The Builder does NOT start the next phase before the human signals

The exact gate for each phase is listed below. Both agents treat the gate as binary: it passes or it does not.

---

## Phase 0: Types, working agreement, remove Tailwind

- **Remove Tailwind**:
  - `pnpm remove tailwindcss @tailwindcss/postcss`
  - Delete `postcss.config.mjs` (it only configures Tailwind in the `create-next-app` template — verify before deleting)
  - Replace `app/globals.css` with the design tokens, CSS reset, and base typography from the **Styling approach** section above
- Create `lib/types.ts` with all types from the contract above
- Replace `CLAUDE.md` content with the Builder working agreement (provided separately)
- Replace `AGENTS.md` content with the Reviewer working agreement (provided separately)
- Add this `SPEC.md` to the repo root

**Gate**:
- `pnpm exec tsc --noEmit` passes
- `pnpm lint` is green
- The three files (`SPEC.md`, `CLAUDE.md`, `AGENTS.md`) are present and committed
- `package.json` does NOT list `tailwindcss` or `@tailwindcss/postcss`
- `app/globals.css` contains the design tokens listed in the Styling approach section
- `pnpm dev` starts and `http://localhost:3000` opens

---

## Phase 1: A11y tooling and minimal page

- Install: `pnpm add -D html-validate pa11y-ci husky vitest`
- Run `pnpm exec husky init` (creates `.husky/` and adds a `prepare` script)
- Create `.htmlvalidate.json`:
```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-inline-style": "off",
    "no-trailing-whitespace": "off",
    "void-style": "off",
    "attr-case": ["error", { "ignoreForeign": true }]
  }
}
```
- Create `.pa11yci.json`:
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 15000,
    "wait": 500
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/dev"
  ]
}
```
- Add to `package.json` scripts:
```json
"test": "vitest",
"validate:html": "html-validate '.next/server/app/**/*.html' || true",
"validate:a11y": "pa11y-ci"
```
- Replace `app/page.tsx` with a minimal "Tic-tac-toe" heading
- Create `app/page.module.css` for page-level styling (layout, heading)
- Strip default `create-next-app` markup from `app/page.tsx`

**Note about html-validate**: Next App Router emits prerendered HTML under `.next/server/app/`. The exact glob may differ between Next minor versions. The `|| true` guard is intentional here; the real glob is determined and the guard removed in Phase 6.5.

**Gate**: `pnpm dev` opens on `:3000`, the styled heading renders using design tokens. `pnpm exec tsc --noEmit` passes.

---

## Phase 2: DevPage with fixture stubs

Create `app/dev/page.tsx` as a Server Component (no `"use client"` needed; fixtures are static).

Six fixtures, each typed as `GameState`:
1. Empty board (`status: "waiting"`)
2. Mid-game (`status: "playing"`)
3. X wins on a row (`winningLine: [0,1,2]`)
4. O wins on a diagonal (`winningLine: [0,4,8]`)
5. X wins on a column
6. Draw (`status: "draw"`, `winningLine: null`)

Render each fixture with an `<h2>` label and a `<pre>{JSON.stringify(state, null, 2)}</pre>` placeholder.

Add `app/dev/page.module.css` with layout for the fixture grid (e.g., `.dev`, `.dev__fixture`, `.dev__fixture-label`).

**Gate**: `pnpm dev`, open `http://localhost:3000/dev` — six labeled sections with JSON dumps render. All types check out.

---

## Phase 3: Board and Cell — static

Create `components/Board.tsx`, `components/Board.module.css`, `components/Cell.tsx`, `components/Cell.module.css`. Static for now — no `"use client"`.

### Board.module.css example

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
  max-inline-size: 320px;
  background: var(--color-border);
  padding: var(--space-1);
}

.board__caption {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
```

### Cell.module.css example

```css
.cell {
  aspect-ratio: 1;
  min-inline-size: var(--cell-size-min);
  min-block-size: var(--cell-size-min);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-cell);
  font-weight: 700;
  background: var(--color-bg);
  border: none;
  cursor: pointer;
  color: var(--color-fg);

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: calc(-1 * var(--focus-ring-offset));
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.cell--x { color: var(--color-x); }
.cell--o { color: var(--color-o); }
.cell--winning { background: var(--color-winning-bg); }
.cell--empty { color: transparent; }
```

In `app/dev/page.tsx`, replace `<pre>` placeholders with `<Board state={fixture} />`.

**Accessibility**:
- Each cell is a `<button type="button">` with `aria-label`: "Cell 1, empty" / "Cell 1, X" / "Cell 5, O, winning line"
- Color contrast ≥ 4.5:1
- Focus indicator via `:focus-visible` — never `outline: none` without replacement
- Tap target ≥ `var(--cell-size-min)`

**Gate**: `/dev` shows 6 boards visually. axe DevTools reports zero critical issues. Tabbing through the board shows visible focus on every cell.

First manual pa11y-ci run:
```bash
pnpm build
pnpm start &
sleep 3
pnpm validate:a11y
kill %1
```

---

## Phase 4: StatusBar and Lobby — static

`components/StatusBar.tsx` + `StatusBar.module.css`: takes `{ state: GameState, mark: Mark | null }` and outputs:
- `waiting` → "Waiting for opponent"
- `playing` + my turn → "Your turn"
- `playing` + not my turn → "Opponent's turn"
- `won_X` → "X wins" (or "You win" if `mark === "X"`)
- `draw` → "Draw"

Attributes: `role="status"`, `aria-live="polite"`.

BEM example:
```css
.status-bar { ... }
.status-bar__text { ... }
.status-bar__text--my-turn { color: var(--color-accent); }
.status-bar__text--win { color: var(--color-x); }
.status-bar__text--draw { color: var(--color-muted); }
```

`components/Lobby.tsx` + `Lobby.module.css` (static, no handlers yet):
- "Create room" button
- "Join by code" input + button
- "Your room code: A3X7" display + "Copy link" button

BEM example:
```css
.lobby { ... }
.lobby__title { ... }
.lobby__form { ... }
.lobby__input { ... }
.lobby__button { ... }
.lobby__button--primary { ... }
.lobby__room-code { ... }
```

Add these to `/dev` with several prop variations.

**Gate**: `/dev` shows StatusBar and Lobby in multiple states. Visual review passes. axe zero critical.

---

## Phase 5: useMockGame and interactive main screen

Create `hooks/useMockGame.ts` with the **same signature** as future `useGameSocket` (Phase 8):

```ts
"use client";

export function useMockGame(roomId: string): {
  state: GameState | null;
  mark: Mark | null;
  playerId: string | null;
  error: { code: ErrorCode; message: string } | null;
  connected: boolean;
  sendMove: (index: number) => void;
  sendRematch: () => void;
}
```

Internals: `useReducer`. Plays locally. Second player emulated by either:
- A "Make O move" button in DevPage
- A timer that picks a random valid cell for O 800ms after X moves

Update `app/page.tsx` to a Client Component:
```tsx
"use client";
// imports, useState for switching between Lobby and Game
```

`Board` and `Cell` become interactive — add `"use client"` and `onClick` that calls `sendMove(index)`. Add `--disabled` modifier when not the player's turn or cell is occupied.

**Gate**: At `http://localhost:3000` you can play a full game against the mock bot in a single tab. All states visually confirmed. Disabled cells visibly differ from active cells.

---

## Phase 6: UI edge cases

- "Play again" button at end of game (calls `sendRematch`)
- `components/ErrorBanner.tsx` + `ErrorBanner.module.css` — `role="alert"`
  - BEM: `.error-banner`, `.error-banner__icon`, `.error-banner__message`, `.error-banner--severe`
- "Opponent left" screen (triggered from DevPage)
- "Room is full" screen
- Invalid room code in Lobby

Add error-states section to `app/dev/page.tsx` (or `app/dev/error-states/page.tsx`).

**Gate**: every error screen reproducible from `/dev`. Manual full UX run. axe zero critical.

Extend `.pa11yci.json` with URLs for any new error-state routes.

---

## Phase 6.5: Accessibility CI — pre-push hook + GitHub Actions

First, **resolve the html-validate glob**:
```bash
pnpm build
find .next -name "*.html" | head
```
Update the `validate:html` script in `package.json` accordingly and remove the `|| true` guard.

**Pre-push hook** (`.husky/pre-push`):
```bash
pnpm build && pnpm validate:html
```

**GitHub Actions** (`.github/workflows/validate.yml`):
```yaml
name: HTML & Accessibility Validation

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: HTML validation
        run: pnpm validate:html

      - name: Run a11y checks
        run: |
          # Patch pa11y config to use system Chrome with --no-sandbox
          cat > .pa11yci.json <<'EOF'
          {
            "defaults": {
              "standard": "WCAG2AA",
              "timeout": 15000,
              "wait": 500,
              "chromeLaunchConfig": {
                "executablePath": "/usr/bin/google-chrome-stable",
                "args": ["--no-sandbox"]
              }
            },
            "urls": [
              "http://localhost:3000/",
              "http://localhost:3000/dev"
            ]
          }
          EOF

          pnpm start &
          SERVER_PID=$!

          for i in $(seq 1 15); do
            curl -s http://localhost:3000/ > /dev/null && break
            sleep 1
          done

          pnpm validate:a11y
          EXIT_CODE=$?

          kill $SERVER_PID
          exit $EXIT_CODE
```

**Gate**:
1. `git push` triggers the local pre-push hook, builds and validates HTML
2. On a GitHub PR, the workflow runs green
3. The full workflow has been run locally end-to-end at least once

---

## Phase 7: Game logic and room manager (still no sockets)

UI is "frozen". No new dependencies (Vitest installed in Phase 1).

**7a. Game logic** (`lib/game.ts`):
- `createEmptyState(): GameState`
- `applyMove(state, index, mark): GameState | { error: string }`
- `checkWinner(board): { winner: Mark | "draw" | null, line: number[] | null }`

In `lib/game.test.ts`, minimum 8 cases:
- initial state correct
- move into empty/occupied cell
- move with wrong mark
- wins by row, column, diagonal
- draw
- moves blocked after a win

**Gate 7a**: `pnpm test` — all green.

**7b. Room manager** (`lib/rooms.ts`):
- In-memory `Map<roomId, Room>`
- Methods: `joinRoom`, `handleMove`, `handleRematch`, `removePlayer`
- Tests: `ROOM_FULL`, `ROOM_NOT_FOUND`, `NOT_YOUR_TURN`

**Gate 7b**: `pnpm test` green.

---

## Phase 8: Custom server, Socket.IO, client wiring

**8a. Install** Socket.IO and tsx:
```bash
pnpm add socket.io socket.io-client zod
pnpm add -D tsx
```

**8b. Custom server** (`server.ts` at repo root):
```ts
import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { registerSocketHandlers } from "./lib/socket-handlers";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const hostname = "0.0.0.0";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**8c. Socket handlers** (`lib/socket-handlers.ts`): uses `lib/rooms.ts`, validates incoming events with zod, emits events per the contract.

**8d. Update `package.json` scripts**:
```json
"dev": "tsx server.ts",
"build": "next build",
"start": "NODE_ENV=production tsx server.ts"
```

**8e. Client** — create `hooks/useGameSocket.ts` with the **same signature** as `useMockGame`:
```ts
"use client";
import { useEffect, useReducer, useRef } from "react";
import { io, Socket } from "socket.io-client";
// ...
```
**Critical**: `io()` is called ONLY inside `useEffect`, because Next prerenders Client Components on the server where `WebSocket` is undefined.

In `app/page.tsx` (or wherever `useMockGame` is used), swap the import. No other component changes needed. CSS Modules continue to work without any change.

**Gate**: `pnpm dev` starts a single process, you can play a full game in two browser tabs (regular + incognito). DevPage still works with `useMockGame` — kept as a dev tool.

---

## Phase 9: Production configuration

**Dockerfile** (multi-stage, Node 22-alpine, pnpm via corepack):
```dockerfile
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app ./
USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
```

Notes on the Dockerfile:
- `corepack enable` activates pnpm at the version specified in `package.json`'s `packageManager` field (10.33.2)
- `--frozen-lockfile` ensures CI/Docker builds match the committed `pnpm-lock.yaml` exactly
- The `runner` stage copies the entire app (including `node_modules`) — this is acceptable for our scope; we are not optimizing image size aggressively

**fly.toml**:
```toml
app = "tic-tac-toe-agents-test"
primary_region = "sea"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

**Note**: `auto_stop_machines = "stop"` means the machine sleeps when idle. All in-memory rooms are lost — list this in the README as a known limitation.

**Gate**: `docker build -t test . && docker run -p 3000:3000 test` works locally, `:3000` opens, you can play.

---

## Phase 10: Deploy (agent describes commands; human executes)

Order matters — server first.

1. Install flyctl if not installed (provide macOS install command)
2. `flyctl launch --no-deploy` — walk the wizard, region `sea`
3. Review and adjust `fly.toml` if needed
4. `flyctl deploy`
5. `curl https://<app>.fly.dev/` → 200, HTML loads
6. Open in two tabs, play a full game
7. In DevTools → Network → WS — confirm a `wss://` connection

⚠️ The Builder agent does NOT run `flyctl` commands itself. It only prepares configs and describes commands.

---

## Phase 11: README

- What this is, local run instructions (`pnpm install && pnpm dev`)
- Production URL
- Architecture (a single ASCII diagram is enough): "one Next process, custom server.ts, Socket.IO on the same port"
- **Styling note**: CSS Modules + BEM, design tokens in `globals.css`, no Tailwind
- **Package manager note**: pnpm 10 required (locked via `packageManager` field)
- Known limitations: no persistence (restart = lost rooms), no reconnect, no matchmaking, single-region
- Screenshot of the game
- Mention DevPage as a dev tool at `/dev`
- Mention agent-built workflow (Builder = Claude Code, Reviewer = Codex)

## Hard limits (apply to every phase, every agent)

- **Do NOT** use npm or yarn — pnpm only (`packageManager` field locks the version)
- **Do NOT** add Tailwind back, do NOT install `clsx`, `classnames`, `styled-components`, `emotion`, or any CSS-in-JS — CSS Modules + BEM is the styling system
- **Do NOT** add Sass, Less, or PostCSS plugins — modern CSS only
- **Do NOT** put component-specific styles in `app/globals.css` — only tokens, reset, base typography
- **Do NOT** use `outline: none` without an immediate replacement focus indicator
- **Do NOT** use `localStorage` or `sessionStorage` in the first version
- **Do NOT** add optimistic updates
- **Do NOT** add auth, a database, analytics, or sentry — out of scope
- **Do NOT** introduce alternative state libraries (zustand, redux, react-query, tRPC) — `useReducer` is sufficient
- **Do NOT** enable React Compiler / `babel-plugin-react-compiler` — kept in TODO
- **Do NOT** create speculative abstractions (factories, interfaces with one implementation)
- **Do NOT** run `flyctl`, `wrangler`, or any deploy commands — human only
- **Do NOT** create `server.ts`, `lib/game.ts`, `lib/rooms.ts`, `lib/socket-handlers.ts` before Phase 7+
- **Do NOT** install `socket.io` or `socket.io-client` before Phase 8
- **Do NOT** swap `useMockGame` for socket code before Phase 8
- **Do NOT** forget `"use client"` on components with state, events, or sockets
- **Do NOT** call `io()` or `WebSocket` constructors outside `useEffect`
- If a new dependency requires build scripts, **do** explicitly add it to `pnpm.onlyBuiltDependencies` in `package.json` — do not silently bypass pnpm's safety
- If tempted by "one more feature" — add it to README TODO, do not implement
