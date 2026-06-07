# Tasks

Use this file as the lightweight task board for this project unless the project explicitly uses GitHub Issues, Linear, Notion, or another tracker.

Current constraint: implementation is approved. Keep changes scoped to getting the project onto a clean runnable baseline.

## Next

- [ ] Verify the PWA manually in a browser after starting the local server with `npm.cmd run start`
- [ ] Add app-state export/import backup before backend sync
- [ ] Add custom dinner lists so users can create a named list, choose imported restaurants into it, and run the existing dice/slot/card tools against that list
- [ ] Add a minimal manual place entry flow for custom lists: require only a name, keep cuisine/price/rating optional, and default missing fields safely
- [ ] Add Google Maps share-link paste support for manual place entry, extracting the best available name/link and storing the original URL when parsing is uncertain

## In Progress

## Backlog

- [ ] Create an approved migration plan for future changes beyond the imported baseline
- [ ] Add restaurant/place classification and simple filtering by range or context
- [ ] Plan the Supabase schema and RLS policies for local-first opt-in sync, covering profiles, places, tags, meal logs, settings, import batches, import items, randomizer sessions, groups, members, and votes
- [ ] Add Supabase project foundation: environment template, client initialization, migrations, and user-owned RLS policies without exposing service-role keys in the PWA
- [ ] Add opt-in authentication for sync while keeping no-login local usage available
- [ ] Add one-way cloud backup and restore for local app state before building full bidirectional sync
- [ ] Add bidirectional sync with updated_at tracking, soft deletes, local dirty queue, and conflict handling for edited places and meal logs
- [ ] Add group decision backend primitives with short-lived share codes, explicit member access, and no sharing of private reviews or notes by default
- [ ] Add privacy controls for synced Google Maps review text, coordinates, and import history, including a clear local-only mode

## Done

- [x] Add first-run onboarding tutorial explaining what the app does, why users should import Google Maps restaurant data, where to export that data from Google Maps, how to import it into this app, and add a Settings action to reopen the tutorial later
- [x] Fix Google Maps review import details and review-screen excluded-place correction
- [x] Fix real-device import and layout issues: support multi-file Google Maps imports and remove the desktop phone frame from mobile viewports
- [x] Fix project review findings for imported restaurant persistence, local date handling, import id collisions, PWA cache versioning, Pages workflow coverage, and regression tests
- [x] Configure GitHub Pages deployment for the static PWA
- [x] Capture initial project context in `AGENTS.md` and seed the first planning task board
- [x] Connect this local folder to the GitHub repo `yoyoCadence/Dinner-by-Destiny` and establish a clean `main` baseline
- [x] Inspect and apply the reusable PWA baseline from `晚餐選擇.zip` without overwriting collaboration files
- [x] Rename app branding and user-facing identity to `今晚吃命`
- [x] Build the mobile-first installable app / PWA shell
- [x] Implement baseline Google Maps export import and normalization
- [x] Add baseline game-style randomizers: slot machine, dice, and card draw
- [x] Add verification commands for local serving and smoke checks
- [x] Decide backend direction, including Supabase vs alternatives, auth needs, privacy model, and data ownership rules
- [x] Draft the Google Maps import data model for places, categories, visit records, filters, and random-selection inputs
- [x] Add import parser unit tests using sanitized Google Maps-style fixtures
- [x] Add broader Node coverage for demo data, docs, privacy boundaries, PWA structure, static server behavior, store operations, and theme helpers
