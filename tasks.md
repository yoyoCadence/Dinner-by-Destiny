# Tasks

Use this file as the lightweight task board for this project unless the project explicitly uses GitHub Issues, Linear, Notion, or another tracker.

Current constraint: implementation is approved. Keep changes scoped to getting the project onto a clean runnable baseline.

## Next

- [ ] Decide backend direction, including Supabase vs alternatives, auth needs, privacy model, and data ownership rules
- [ ] Draft the Google Maps import data model for places, categories, visit records, filters, and random-selection inputs
- [ ] Verify the PWA manually in a browser after starting the local server with `npm.cmd run start`

## In Progress

## Backlog

- [ ] Create an approved migration plan for future changes beyond the imported baseline
- [ ] Add restaurant/place classification and simple filtering by range or context
- [ ] Add persistence and optional backend sync

## Done

- [x] Capture initial project context in `AGENTS.md` and seed the first planning task board
- [x] Connect this local folder to the GitHub repo `yoyoCadence/Dinner-by-Destiny` and establish a clean `main` baseline
- [x] Inspect and apply the reusable PWA baseline from `晚餐選擇.zip` without overwriting collaboration files
- [x] Rename app branding and user-facing identity to `今晚吃命`
- [x] Build the mobile-first installable app / PWA shell
- [x] Implement baseline Google Maps export import and normalization
- [x] Add baseline game-style randomizers: slot machine, dice, and card draw
- [x] Add verification commands for local serving and smoke checks
