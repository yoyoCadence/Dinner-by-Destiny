import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const backend = readFileSync('docs/backend-direction.md', 'utf8');
const model = readFileSync('docs/google-maps-import-data-model.md', 'utf8');
const readme = readFileSync('README.md', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const tasks = readFileSync('tasks.md', 'utf8');

assert.ok(backend.includes('local-first PWA'));
assert.ok(backend.includes('Supabase'));
assert.ok(backend.includes('row-level security'));
assert.ok(backend.includes('owner_id = auth.uid()'));
assert.ok(backend.includes('Sync is opt-in'));

assert.ok(model.includes('Restaurant'));
assert.ok(model.includes('MealLog'));
assert.ok(model.includes('Import Pipeline'));
assert.ok(model.includes('places ('));
assert.ok(model.includes('meal_logs ('));
assert.ok(model.includes('Name-derived ids can collide'));

assert.ok(readme.includes('Google Maps 匯出檔'));
assert.ok(readme.includes('docs/backend-direction.md'));
assert.ok(readme.includes('docs/google-maps-import-data-model.md'));

assert.ok(agents.includes('sanitized demo restaurants'));
assert.ok(agents.includes('npm.cmd run test'));

assert.ok(tasks.includes('Add import parser unit tests using sanitized Google Maps-style fixtures'));

console.log('Documentation tests passed.');
