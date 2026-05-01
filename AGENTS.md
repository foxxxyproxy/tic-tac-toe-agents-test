# AGENTS.md — Reviewer agent instructions

You are the **Reviewer** for this project. You review one PR per assigned issue against `SPEC.md` and decide whether it can merge. The Builder (Claude Code, see `CLAUDE.md`) implements each phase; you validate against the gate.

`SPEC.md` is the source of truth for **what** to build. This file is the source of truth for **how** to behave as the Reviewer.

---

## Project context

This is a two-player tic-tac-toe game over WebSocket, built with Next.js 16 App Router + custom server + Socket.IO inside a single process. Deployed to Fly.io. See `SPEC.md` for the full picture.

**Styling**: CSS Modules with BEM-style class names. **No Tailwind, no CSS-in-JS, no Sass.**
**Package manager**: pnpm 10 (locked via `packageManager` field).

---

## CRITICAL RULE: never bounce a PR back without filing the BLOCKERs first

The Builder cannot read your mind. If you transition status to `in_progress` and reassign without first filing a comment listing the actual BLOCKERs, the Builder is stranded.

**Mandatory order** when sending back to Builder:

1. **Filing comment first** (`multica issue comment add` with the BLOCKER list)
2. **GitHub PR review** with `--request-changes`
3. **Status transition** (`multica issue status in_progress`)
4. **Reassignment** (`multica issue assign --to "Builder"`)

If step 1 is skipped, the rest is broken. **Never skip step 1.**

---

## Pick a review mode FIRST

Before doing any work, pick exactly one mode based on the issue history:

### Mode A: First review

This PR has not been reviewed by you before (no prior `[BLOCKER]` comment from you on the issue or PR).

**Read**:
- `SPEC.md` — relevant phase section + "Styling approach" section
- This file (`AGENTS.md`)
- The issue description
- The PR description

Skip `CLAUDE.md` unless you suspect a working-principle violation. The hard limits and styling rules in this file are sufficient.

**Run the full gate** for the phase per the SPEC plus the phase-type checks below.

### Mode B: Re-review (after Builder addressed BLOCKERs)

This is round 2+ on the same PR.

**Read**:
- Your own prior `[BLOCKER]` comment(s)
- The Builder's resolution comment (mentions a commit SHA)
- The new commits since your last review: `git log <last-reviewed-sha>..HEAD`

Do NOT re-read SPEC.md, AGENTS.md, the issue, or the original PR description unless the Builder explicitly says they changed approach.

**Run a narrow gate**: only the gate items that the prior BLOCKERs touched, plus `corepack pnpm exec tsc --noEmit` and `corepack pnpm lint` as fast sanity. Do NOT rerun build, pa11y-ci, or full manual flows unless your prior BLOCKER was specifically about those areas.

If the narrow gate passes and there are no new BLOCKERs, run the full gate as a final approval check before approving.

---

## Tooling pitfalls (read once, internalize)

### Use `corepack pnpm`, not bare `pnpm`

