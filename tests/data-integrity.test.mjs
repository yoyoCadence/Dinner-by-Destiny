import assert from 'node:assert/strict';
import { loadBrowserFiles } from './helpers/browser-env.mjs';

const { window } = loadBrowserFiles(['data.js']);

assert.ok(window.HOME_LOC);
assert.equal(typeof window.HOME_LOC.lat, 'number');
assert.equal(typeof window.HOME_LOC.lng, 'number');
assert.ok(window.HOME_LOC.label);

const cuisineKeys = new Set(window.CUISINES.map((c) => c.key));
assert.ok(cuisineKeys.has('unknown'));
assert.equal(cuisineKeys.size, window.CUISINES.length, 'cuisine keys must be unique');

const ids = new Set();
for (const restaurant of window.SEED_RESTAURANTS) {
  assert.match(restaurant.id, /^demo-[a-z]+-\d{3}$/);
  assert.ok(!ids.has(restaurant.id), `duplicate restaurant id: ${restaurant.id}`);
  ids.add(restaurant.id);

  assert.ok(restaurant.name);
  assert.ok(cuisineKeys.has(restaurant.cuisine), `unknown cuisine key: ${restaurant.cuisine}`);
  assert.ok(Number.isInteger(restaurant.price));
  assert.ok(restaurant.price >= 1 && restaurant.price <= 3);
  assert.equal(typeof restaurant.rating, 'number');
  assert.ok(restaurant.rating >= 0 && restaurant.rating <= 5);
  assert.notEqual(restaurant.lat, 0);
  assert.notEqual(restaurant.lng, 0);
  assert.ok(window.CITIES.includes(restaurant.city), `city must be listed in CITIES: ${restaurant.city}`);
  assert.ok(Array.isArray(restaurant.tags));
  assert.ok(restaurant.tags.includes('demo'));
  assert.match(restaurant.lastEaten || '2026-01-01', /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(restaurant.blurb.includes('Demo 資料'));
}

assert.ok(window.SEED_RESTAURANTS.some((r) => r.cuisine === 'unknown'), 'demo data should include one unknown classification row');
assert.ok(window.SEED_RESTAURANTS.some((r) => !r.dineIn), 'demo data should include one non-dine-in row');

console.log('Data integrity tests passed.');
