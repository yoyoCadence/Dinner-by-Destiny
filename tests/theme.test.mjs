import assert from 'node:assert/strict';
import { createStyleRecorder, loadBrowserFiles } from './helpers/browser-env.mjs';

const { openedUrls, window } = loadBrowserFiles(['data.js', 'theme.js']);

const style = createStyleRecorder();
window.applyTheme({ style }, 'dark');
assert.equal(style.getPropertyValue('--bg'), '#0E0D14');
assert.equal(style.getPropertyValue('--accent'), '#16E0C2');

const fallbackStyle = createStyleRecorder();
window.applyTheme({ style: fallbackStyle }, 'missing-theme');
assert.equal(fallbackStyle.getPropertyValue('--bg'), window.THEMES.warm.vars['--bg']);

assert.equal(window.fmtDist(240), '240 m');
assert.equal(window.fmtDist(1400), '1.4 km');
assert.equal(window.priceStr(3), '$$$');
assert.equal(window.cuisineOf('noodle').label, '麵食');
assert.equal(window.cuisineOf('not-real').label, 'not-real');
assert.equal(window.cuisineOf('not-real').emoji, '🍽️');

const samePoint = window.distM(window.HOME_LOC, window.HOME_LOC);
assert.ok(samePoint < 1);
const nearby = window.distM(window.HOME_LOC, { lat: window.HOME_LOC.lat + 0.01, lng: window.HOME_LOC.lng });
assert.ok(nearby > 1000 && nearby < 1200);
assert.equal(window.walkMin(160), 2);

window.openMaps({ name: '命運牛肉麵', city: '台北' });
assert.equal(openedUrls.length, 1);
assert.equal(openedUrls[0].target, '_blank');
assert.ok(openedUrls[0].url.startsWith('https://www.google.com/maps/search/?api=1&query='));
assert.ok(openedUrls[0].url.includes(encodeURIComponent('命運牛肉麵 台北')));

assert.match(window.todayStr(), /^\d{4}-\d{2}-\d{2}$/);
assert.equal(window.fmtAgo(window.todayStr()), '今天');

// 輔助：N 天前的日期字串
function daysAgoStr(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

// daysAgo
assert.equal(window.daysAgo(''), 999, 'empty string → 999');
assert.equal(window.daysAgo(null), 999, 'null → 999');
assert.equal(window.daysAgo(window.todayStr()), 0, 'today → 0');
assert.equal(window.daysAgo(daysAgoStr(1)), 1, '1 day ago → 1');
assert.equal(window.daysAgo(daysAgoStr(10)), 10, '10 days ago → 10');

// fmtAgo — 歷史日期
assert.equal(window.fmtAgo(daysAgoStr(1)), '昨天');
assert.equal(window.fmtAgo(daysAgoStr(3)), '3 天前');
assert.equal(window.fmtAgo(daysAgoStr(8)), '1 週前');
assert.equal(window.fmtAgo(daysAgoStr(35)), '1 個月前');

console.log('Theme helper tests passed.');