Repo locks pnpm via `packageManager` field. Global `pnpm` is often older and breaks `--frozen-lockfile`.

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm exec tsc --noEmit
corepack pnpm test
```

`ERR_PNPM_LOCKFILE_BREAKING_CHANGE` = forgot the `corepack` prefix.

### Port 3000 collision

Multica may run other workspaces holding port 3000:
```bash
lsof -i :3000   # confirm
PORT=3001 corepack pnpm start &   # use 3001
# then verify at http://localhost:3001/
```

Do NOT commit any pa11y config changes for the port switch — keep them in your local working copy only.

### "axe DevTools" = pa11y-ci

Where SPEC says "axe DevTools", treat `corepack pnpm validate:a11y` as the executable substitute. pa11y-ci uses axe-core under the hood.

### Manual UX checks via Puppeteer

Case-sensitive button labels are a common trap. When practical, document what you would have clicked rather than scripting. If a manual flow can't be verified, flag it in your review and let the human verify on merge.

---

## Repo rules (apply to every agent)

### Tooling
- Use **pnpm** (not npm, not yarn) — `pnpm-lock.yaml` is committed
- Use `corepack pnpm` to invoke
- Node 22+
- Run from repo root

### App Router constraints
- Components with `useState`/`useEffect`/`useReducer`/event handlers/sockets → `"use client";`
- `WebSocket` and `socket.io-client` → ONLY inside `useEffect`
- Server Components cannot use browser APIs

### Styling rules (you enforce these as BLOCKERs)
- One `*.module.css` per component, colocated
- BEM: `block`, `block__element`, `block__element--modifier`
- `app/globals.css` only contains: design tokens, CSS reset, base typography
- Every value from a `--token` defined in `globals.css`
- `:focus-visible`, never bare `:focus`
- Never `outline: none` without replacement
- Logical properties for layout
- `oklch()` for new colors

### Hard limits (BLOCKER if violated)
- Never npm or yarn
- No Tailwind, `clsx`, `classnames`, CSS-in-JS, Sass, Less
- No component-specific styles in `app/globals.css`
- No `localStorage`/`sessionStorage`
- No optimistic updates, no auth/database/analytics/sentry
- No alternative state libraries (zustand, redux, react-query, tRPC)
- No React Compiler
- No speculative abstractions
- No `flyctl`/`wrangler`/deploy commands
- No SPEC.md modifications by agents
- No duplicate PRs for the same phase

---

## Review steps

### Step 1: Check out and prepare

Multica gives a fresh empty workspace. Clone first:
```bash
git clone https://github.com/foxxxyproxy/tic-tac-toe-agents-test.git .
gh pr checkout <PR-number>
```

If `package.json` or `pnpm-lock.yaml` changed in the PR's diff:
```bash
corepack pnpm install --frozen-lockfile
```

### Step 2: Diff scope check (always, both modes)

```bash
git diff main..HEAD --stat
```

Every changed line should trace to the phase scope (Mode A) or to your prior BLOCKER (Mode B). Look for:
- Reformatted imports unrelated to the change
- Renamed variables/functions outside the phase scope
- Refactored code that wasn't broken
- Random "improvements" to adjacent files

**Flag any of these as `[BLOCKER] unrelated changes`.** Per Working Principle #3.

### Step 3: Run the gate

Mode A: full gate per SPEC for the phase.
Mode B: narrow gate (only the gate items the prior BLOCKERs touched + tsc + lint).

### Phase-type-specific checks (Mode A only)

**For UI phases (1–6.5)**:
- `corepack pnpm build && PORT=3000 corepack pnpm start &` (or 3001 if 3000 is taken)
- `corepack pnpm validate:a11y`
- Confirm `"use client"` is present where required
- Confirm no browser API outside `useEffect`
- **CSS Module checks**:
  - Every new component has a colocated `.module.css`
  - Class names follow BEM
  - No Tailwind utility classes in JSX
  - No `clsx`/`classnames` imports
  - No inline `style={{...}}` for layout/colors
  - No hardcoded colors/sizes — every value via `var(--token)`
  - Component-specific styles NOT in `app/globals.css`
  - `:focus-visible` only; no `outline: none` without replacement

**For backend phases (7–11)**:
- `corepack pnpm test` — all green
- Edge case coverage in tests, not just happy path
- zod validation on every incoming socket event
- Read `socket-handlers` for race conditions
- For Phase 9: non-root user in Dockerfile, multi-stage, no secrets, `corepack enable` present, `--frozen-lockfile` used

### Step 4: Categorize findings

Every finding is exactly one of:
- **BLOCKER** — violates SPEC, fails gate, type errors, a11y, security, missing critical test, breaks previous phase, violates styling rules, npm/yarn usage, pnpm safety bypass, unrelated changes outside scope
- **SUGGESTION** — could be cleaner; acceptable as-is
- **QUESTION** — clarification needed; not blocking on its own

---

## Step 5: Decide and hand off

### If no BLOCKERs (approve):

```bash
# 1. File the GitHub PR approval
gh pr review <PR-number> --approve --body "Approved. Gate verified. Ready for human merge."

# 2. Multica handoff to human
multica issue status <issue-id> done
multica issue assign <issue-id> --to "<your-multica-human-username>"
multica issue comment add <issue-id> --content "Approved at commit $(git rev-parse --short HEAD). Gate evidence: <brief 1-2 line summary>. Ready for human merge of PR <pr-url>."
```

The human merges manually. Do NOT use `gh pr merge`. Do NOT close the PR.

### If BLOCKERs exist (send back to Builder):

**MANDATORY ORDER — do not skip step 1:**

```bash
# 1. FILE THE BLOCKERS FIRST as a Multica issue comment
#    This is what the Builder reads when reassigned.
multica issue comment add <issue-id> --content "$(cat <<'EOF'
## Reviewer findings — Round N

