import assert from 'node:assert/strict';
import { loadBrowserFiles } from './helpers/browser-env.mjs';

// 最小化 React mock：只需 Group.jsx 頂層解構時不崩潰；pickThreeG 本身不用 hook
const React = {
  useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
  useEffect: () => {},
  useRef: (v) => ({ current: v }),
  createElement: () => null,
};

// 載入 data.js + theme.js (HOME_LOC, distM, daysAgo) + Group.jsx (pickThreeG)
const { window } = loadBrowserFiles(
  ['data.js', 'theme.js', 'screens/Group.jsx'],
  { React, window: { Icons: {} } },
);

assert.ok(window.Group.toString().includes('同一支手機上的派對投票'), 'Group UI should clarify that no-backend voting is local/pass-and-play only');
assert.ok(window.Group.toString().includes('需要之後加同步房間'), 'Group UI should not imply remote friend voting works before backend rooms exist');

// 載入 store.jsx 後 isSnoozed 才會掛到 window；這裡直接補上，避免額外引入 store 依賴
window.isSnoozed = (r) => r.excludedUntil && window.daysAgo(r.excludedUntil) < 0;

const BASE = window.HOME_LOC; // {lat: 25.0478, lng: 121.517, label: '台北車站'}

// 建立測試用餐廳（距離已知）
function makeR(id, latOffset, lngOffset, extra = {}) {
  return { id, lat: BASE.lat + latOffset, lng: BASE.lng + lngOffset, cuisine: 'noodle', eatCount: 0, excludedUntil: null, ...extra };
}

const nearby = makeR('r-near', 0, 0);                        // 0 m
const close  = makeR('r-close', 0.005, 0);                   // ~550 m
const faraway = makeR('r-far', 0.1, 0.1);                    // ~13 km
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const snoozed = makeR('r-snoozed', 0, 0, { excludedUntil: tomorrow });

// --- noRadius=false: 嚴格半徑過濾 ---
{
  const radius = 1000; // 1 km
  const result = window.pickThreeG([nearby, close, faraway, snoozed], radius, false);
  const ids = result.map((x) => x.r.id);
  assert.ok(ids.includes('r-near'), 'nearby should be included in radius mode');
  assert.ok(ids.includes('r-close'), 'close (~550m) should be included within 1km radius');
  assert.ok(!ids.includes('r-far'), 'faraway should be excluded in radius mode');
  assert.ok(!ids.includes('r-snoozed'), 'snoozed should always be excluded');
}

// --- noRadius=true: 忽略距離限制 ---
{
  const radius = 500; // 500 m，此半徑只有 nearby 在內
  const result = window.pickThreeG([nearby, faraway, snoozed], radius, true);
  const ids = result.map((x) => x.r.id);
  assert.ok(ids.includes('r-near'), 'nearby should be included with noRadius');
  assert.ok(ids.includes('r-far'), 'faraway should be included when noRadius=true');
  assert.ok(!ids.includes('r-snoozed'), 'snoozed should still be excluded with noRadius');
}

// --- 候選少於 3 家：回傳全部 ---
{
  const result = window.pickThreeG([nearby, close], 9999, true);
  assert.equal(result.length, 2, 'returns all when pool < 3');
}

// --- 空池 ---
{
  const result = window.pickThreeG([], 9999, true);
  assert.equal(result.length, 0, 'empty pool returns empty array');
}

// --- 全部被 snooze：空結果 ---
{
  const allSnoozed = [
    makeR('s1', 0, 0, { excludedUntil: tomorrow }),
    makeR('s2', 0.001, 0, { excludedUntil: tomorrow }),
  ];
  const result = window.pickThreeG(allSnoozed, 9999, true);
  assert.equal(result.length, 0, 'all-snoozed pool returns empty');
}

// --- 最多回傳 3 家 ---
{
  const many = Array.from({ length: 6 }, (_, i) => makeR('m' + i, 0, i * 0.001));
  const result = window.pickThreeG(many, 9999, true);
  assert.equal(result.length, 3, 'returns at most 3');
}

// --- 結果包含距離 (dist 欄位) ---
{
  const result = window.pickThreeG([nearby], 9999, true);
  assert.equal(typeof result[0].dist, 'number', 'result items have numeric dist');
  assert.ok(result[0].dist < 1, 'nearby dist should be < 1m');
}

console.log('Group pickThreeG tests passed.');
