# Backend Direction

## Recommendation

Use a local-first PWA now, then add Supabase when the app needs cross-device sync, account backup, or shared group features.

The current app already works offline with `localStorage`, imports Google Maps data on device, and does not require a server for the core "what should I eat" flow. That is the safest default because Google Maps exports and dining history are sensitive location-adjacent data.

## Decision

Recommended path:

1. Keep MVP data local-only by default.
2. Add an explicit "enable sync" path later.
3. Use Supabase for sync when backend work starts.
4. Store only per-user data behind row-level security.
5. Never store service-role or admin keys in the PWA.

## Why Supabase

Supabase fits this project because it provides authentication, Postgres tables, row-level security, migrations, and storage in one stack. The data is relational enough to benefit from Postgres: users have places, imports, meal logs, filters, randomizer sessions, and optional group sessions.

## Alternatives

- **No backend:** Best privacy posture and simplest MVP. Weakness: no sync or backup.
- **Firebase:** Good offline sync story, but the app's data model is relational and policy review can become harder as records grow.
- **PocketBase / self-hosted:** Good for personal deployment, but less ideal if the project should be easy for future agents to deploy and maintain.
- **Custom API:** Avoid until the product has needs Supabase cannot cover.

## Privacy Model

Google Maps exports may contain visited places, reviewed places, timestamps, text reviews, addresses, coordinates, and inferred habits. Treat all imported data as private by default.

Rules:

- Imported files are parsed client-side first.
- Users choose what to save.
- Sync is opt-in.
- Each synced row must have an `owner_id`.
- Row-level policies must restrict every user-owned table to `owner_id = auth.uid()`.
- Public demo data must not be based on a real user's Google Maps export.
- Public repos must not include `uploads/`, raw exports, screenshots of private imports, or generated seed data from private history.

## Phased Plan

### Phase 1: Local MVP

- Keep `localStorage['dinner_by_destiny_v1']` as the canonical runtime store.
- Keep import parsing in `import-util.js`.
- Add export/import backup from app state JSON before backend sync.

### Phase 2: Supabase Foundation

- Add auth.
- Add schema migrations.
- Add per-user tables for places, meal logs, settings, import batches, and optional randomizer sessions.
- Keep local-first behavior and sync only after login.

### Phase 3: Sync And Groups

- Add last-write-wins or explicit conflict review for edited places.
- Add group sessions with short-lived share codes.
- Avoid exposing private place notes to group participants unless the owner explicitly shares them.

## Open Questions

- Should users need accounts before using the app, or only when enabling sync?
- Should imported Google Maps review text be stored, summarized, or discarded by default?
- Should group play share full restaurant names and locations, or only candidate labels chosen by the owner?
