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

console.log('Theme helper tests passed.');
