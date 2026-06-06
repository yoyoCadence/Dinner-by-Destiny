# AGENTS.md

This file is the shared collaboration contract for Codex, Claude Code, and human contributors.

---

## 0. Project Context

> At project creation, the agent should fill or update this section from the user's initial project description.
> If key details are missing, ask concise follow-up questions before implementation.

- **Project name:** 今晚吃命
- **Project goal:** Build a mobile-first dinner/lunch decision app that imports Google Maps records, organizes and classifies food-place candidates, lets users filter by range or context, and uses game-like randomizers such as slots, dice, and card draws to choose what to eat.
- **Target users:** Mobile users who want a playful way to decide meals from their own Google Maps history or saved/visited places. Future AI coding agents and human contributors should also be able to continue development from clear project rules and tasks.
- **Tech stack:** Mobile-first React PWA prototype with no bundler. `index.html` loads React, ReactDOM, and Babel from CDN, then compiles local `.jsx` files in the browser. Local tooling uses Node scripts for static serving and smoke checks. Backend is undecided; Supabase is a known candidate, but alternatives may be proposed during architecture planning.
- **High-risk areas** (auth / DB schema / payments / deployment / etc.): Google Maps export/import parsing, user location and dining-history privacy, backend auth and row-level data ownership, database schema design, client-side secret exposure, PWA/offline storage behavior, and safe migration from the legacy compressed project without overwriting current repo rules.
- **Architecture constraints:** Treat current repository files as the collaboration baseline. The reusable PWA architecture from `晚餐選擇.zip` has been applied without overwriting `AGENTS.md`, `tasks.md`, or `.gitignore`. Primary UX target is saving the app to a phone home screen. GitHub repo target is `yoyoCadence/Dinner-by-Destiny`.
- **Verification commands:** `npm.cmd run test` for baseline smoke checks. `npm.cmd run start` or `node scripts/serve-static.mjs` for local serving at `http://localhost:4173`.

---

## 0.1 Current Technical State

> Fill only after the project has stable facts worth preserving.

- **Main entry points:** `index.html` is the browser entry point; `App.jsx` mounts `window.DinnerApp`; screen modules live in `screens/`; `scripts/serve-static.mjs` serves the PWA locally.
- **Storage / data model:** `store.jsx` persists app state in `localStorage['dinner_by_destiny_v1']`; `data.js` provides sanitized demo restaurants and cuisine metadata; `import-util.js` parses Google Maps GeoJSON-style exports into restaurant records.
- **Test coverage:** `npm.cmd run test` runs the Node test suite. Coverage includes app-shell smoke checks, sanitized demo data integrity, documentation guardrails, Google Maps import parsing/classification, privacy/ignored-file boundaries, PWA structure and Service Worker cache targets, static server behavior, store state operations, and theme/helper utilities.
- **Deployment / cache notes:** `sw.js` caches the PWA shell under `dinner-by-destiny-v2`; increment that cache name whenever cached app-shell files change. `manifest.webmanifest` is configured for standalone mobile install.

---

## 1. Execution Modes

Agents must operate in one of two modes:

### Mode A: Planning / Architecture
- Analyze the request
- Propose structure and changes
- Outline risks and next steps
- **DO NOT modify files yet**

### Mode B: Implementation
- Apply changes strictly based on the agreed plan
- Avoid introducing new design decisions mid-implementation

If the mode is unclear, default to **Mode A first**.

For clear low-risk tasks such as typo fixes, focused tests, or small documentation updates, agents may proceed in **Mode B** directly while still summarizing the change afterward.

---

## 2. Scope Control Rules

Agents must strictly limit changes to the requested scope.

Do NOT:
- Refactor unrelated files "while you are here"
- Rename or restructure directories outside the task scope
- Modify styling, formatting, or naming conventions globally without instruction

If an improvement is detected outside scope:
- Propose it instead of implementing it

---

## 3. Prohibited Behaviors

Do not:
- Silently replace or rewrite major files without instruction
- Mix a feature task with broad unrelated cleanup
- Sneak in schema, auth, or deployment edits under an unrelated feature PR
- Turn the repo into multiple conflicting architectural styles

---

## 4. Change Requirements

Every substantial change must make these clear:
- What changed
- Why this change was made
- What risks remain
- What the next recommended step is

The goal is handoff clarity, not just code delivery.

---

## 5. Canonical Baseline & Editing Rules

All changes must treat the current repository content as the canonical baseline.

- Preserve existing language, structure, and major content unless explicitly instructed otherwise
- Prefer **additive edits** over rewrites
- Do NOT replace entire files unless explicitly requested
- Do NOT reorganize large sections without clear instruction

---

## 6. Handoff Friendliness

Code and documentation should be written so another agent or human can continue without relying on private memory or one-off chat context.

- Write module responsibilities clearly
- Keep comments focused and actionable
- Make placeholders explicit
- Prefer obvious extension points over clever shortcuts

---

## 7. Branch / PR Hygiene

At the start of every task:
- Check current branch and worktree status first
- If starting from product baseline, switch to `main`, fetch, and fast-forward from `origin/main` before creating a new branch
- If already on a feature branch, confirm it is the intended branch for this task

Before opening or updating a PR:
- Fetch and fast-forward local `main` from `origin/main`
- Branch from current `main`, not from an older local checkout
- Before pushing, check the branch against `origin/main` again — if `main` moved, rebase first
- Do not re-submit duplicate generated assets or older runtime code under the same filenames

---

## 8. Task Lifecycle

Tasks must move through the following states:

**Backlog → Next → In Progress → Done**

Use `tasks.md` as the default lightweight task board unless the project explicitly uses GitHub Issues, Linear, Notion, or another tracker.

Rules:
- Do not start a task that is not in Next or In Progress
- Move task to In Progress before implementation
- Move to Done only when completed
- Do not silently skip or reorder tasks
- For tiny fixes or direct user requests, agents may complete the work first, then add or update the task record afterward

---

## 9. Task Granularity Rule

Tasks must be:
- Small enough to complete in one session
- Clear enough that no interpretation is needed
- Independent enough to not require large refactors

Avoid vague tasks like "implement system", "build feature", or "add 3D".

---

## 10. Security Baseline

### Environment variables
- Never print secret values to the terminal — only check existence:
  ```bash
  [ -n "$API_KEY" ] && echo "API_KEY is set" || echo "API_KEY is missing"
  ```
- Never use `echo $SECRET`, `printenv KEY`, or any command that outputs a value
- Never hardcode secrets in source files
- Never commit `.env` files (use `.env.example` as template)

### General
- Never use `service_role`, admin, server-only, or equivalent privileged keys on the client side
- Database, storage, and API access policies must be explicit — do not rely on default-open behavior
