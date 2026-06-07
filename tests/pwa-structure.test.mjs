import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const app = readFileSync('App.jsx', 'utf8');
const importSheet = readFileSync('screens/ImportSheet.jsx', 'utf8');
const sw = readFileSync('sw.js', 'utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const gitignore = readFileSync('.gitignore', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const deployWorkflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

const expectedScriptOrder = [
  'data.js',
  'theme.js',
  'import-util.js',
  'tweaks-panel.jsx',
  'store.jsx',
  'icons.jsx',
  'bits.jsx',
  'screens/Dice.jsx',
  'screens/Explore.jsx',
  'screens/Diary.jsx',
  'screens/Stats.jsx',
  'screens/Group.jsx',
  'screens/ImportSheet.jsx',
  'App.jsx',
];

let lastIndex = -1;
for (const file of expectedScriptOrder) {
  const index = html.indexOf(file);
  assert.notEqual(index, -1, `index.html must load ${file}`);
  assert.ok(index > lastIndex, `${file} must be loaded after the previous script`);
  lastIndex = index;
}

assert.ok(html.includes('<meta name="apple-mobile-web-app-title" content="今晚吃命" />'));
assert.ok(html.includes('<title>今晚吃命</title>'));
assert.ok(html.includes('navigator.serviceWorker.register(\'sw.js\')'));
assert.ok(html.includes('width: 100vw; height: 100dvh'), 'mobile viewport should not render inside the desktop phone frame');
assert.ok(html.includes('@media (min-width: 640px)'), 'desktop phone frame should be limited to wide viewports');
assert.ok(app.includes("width: '100%'"));
assert.ok(app.includes("className: 'app-preview-chrome status'"));
assert.ok(app.includes('第一次使用說明'), 'App should include a first-run onboarding sheet');
assert.ok(app.includes('重看第一次使用說明'), 'Settings should let users reopen onboarding');
assert.ok(app.includes('takeout.google.com'), 'Onboarding should point users to Google Takeout');
assert.ok(app.includes('Maps (your places)'), 'Onboarding should name the Google Maps Takeout export');
assert.ok(app.includes('評論.json') && app.includes('已儲存的地點.json'), 'Onboarding should name the import files users need');
assert.ok(importSheet.includes('multiple: true'), 'Google Maps import input should allow selecting saved places and reviews together');
assert.ok(importSheet.includes('includeNonFood: true'), 'Import review should include excluded places so users can correct classifier mistakes');
assert.ok(importSheet.includes('showSkipped'), 'Import review should let users expand the excluded-place list');
assert.ok(!html.includes('晚餐選擇</title>'));

const cacheMatch = sw.match(/const CACHE = '([^']+)'/);
assert.ok(cacheMatch);
assert.match(cacheMatch[1], /^dinner-by-destiny-v\d+$/);
assert.ok(agents.includes(cacheMatch[1]), 'AGENTS.md cache note should match sw.js CACHE');
assert.ok(!sw.includes('screens/Sheets.jsx'), 'service worker must not cache missing Sheets screen');

const appShellBlock = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(appShellBlock);
const appShell = [...appShellBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.equal(new Set(appShell).size, appShell.length, 'APP_SHELL entries must be unique');
for (const file of appShell) {
  assert.ok(existsSync(file), `APP_SHELL file must exist: ${file}`);
}
for (const file of expectedScriptOrder) {
  assert.ok(appShell.includes(file), `APP_SHELL must cache ${file}`);
}

assert.equal(manifest.name, '今晚吃命');
assert.equal(manifest.short_name, '今晚吃命');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.orientation, 'portrait');
assert.equal(manifest.icons.length, 3);
for (const icon of manifest.icons) {
  assert.ok(existsSync(icon.src), `manifest icon must exist: ${icon.src}`);
}
assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));

assert.equal(pkg.private, true);
assert.equal(pkg.scripts.start, 'node scripts/serve-static.mjs');
assert.equal(pkg.scripts.test, 'node tests/run-all.mjs');
assert.ok(deployWorkflow.includes('npm run test'), 'Pages workflow should run tests before deploying');
assert.ok(deployWorkflow.includes('npm run build:pages'), 'Pages workflow should prepare the static artifact');
assert.ok(deployWorkflow.includes('actions/deploy-pages'), 'Pages workflow should deploy through GitHub Pages');

for (const ignored of ['.legacy_extract/', '*.zip', 'uploads/', '.env']) {
  assert.ok(gitignore.includes(ignored), `.gitignore should include ${ignored}`);
}

console.log('PWA structure tests passed.');