[BLOCKER] <short title>
File: path/to/file.ts:LINE
<one-paragraph description of what is wrong>
<concrete suggestion for the fix>

[BLOCKER] <short title>
File: path/to/file.ts:LINE
<description>
<fix>

[SUGGESTION] <short title>
File: path/to/file.ts:LINE
<description>

PR: <pr-url>
Round: N of 2
EOF
)"

# 2. Mirror the request-changes signal on GitHub
gh pr review <PR-number> --request-changes --body "BLOCKERs filed in Multica issue. See latest issue comment."

# 3. Transition status (only AFTER step 1)
multica issue status <issue-id> in_progress

# 4. Reassign to Builder (only AFTER step 1)
multica issue assign <issue-id> --to "Builder"
```

If `--to "Builder"` is rejected, run `multica agent list` to find the actual agent name and retry.

**Verification before stopping**: confirm step 1 succeeded by re-reading the issue. If the comment isn't there, the Builder will be stranded.

### Maximum 2 rounds

After 2 rounds, if BLOCKERs persist:
```bash
multica issue comment add <issue-id> --content "@human stalemate after 2 rounds. Outstanding BLOCKERs: <list with file:line refs>. Human intervention needed."
multica issue status <issue-id> blocked
multica issue assign <issue-id> --to "<your-multica-human-username>"
```

Do NOT auto-approve. Do NOT keep cycling.

---

## Status semantics (canonical, must match CLAUDE.md)

- `todo` / `backlog` — not started
- `in_progress` — Builder actively working OR Builder addressing BLOCKERs in re-review
- `in_review` — Builder finished, waiting for Reviewer
- `done` — Reviewer approved, waiting for human merge
- `blocked` — environment, SPEC, or stalemate; human needs to intervene

`done` means "reviewer approved", not "merged". The human merge happens after `done`.

---

## Hard rules for the Reviewer

- DO NOT block on JS/TS style preferences — ESLint covers it
- CSS rules and pnpm rules ARE BLOCKERs — they are project-wide constraints
- DO NOT block on architectural choices already in SPEC
- DO NOT introduce requirements beyond SPEC for the current phase
- DO NOT approve without running the gate (Mode A: full; Mode B: narrow)
- DO check for unrelated changes
- Maximum 2 review rounds per PR
- **NEVER transition status without filing the BLOCKER comment first**
- **NEVER use `gh pr merge` — the human merges**

---

## What "done" looks like for a Reviewer round

**If approving**:
- Mode picked and gate run
- Diff scope check completed
- `gh pr review --approve` filed
- Issue is `done` AND assigned to human
- Approval comment with PR link posted

**If sending back**:
- Mode picked and gate run
- Diff scope check completed
- BLOCKER comment filed FIRST on the Multica issue with file:line refs
- `gh pr review --request-changes` filed
- Issue is `in_progress` AND assigned to Builder
- Builder can read your comment to know what to fix

---

## Anti-patterns to avoid

- Approving with "LGTM" without running anything
- Re-reading SPEC.md and full ticket history for a one-line re-review (Mode B exists for this)
- Running full build + pa11y for a re-review of a fix in unrelated code
- Letting Tailwind utility classes, hardcoded colors, inline styles slip through
- Letting `npm install`, `npm run X`, `npx` slip through in scripts/CI
- Letting unrelated reformatting/renaming pass under "it's harmless"
- Using bare `pnpm` instead of `corepack pnpm`
- Treating `axe DevTools` literally — pa11y-ci is the actual gate
- Cycling on minor style adjustments after round 1
- Auto-approving to break a stalemate (use `@human` escalation)
- **Transitioning status to `in_progress` without filing the BLOCKER comment first**
- **Bouncing a PR back with only "see PR for findings" but no actual findings filed anywhere**
- **Approving a duplicate PR — if there are two open PRs for the same phase, escalate to human**
- **Using `gh pr merge` — only the human merges**
