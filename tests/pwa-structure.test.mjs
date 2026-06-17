import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const app = readFileSync('App.jsx', 'utf8');
const dice = readFileSync('screens/Dice.jsx', 'utf8');
const explore = readFileSync('screens/Explore.jsx', 'utf8');
const importSheet = readFileSync('screens/ImportSheet.jsx', 'utf8');
const manualSheet = readFileSync('screens/ManualPlaceSheet.jsx', 'utf8');
const sw = readFileSync('sw.js', 'utf8');
const version = JSON.parse(readFileSync('version.json', 'utf8'));
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const gitignore = readFileSync('.gitignore', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const deployWorkflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const pagesArtifactScript = readFileSync('scripts/prepare-pages-artifact.mjs', 'utf8');

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
  'screens/ManualPlaceSheet.jsx',
  'App.jsx',
];

let lastIndex = -1;
for (const file of expectedScriptOrder) {
  const index = html.indexOf(file);
  assert.notEqual(index, -1, `index.html must load ${file}`);
  assert.ok(index > lastIndex, `${file} must be loaded after the previous script`);
  lastIndex = index;
  assert.ok(pagesArtifactScript.includes(`'${file}'`), `Pages artifact must include ${file}`);
}

assert.ok(html.includes('<meta name="apple-mobile-web-app-title" content="今晚吃命" />'));
assert.ok(html.includes('<title>今晚吃命</title>'));
assert.ok(html.includes('navigator.serviceWorker.register(\'sw.js\')'));
const appVersionMatch = html.match(/window\.APP_VERSION = '([^']+)'/);
assert.ok(appVersionMatch, 'index.html should expose the current app version');
assert.equal(version.version, appVersionMatch[1], 'version.json should match window.APP_VERSION');
assert.ok(html.includes('version.json?ts='), 'PWA should check the latest version without relying on cache');
assert.ok(html.includes('pwa-update-available'), 'PWA should notify the app when a new version is available');
assert.ok(html.includes('window.applyPWAUpdate'), 'PWA should expose a user-triggered update action');
assert.ok(html.includes('window.forcePWARefresh'), 'PWA should expose a force-refresh action for stale mobile app shells');
assert.ok(html.includes('caches.keys()'), 'Force refresh should clear app shell Cache Storage');
assert.ok(html.includes('registration.unregister()'), 'Force refresh should unregister stale service workers before reloading');
assert.ok(html.includes('app_refresh'), 'Force refresh should reload with a cache-busting URL parameter');
assert.ok(!html.includes('localStorage.clear()'), 'PWA refresh must not clear imported local restaurant data');
assert.ok(html.includes('width: 100vw; height: 100dvh'), 'mobile viewport should not render inside the desktop phone frame');
assert.ok(!html.includes('width: 390px'), 'production PWA should not use a fixed phone-preview width');
assert.ok(!html.includes('height: 844px'), 'production PWA should not use a fixed phone-preview height');
assert.ok(!html.includes('border-radius: 54px'), 'production PWA should not render a decorative phone frame');
assert.ok(!html.includes('app-preview-chrome'), 'production PWA should not include fake phone chrome CSS');
assert.ok(!html.includes('function fit()'), 'production PWA should not scale a desktop phone mockup');
assert.ok(app.includes("width: '100%'"));
assert.ok(!app.includes('app-preview-chrome'), 'App should not render fake status/home bars');
assert.ok(app.includes('第一次使用說明'), 'App should include a first-run onboarding sheet');
assert.ok(app.includes('重看第一次使用說明'), 'Settings should let users reopen onboarding');
assert.ok(app.includes('takeout.google.com'), 'Onboarding should point users to Google Takeout');
assert.ok(app.includes("href: 'https://takeout.google.com'"), 'Onboarding should make Google Takeout a direct external link');
assert.ok(app.includes('只勾「地圖（你的地點）」'), 'Onboarding should tell users to export only Maps (your places)');
assert.ok(app.includes('不要勾上方的「地圖」'), 'Onboarding should warn users not to export the broader Maps item');
assert.ok(app.includes('評論.json') && app.includes('已儲存的地點.json'), 'Onboarding should name the import files users need');
assert.ok(app.includes('可直接用 Takeout .zip'), 'Onboarding should tell users they can import the Takeout zip directly');
assert.ok(app.includes('今晚吃哪間？先讓命運幫你縮小選擇'), 'Onboarding should frame the first run around the dinner decision');
assert.ok(app.includes('開始選今晚吃什麼'), 'Onboarding should offer a natural guided action');
assert.ok(!app.includes('先試玩 30 秒'), 'Onboarding should not make the demo framing feel forced');
assert.ok(!app.includes('決定要不要匯入'), 'Onboarding should not over-explain the import decision');
assert.ok(app.includes("guideStep === 'explore'"), 'Guided demo should start by sending users to Explore');
assert.ok(app.includes("guideStep === 'dice'"), 'Guided demo should continue to Dice');
assert.ok(app.includes("guideStep === 'import'"), 'Guided demo should ask about import only after trying the randomizer');
assert.ok(app.includes('pwa-update-available'), 'App should listen for PWA update notifications');
assert.ok(app.includes('有新版可以更新'), 'App should show an update prompt when a new version is ready');
assert.ok(app.includes('已匯入餐廳和紀錄會保留'), 'Update prompt should reassure users that local imported data remains available');
assert.ok(app.includes('window.applyPWAUpdate'), 'Update prompt should call the service worker update action');
assert.ok(app.includes('手動更新最新版本'), 'Settings should include a manual latest-version refresh action');
assert.ok(app.includes('window.forcePWARefresh'), 'Manual refresh action should call the force PWA refresh helper');
assert.ok(app.includes('不會清除已匯入餐廳與紀錄'), 'Manual refresh copy should promise imported data remains available');
assert.ok(app.includes('自行新增餐廳'), 'Settings should let users add a restaurant manually');
assert.ok(app.includes('window.ManualPlaceSheet'), 'Manual restaurant entry should open a dedicated sheet');
assert.ok(app.includes('開發者模式'), 'Settings should include developer mode');
assert.ok(app.includes('重設 App'), 'Developer mode should include a reset App action');
assert.ok(app.includes('store.resetAll()'), 'Reset App should return local state to the first-run defaults');
assert.ok(app.includes('第一次使用狀態'), 'Reset App should clearly describe the first-run testing state');
assert.ok(explore.includes("store.setSetting('cuisine'"), 'Explore cuisine filter should persist for randomizer scope');
assert.ok(explore.includes('先選一個範圍'), 'Explore should include a guided demo prompt for selecting scope');
assert.ok(explore.includes('用目前範圍去骰一次'), 'Explore guided prompt should send users to the randomizer');
assert.ok(dice.includes('showScopeHelp'), 'Dice page should show randomizer scope help behind a toggle');
assert.ok(dice.includes('請先到「探索」分頁選城市、距離或料理分類'), 'Dice scope help should point users back to Explore filters');
assert.ok(dice.includes('讓骰子抽三家'), 'Dice should include a guided prompt');
assert.ok(dice.includes('換成我的 Google Maps 餐廳'), 'Dice result should offer import only after the guided result');
assert.ok(!dice.includes('試玩完成'), 'Dice result should not use forced demo wording');
assert.ok(!dice.includes("store.setSetting('city'"), 'Dice page should not own the city filter');
assert.ok(importSheet.includes('multiple: true'), 'Google Maps import input should allow selecting saved places and reviews together');
assert.ok(importSheet.includes('.zip,application/zip'), 'Google Maps import input should accept Takeout zip archives');
assert.ok(importSheet.includes('readZipJsonFiles'), 'Import flow should read JSON files inside Takeout zip archives');
assert.ok(importSheet.includes("href: 'https://takeout.google.com'"), 'Import sheet should make Google Takeout a direct external link');
assert.ok(importSheet.includes('showImportHelp'), 'Import safety notice should be hidden behind the help toggle');
assert.ok(importSheet.includes('查看安全說明'), 'Import sheet should expose safety details through an info button');
assert.ok(importSheet.includes("role: 'dialog'"), 'Import safety notice should open in a dialog-style popup');
assert.ok(importSheet.includes('關閉安全說明背景'), 'Import safety popup should include a backdrop close target');
assert.ok(importSheet.includes('onMouseDown'), 'Import safety popup backdrop should close on pointer down for reliable mobile dismissal');
assert.ok(importSheet.includes('event.stopPropagation()'), 'Import safety popup should stay open when clicking inside the dialog');
assert.ok(importSheet.includes('setShowImportHelp(false)'), 'Import safety popup should close when clicking outside or the close button');
assert.ok(importSheet.includes('匯出方式'), 'Import sheet should show Google export instructions directly before file selection');
assert.ok(importSheet.includes('地址、座標、日期、評論文字'), 'Safety notice should disclose location-adjacent and review data');
assert.ok(importSheet.includes('避免不必要的個人敏感資料疑慮'), 'Safety notice should use positive privacy guidance');
assert.ok(!importSheet.includes('可能含有額外個人資料'), 'Safety notice should not use overly alarming copy');
assert.ok(importSheet.includes('includeNonFood: true'), 'Import review should include excluded places so users can correct classifier mistakes');
assert.ok(importSheet.includes('showSkipped'), 'Import review should let users expand the excluded-place list');
assert.ok(importSheet.includes("r.source !== 'manual'"), 'Import diff should not offer to delete manually added restaurants');
assert.ok(manualSheet.includes('parseMapsUrl'), 'Manual restaurant sheet should try to parse common Google Maps URLs');
assert.ok(manualSheet.includes('先填店名就可以新增'), 'Manual restaurant sheet should require only a restaurant name');
assert.ok(manualSheet.includes('mapUrl: mapUrl.trim()'), 'Manual restaurant sheet should preserve the original Maps URL');
assert.ok(manualSheet.includes('不會在下次匯入 Google Maps 清單時被自動刪除'), 'Manual restaurant sheet should explain import deletion protection');
assert.ok(!html.includes('晚餐選擇</title>'));

