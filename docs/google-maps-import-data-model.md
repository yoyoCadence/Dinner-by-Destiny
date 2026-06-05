# Google Maps Import Data Model

## Current Runtime Shape

The current PWA stores one JSON object in `localStorage['dinner_by_destiny_v1']`.

```js
{
  restaurants: Restaurant[],
  diary: MealLog[],
  settings: AppSettings,
  friends: Friend[],
  onboarded: true
}
```

## Restaurant

```js
{
  id: 'demo-noodle-001',
  name: '命運牛肉麵',
  cuisine: 'noodle',
  confidence: 'food',
  price: 2,
  rating: 4.6,
  lat: 25.0466,
  lng: 121.5169,
  city: '台北',
  addr: '台北市中正區示範路 1 號',
  eatCount: 1,
  lastEaten: '2026-05-12',
  dineIn: true,
  tags: ['demo'],
  blurb: '短摘要',
  excludedUntil: null
}
```

Field notes:

- `id`: Stable app id. Current import derives this from cleaned place name.
- `name`: Clean display name after removing trailing notes.
- `cuisine`: One of `window.CUISINES[*].key`; `unknown` means user should classify it.
- `confidence`: Import classifier output: `food`, `maybe`, or omitted for seed/demo rows.
- `price`: 0 unknown, 1 low, 2 medium, 3 high.
- `rating`: User-visible rating from import or manual edit.
- `lat` / `lng`: Coordinates used for radius filtering and Maps links.
- `city` / `addr`: Display and city filtering.
- `eatCount` / `lastEaten`: Derived from import text or updated by meal logs.
- `excludedUntil`: Snooze marker for "recently tired of this place".

## MealLog

```js
{
  id: 'd1710000000000',
  date: '2026-06-05',
  restId: 'demo-noodle-001',
  name: '命運牛肉麵',
  cuisine: 'noodle',
  price: 2,
  cost: 180,
  mood: 'happy',
  note: '今天想喝湯'
}
```

`restId` may be `null` for a manually entered meal that does not map to a restaurant.

## AppSettings

```js
{
  theme: 'warm',
  radius: 1200,
  noRadius: true,
  city: 'all',
  layout: 'card',
  diceStyle: 'dice'
}
```

## Import Pipeline

Current parser: `window.GMImport.parseGeoJSON(json, opts)` in `import-util.js`.

Pipeline:

1. Read Google Maps JSON in `screens/ImportSheet.jsx`.
2. Parse JSON as a GeoJSON-style `FeatureCollection`.
3. For each feature:
   - read `properties.location.name`
   - read `geometry.coordinates` as `[lng, lat]`
   - skip missing names and zero coordinates
   - classify place as `food`, `maybe`, or `skip`
   - derive cuisine, city, price, rating, eat count, date, and short blurb
4. Diff imported records against current restaurants.
5. Let user confirm additions and removals.
6. Apply confirmed changes through `store.applyImport(addList, removeIds)`.

## Future Supabase Tables

Recommended tables:

- `profiles`: user profile and sync settings.
- `places`: canonical per-user restaurant/place records.
- `place_tags`: optional tags per place.
- `meal_logs`: diary entries.
- `import_batches`: metadata for each import attempt.
- `import_batch_items`: parsed rows and classifier decisions for review/debugging.
- `randomizer_sessions`: solo or group randomizer runs.
- `group_session_votes`: optional votes for shared decision sessions.

Every user-owned table should include:

- `id`
- `owner_id`
- `created_at`
- `updated_at`

Sensitive raw fields from Google exports should either be discarded after parsing or stored only in user-owned rows with explicit consent.

## Suggested Supabase Schema Draft

```sql
places (
  id uuid primary key,
  owner_id uuid not null,
  source text not null default 'manual',
  source_place_key text,
  name text not null,
  cuisine text not null default 'unknown',
  confidence text,
  price int,
  rating numeric,
  lat numeric,
  lng numeric,
  city text,
  address text,
  eat_count int not null default 0,
  last_eaten date,
  dine_in boolean,
  blurb text,
  excluded_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

```sql
meal_logs (
  id uuid primary key,
  owner_id uuid not null,
  place_id uuid,
  date date not null,
  name text not null,
  cuisine text,
  price int,
  cost numeric,
  mood text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

```sql
import_batches (
  id uuid primary key,
  owner_id uuid not null,
  source text not null,
  file_name text,
  status text not null,
  parsed_count int not null default 0,
  accepted_count int not null default 0,
  rejected_count int not null default 0,
  created_at timestamptz not null default now()
)
```

## Risks

- Name-derived ids can collide when two places have the same cleaned name.
- Raw review text can reveal habits and should not be synced by default.
- Coordinates and timestamps are sensitive even without review text.
- Removing a place during re-import may delete user edits if the diff model is too aggressive.

## Next Implementation Tasks

- Add import parser unit tests using sanitized fixtures.
- Add app-state export/import backup before backend sync.
- Add stable source ids when Google export contains enough place metadata.
- Decide whether raw import rows should be discarded or retained after review.
