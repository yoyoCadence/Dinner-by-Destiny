import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tracked = spawnSync('git', ['ls-files'], { encoding: 'utf8' });
assert.equal(tracked.status, 0, tracked.stderr);
const trackedFiles = tracked.stdout.trim().split(/\r?\n/).filter(Boolean);

for (const file of trackedFiles) {
  assert.ok(!file.startsWith('uploads/'), `private upload fixture should not be tracked: ${file}`);
  assert.ok(!file.startsWith('.legacy_extract/'), `legacy extraction should not be tracked: ${file}`);
  assert.ok(!file.endsWith('.zip'), `zip archive should not be tracked: ${file}`);
  assert.ok(!file.endsWith('.env'), `.env file should not be tracked: ${file}`);
}

const data = readFileSync('data.js', 'utf8');
assert.ok(data.includes('Demo restaurant data'));
assert.ok(data.includes('Users should import their own data locally'));
assert.ok(!data.includes('Google Maps「已儲存的地點 + 評論」自動產生'));
assert.ok(!data.includes('"id":"gm'), 'demo seed should not contain generated Google Maps ids');
assert.ok(!data.includes('review_text_published'), 'demo seed should not contain raw Google review fields');
assert.ok(!data.includes('five_star_rating_published'), 'demo seed should not contain raw Google rating fields');

const gitignore = readFileSync('.gitignore', 'utf8');
assert.ok(gitignore.includes('uploads/'));
assert.ok(gitignore.includes('.legacy_extract/'));
assert.ok(gitignore.includes('*.zip'));

console.log('Privacy boundary tests passed.');
