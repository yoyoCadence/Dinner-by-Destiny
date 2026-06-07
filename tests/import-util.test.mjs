import assert from 'node:assert/strict';
import { loadBrowserFiles } from './helpers/browser-env.mjs';
import { placeFeature, sanitizedFeatureCollection } from './fixtures/google-maps-sanitized.mjs';

const { window } = loadBrowserFiles(['import-util.js']);
const gm = window.GMImport;

assert.equal(gm.guessCuisine('命運牛肉麵'), 'noodle');
assert.equal(gm.guessCuisine('今晚火鍋局'), 'hotpot');
assert.equal(gm.guessCuisine('抽卡壽司'), 'japanese');
assert.equal(gm.guessCuisine('骰子便當'), 'taiwanese');
assert.equal(gm.guessCuisine('早餐蛋餅'), 'breakfast');
assert.equal(gm.guessCuisine('神祕選物店'), 'unknown');

assert.equal(gm.cleanName('命運牛肉麵｜分店備註'), '命運牛肉麵');
assert.equal(gm.cleanName('抽卡壽司（臨時店）'), '抽卡壽司');
assert.equal(gm.cleanName('骰子便當(test)'), '骰子便當');

assert.equal(gm.cityFromAddr('100台灣臺北市中正區測試路 1 號'), '台北');
assert.equal(gm.cityFromAddr('400台灣臺中市中區測試路 2 號'), '台中');
assert.equal(gm.cityFromAddr('Unknown address'), '其他');

assert.equal(gm.priceFromQuestions([{ question: '平均每人消費金額', selected_option: '$1–200' }]), 1);
assert.equal(gm.priceFromQuestions([{ question: '平均每人消費金額', selected_option: '$200–400' }]), 2);
assert.equal(gm.priceFromQuestions([{ question: '平均每人消費金額', selected_option: '$600 以上' }]), 3);
assert.equal(gm.priceFromQuestions([{ question: '其他問題', selected_option: '$600 以上' }]), 0);

assert.equal(gm.eatCountFromText('吃三次了'), 3);
assert.equal(gm.eatCountFromText('吃 12 次'), 12);
assert.equal(gm.eatCountFromText('好幾次都點同一個'), 4);
assert.equal(gm.eatCountFromText('第一次來'), 1);
assert.equal(gm.eatCountFromText('沒有提到次數'), 0);

assert.equal(gm.classifyPlace('測試停車場', {}), 'skip');
assert.equal(gm.classifyPlace('測試公園', {}), 'skip');
assert.equal(gm.classifyPlace('命運牛肉麵', {}), 'food');
assert.equal(gm.classifyPlace('無名空間', { questions: [{ question: '平均每人消費', selected_option: '$200' }] }), 'food');
assert.equal(gm.classifyPlace('神祕選物店', {}), 'maybe');

const parsed = gm.parseGeoJSON(sanitizedFeatureCollection);
assert.equal(parsed.length, 2, 'food and maybe rows should import; skip, zero-coordinate, missing-name, duplicate rows should not');

const noodle = parsed.find((r) => r.name === '命運牛肉麵');
assert.ok(noodle);
assert.equal(noodle.cuisine, 'noodle');
assert.equal(noodle.confidence, 'food');
assert.equal(noodle.price, 2);
assert.equal(noodle.rating, 4);
assert.equal(noodle.lat, 25.04);
assert.equal(noodle.lng, 121.5);
assert.equal(noodle.city, '台北');
assert.equal(noodle.eatCount, 3);
assert.equal(noodle.lastEaten, '2026-06-05');
assert.equal(noodle.blurb, '吃三次，湯很暖。');
assert.equal(noodle.reviewText, '吃三次，湯很暖。\n第二行完整評論也要保留，不能只剩摘要。');
assert.equal(noodle.mapUrl, 'https://maps.google.com/?cid=noodle');
assert.equal(noodle.importReason, '有平均消費問卷');

const maybe = parsed.find((r) => r.name === '神祕選物店');
assert.ok(maybe);
assert.equal(maybe.confidence, 'maybe');
assert.equal(maybe.cuisine, 'unknown');
assert.equal(maybe.city, '新北');

const withSkipped = gm.parseGeoJSON({
  type: 'FeatureCollection',
  features: [placeFeature({ name: '測試停車場' })],
}, { includeNonFood: true });
assert.equal(withSkipped.length, 1);
assert.equal(withSkipped[0].confidence, 'skip');
assert.equal(withSkipped[0].importReason, '命中停車、醫院、門市等硬排除字');

const sameNameBranches = gm.parseGeoJSON({
  type: 'FeatureCollection',
  features: [
    placeFeature({ name: '命運牛肉麵', address: '100台灣台北市中正區一號店' }),
    placeFeature({ name: '命運牛肉麵', address: '220台灣新北市板橋區二號店' }),
  ],
});
assert.equal(sameNameBranches.length, 2, 'same-name places at different addresses should both import');
assert.notEqual(sameNameBranches[0].id, sameNameBranches[1].id);

const mergedLists = gm.mergeRestaurantLists([
  [{ id: 'same-place', name: '同一家', cuisine: 'unknown', confidence: 'maybe', price: 1, rating: 0, eatCount: 0, lastEaten: '', tags: ['saved'], blurb: '' }],
  [{ id: 'same-place', name: '同一家', cuisine: 'noodle', confidence: 'food', price: 2, rating: 5, eatCount: 3, lastEaten: '2026-06-01', tags: ['review'], blurb: '有評論摘要', reviewText: '完整評論文字', mapUrl: 'https://maps.google.com/?cid=same' }],
]);
assert.equal(mergedLists.length, 1, 'multi-file import should merge duplicate places');
assert.equal(mergedLists[0].confidence, 'food');
assert.equal(mergedLists[0].cuisine, 'noodle');
assert.equal(mergedLists[0].rating, 5);
assert.equal(mergedLists[0].eatCount, 3);
assert.equal(mergedLists[0].reviewText, '完整評論文字');
assert.equal(mergedLists[0].mapUrl, 'https://maps.google.com/?cid=same');
assert.equal(JSON.stringify(mergedLists[0].tags.sort()), JSON.stringify(['review', 'saved']));

assert.equal(gm.parseGeoJSON(null).length, 0);
assert.equal(gm.parseGeoJSON({ type: 'FeatureCollection', features: [] }).length, 0);

console.log('Import util tests passed.');