const cacheMatch = sw.match(/const CACHE = '([^']+)'/);
assert.ok(cacheMatch);
assert.match(cacheMatch[1], /^dinner-by-destiny-v\d+$/);
assert.ok(agents.includes(cacheMatch[1]), 'AGENTS.md cache note should match sw.js CACHE');
assert.ok(!sw.includes('screens/Sheets.jsx'), 'service worker must not cache missing Sheets screen');
assert.ok(sw.includes('version.json'), 'service worker should cache the app version file');
assert.ok(sw.includes("type === 'SKIP_WAITING'"), 'service worker should still support the user-triggered update message');
const installStart = sw.indexOf("self.addEventListener('install'");
const messageStart = sw.indexOf("self.addEventListener('message'");
const installBlock = sw.slice(installStart, messageStart);
assert.ok(installBlock.includes('self.skipWaiting()'), 'service worker install should activate updated app shells without depending on stale UI');
assert.ok(sw.includes('self.clients.claim()'), 'activated service worker should claim existing clients so stale mobile shells reload');

const appShellBlock = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(appShellBlock);
const appShell = [...appShellBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.equal(new Set(appShell).size, appShell.length, 'APP_SHELL entries must be unique');
for (const file of appShell) {
  assert.ok(existsSync(file), `APP_SHELL file must exist: ${file}`);
  assert.ok(pagesArtifactScript.includes(`'${file}'`), `Pages artifact must include APP_SHELL file: ${file}`);
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
