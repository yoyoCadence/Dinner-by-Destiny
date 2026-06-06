import assert from 'node:assert/strict';
import { createStoreHarness } from './helpers/browser-env.mjs';

function renderFreshStore(options) {
  const env = createStoreHarness(options);
  return { env, store: env.renderStore() };
}

{
  const { env, store } = renderFreshStore();
  assert.equal(store.state.restaurants.length, env.window.SEED_RESTAURANTS.length);
  assert.equal(store.state.diary.length, 0);
  assert.equal(store.state.settings.theme, 'warm');
  assert.equal(store.state.settings.noRadius, true);
  assert.ok(store.state.restaurants.every((r) => r.excludedUntil === null));

  store.setSetting('theme', 'dark');
  assert.equal(env.renderStore().state.settings.theme, 'dark');
}

{
  const { env, store } = renderFreshStore();
  const target = store.state.restaurants[0];
  store.logMeal({
    restId: target.id,
    name: target.name,
    cuisine: target.cuisine,
    price: target.price,
    date: '2026-06-05',
    cost: 220,
    mood: 'good',
    note: '測試紀錄',
  });

  let next = env.renderStore().state;
  assert.equal(next.diary.length, 1);
  assert.equal(next.diary[0].name, target.name);
  assert.equal(next.diary[0].cost, 220);
  assert.equal(next.restaurants.find((r) => r.id === target.id).eatCount, target.eatCount + 1);
  assert.equal(next.restaurants.find((r) => r.id === target.id).lastEaten, '2026-06-05');

  env.renderStore().updateDiary(next.diary[0].id, { note: '更新備註', cost: 260 });
  next = env.renderStore().state;
  assert.equal(next.diary[0].note, '更新備註');
  assert.equal(next.diary[0].cost, 260);

  env.renderStore().deleteDiary(next.diary[0].id);
  next = env.renderStore().state;
  assert.equal(next.diary.length, 0);
  assert.equal(next.restaurants.find((r) => r.id === target.id).eatCount, target.eatCount);
}

{
  const { env, store } = renderFreshStore();
  const target = store.state.restaurants.find((r) => r.cuisine === 'unknown');
  store.setCuisine(target.id, 'snack');
  store.setRating(target.id, 3.5);
  let next = env.renderStore().state.restaurants.find((r) => r.id === target.id);
  assert.equal(next.cuisine, 'snack');
  assert.equal(next.rating, 3.5);

  env.renderStore().snooze(target.id, 7);
  next = env.renderStore().state.restaurants.find((r) => r.id === target.id);
  assert.ok(next.excludedUntil);
  assert.equal(env.window.isSnoozed(next), true);

  env.renderStore().unsnooze(target.id);
  next = env.renderStore().state.restaurants.find((r) => r.id === target.id);
  assert.equal(next.excludedUntil, null);
}

{
  const { env, store } = renderFreshStore();
  const removeId = store.state.restaurants[0].id;
  const addList = [
    {
      id: 'import-demo-001',
      name: '匯入測試麵店',
      cuisine: 'noodle',
      confidence: 'food',
      price: 1,
      rating: 4,
      lat: 25.1,
      lng: 121.5,
      city: '台北',
      addr: '台北市測試路 9 號',
      eatCount: 0,
      lastEaten: '',
      dineIn: true,
      tags: ['test'],
      blurb: '測試匯入',
    },
    {
      id: store.state.restaurants[1].id,
      name: 'duplicate',
    },
  ];
  store.applyImport(addList, [removeId]);
  const next = env.renderStore().state.restaurants;
  assert.equal(next.some((r) => r.id === removeId), false);
  assert.equal(next.filter((r) => r.id === addList[0].id).length, 1);
  assert.equal(next.find((r) => r.id === addList[0].id).excludedUntil, null);
  assert.equal(next.filter((r) => r.id === store.state.restaurants[1].id).length, 1);
}

{
  const seed = createStoreHarness().window.SEED_RESTAURANTS[0];
  const storedState = {
    restaurants: [
      {
        id: seed.id,
        name: '舊名稱應被 seed 覆寫',
        cuisine: 'unknown',
        price: 3,
        rating: 2.2,
        lat: 0,
        lng: 0,
        eatCount: 9,
        lastEaten: '2026-01-02',
        excludedUntil: '2026-02-03',
      },
      {
        id: 'stale-restaurant',
        name: '舊資料應移除',
      },
    ],
    diary: [{ id: 'd1', name: '保留日記' }],
    settings: { theme: 'dark' },
    friends: [],
    onboarded: true,
  };
  const { env, store } = renderFreshStore({ storedState });
  const migrated = store.state.restaurants.find((r) => r.id === seed.id);
  assert.equal(store.state.restaurants.length, env.window.SEED_RESTAURANTS.length);
  assert.equal(migrated.name, seed.name);
  assert.equal(migrated.lat, seed.lat);
  assert.equal(migrated.eatCount, 9);
  assert.equal(migrated.rating, 2.2);
  assert.equal(migrated.lastEaten, '2026-01-02');
  assert.equal(migrated.excludedUntil, '2026-02-03');
  assert.equal(store.state.restaurants.some((r) => r.id === 'stale-restaurant'), false);
  assert.equal(store.state.diary[0].name, '保留日記');
  assert.equal(store.state.settings.theme, 'dark');
  assert.equal(store.state.settings.radius, 1200);
  assert.equal(store.state.settings.diceStyle, 'dice');
}

// deleteDiary：eatCount 已是 0 時不應跌破 0
{
  const seedId = createStoreHarness().window.SEED_RESTAURANTS[0].id;
  const storedState = {
    restaurants: [{ id: seedId, eatCount: 0 }],
    diary: [{ id: 'dx1', date: '2026-01-01', restId: seedId, name: '測試', cuisine: null, price: null, cost: null, mood: 'good', note: '' }],
    settings: { theme: 'warm', radius: 1200, noRadius: true, city: 'all', layout: 'card', diceStyle: 'dice' },
    friends: [],
    onboarded: true,
  };
  const { env, store } = renderFreshStore({ storedState });
  store.deleteDiary('dx1');
  const eatCount = env.renderStore().state.restaurants.find((r) => r.id === seedId).eatCount;
  assert.equal(eatCount, 0, 'eatCount should not go below 0');
}

// applyImport 傳入空陣列不應改變餐廳數量
{
  const { env, store } = renderFreshStore();
  const initialCount = store.state.restaurants.length;
  store.applyImport([], []);
  assert.equal(env.renderStore().state.restaurants.length, initialCount, 'empty import should be a no-op');
}

// applyImport 傳入 null 不應崩潰
{
  const { store } = renderFreshStore();
  const initialCount = store.state.restaurants.length;
  store.applyImport(null, null);
}

// isSnoozed：各種邊界條件
{
  const { env } = renderFreshStore();
  const { window } = env;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const today = window.todayStr();

  assert.ok(!window.isSnoozed({ excludedUntil: null }), 'null excludedUntil = not snoozed');
  assert.ok(!window.isSnoozed({ excludedUntil: '' }), 'empty string = not snoozed');
  assert.ok(window.isSnoozed({ excludedUntil: tomorrow }), 'future date = snoozed');
  assert.ok(!window.isSnoozed({ excludedUntil: yesterday }), 'past date = snooze expired');
  assert.ok(!window.isSnoozed({ excludedUntil: today }), 'today = snooze expired (daysAgo=0, not < 0)');
}

console.log('Store tests passed.');
