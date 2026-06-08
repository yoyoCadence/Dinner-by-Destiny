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
  assert.equal(store.state.settings.cuisine, 'all');
  assert.equal(store.state.onboarded, false);
  assert.equal(store.state.onboardingVersionSeen, 0);
  assert.deepEqual(Array.from(store.state.removedRestaurantIds), []);
  assert.ok(store.state.restaurants.every((r) => r.excludedUntil === null));

  store.setSetting('theme', 'dark');
  assert.equal(env.renderStore().state.settings.theme, 'dark');

  env.renderStore().completeOnboarding();
  assert.equal(env.renderStore().state.onboarded, true);
  assert.equal(env.renderStore().state.onboardingVersionSeen, env.window.ONBOARDING_VERSION);
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
      reviewText: '完整匯入評論',
      mapUrl: 'https://maps.google.com/?cid=import-demo',
    },
    {
      id: store.state.restaurants[1].id,
      name: 'duplicate',
    },
  ];
  store.applyImport(addList, [removeId]);
  const nextState = env.renderStore().state;
  const next = nextState.restaurants;
  assert.equal(next.some((r) => r.id === removeId), false);
  assert.equal(next.filter((r) => r.id === addList[0].id).length, 1);
  assert.equal(next.find((r) => r.id === addList[0].id).excludedUntil, null);
  assert.equal(next.find((r) => r.id === addList[0].id).reviewText, '完整匯入評論');
  assert.equal(next.find((r) => r.id === addList[0].id).mapUrl, 'https://maps.google.com/?cid=import-demo');
  assert.equal(next.filter((r) => r.id === store.state.restaurants[1].id).length, 1);
  assert.deepEqual(Array.from(nextState.removedRestaurantIds), [removeId], 'removed seed restaurants should stay removed after reload');
}

{
  const { env, store } = renderFreshStore();
  const seedId = store.state.restaurants[0].id;
  env.renderStore().addManualRestaurant({
    name: '手動新增餐廳應保留',
    cuisine: 'taiwanese',
    city: '台北',
    addr: '公司附近',
    lat: 0,
    lng: 0,
    mapUrl: 'https://maps.app.goo.gl/manual',
  });
  let next = env.renderStore().state;
  const manual = next.restaurants.find((r) => r.name === '手動新增餐廳應保留');
  assert.ok(manual, 'manual restaurant should be added');
  assert.equal(manual.source, 'manual');
  assert.equal(manual.mapUrl, 'https://maps.app.goo.gl/manual');
  env.renderStore().applyImport([], [manual.id, seedId]);
  next = env.renderStore().state;
  assert.ok(next.restaurants.some((r) => r.id === manual.id), 'manual restaurants should not be removed by Google Maps import deletion');
  assert.equal(next.restaurants.some((r) => r.id === seedId), false, 'import-managed restaurants can still be removed');
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
        id: 'imported-restaurant',
        name: '匯入餐廳應保留',
        cuisine: 'snack',
        price: 1,
        rating: 4.1,
        lat: 25.02,
        lng: 121.45,
        city: '新北',
        addr: '新北市測試路 1 號',
        eatCount: 2,
        lastEaten: '2026-03-04',
        reviewText: '舊匯入評論',
        mapUrl: 'https://maps.google.com/?cid=stored-import',
        excludedUntil: null,
      },
      {
        id: 'stale-restaurant',
        name: '缺少座標的舊資料應移除',
      },
    ],
    diary: [{ id: 'd1', name: '保留日記' }],
    settings: { theme: 'dark' },
    friends: [],
    onboarded: true,
  };
  const { env, store } = renderFreshStore({ storedState });
  const migrated = store.state.restaurants.find((r) => r.id === seed.id);
  const imported = store.state.restaurants.find((r) => r.id === 'imported-restaurant');
  assert.equal(store.state.restaurants.length, env.window.SEED_RESTAURANTS.length + 1);
  assert.equal(migrated.name, seed.name);
  assert.equal(migrated.lat, seed.lat);
  assert.equal(migrated.eatCount, 9);
  assert.equal(migrated.rating, 2.2);
  assert.equal(migrated.lastEaten, '2026-01-02');
  assert.equal(migrated.excludedUntil, '2026-02-03');
  assert.ok(imported, 'migrate should preserve complete imported restaurants');
  assert.equal(imported.name, '匯入餐廳應保留');
  assert.equal(imported.eatCount, 2);
  assert.equal(imported.reviewText, '舊匯入評論');
  assert.equal(imported.mapUrl, 'https://maps.google.com/?cid=stored-import');
  assert.equal(store.state.restaurants.some((r) => r.id === 'stale-restaurant'), false);
  assert.equal(store.state.diary[0].name, '保留日記');
  assert.equal(store.state.settings.theme, 'dark');
  assert.equal(store.state.settings.radius, 1200);
  assert.equal(store.state.settings.diceStyle, 'dice');
  assert.equal(store.state.settings.cuisine, 'all');
  assert.deepEqual(Array.from(store.state.removedRestaurantIds), []);
  assert.equal(store.state.onboardingVersionSeen, 0);
}

// migrate：使用者匯入時刪掉的內建示範餐廳，重開後不應復活
{
  const seed = createStoreHarness().window.SEED_RESTAURANTS[0];
  const storedState = {
    restaurants: [],
    removedRestaurantIds: [seed.id],
    diary: [],
    settings: { theme: 'warm' },
    friends: [],
    onboarded: true,
  };
  const { env, store } = renderFreshStore({ storedState });
  assert.equal(store.state.restaurants.some((r) => r.id === seed.id), false);
  assert.equal(store.state.restaurants.length, env.window.SEED_RESTAURANTS.length - 1);
  assert.deepEqual(Array.from(store.state.removedRestaurantIds), [seed.id]);
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

// updateDiary：更改日期時同步餐廳 lastEaten
{
  const { env, store } = renderFreshStore();
  const target = store.state.restaurants[0];
  store.logMeal({
    restId: target.id,
    name: target.name,
    cuisine: target.cuisine,
    price: target.price,
    date: '2026-06-05',
    mood: 'good',
  });
  let next = env.renderStore().state;
  env.renderStore().updateDiary(next.diary[0].id, { date: '2026-06-01' });
  next = env.renderStore().state;
  assert.equal(next.diary[0].date, '2026-06-01');
  assert.equal(next.restaurants.find((r) => r.id === target.id).lastEaten, '2026-06-01');
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
  const { env, store } = renderFreshStore();
  const initialCount = store.state.restaurants.length;
  store.applyImport(null, null);
  assert.equal(env.renderStore().state.restaurants.length, initialCount, 'null import should be a no-op');
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
