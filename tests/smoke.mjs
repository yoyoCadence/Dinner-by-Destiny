import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'data.js',
  'theme.js',
  'import-util.js',
  'store.jsx',
  'icons.jsx',
  'bits.jsx',
  'App.jsx',
  'screens/Explore.jsx',
  'screens/Dice.jsx',
  'screens/Diary.jsx',
  'screens/Stats.jsx',
  'screens/Group.jsx',
  'screens/ImportSheet.jsx',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const html = readFileSync('index.html', 'utf8');
for (const file of requiredFiles.filter((file) => /\.(js|jsx|webmanifest)$/.test(file))) {
  if (file !== 'index.html' && !html.includes(file) && file !== 'sw.js') {
    throw new Error(`index.html does not reference ${file}`);
  }
}

const sw = readFileSync('sw.js', 'utf8');
const appShellBlock = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
if (!appShellBlock) throw new Error('Service worker APP_SHELL list was not found');
const shellMatches = [...appShellBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
for (const file of shellMatches.filter((file) => !file.startsWith('http'))) {
  if (!existsSync(file)) throw new Error(`Service worker caches missing file: ${file}`);
}

const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
if (manifest.name !== '今晚吃命') throw new Error('Manifest app name is not 今晚吃命');
if (manifest.display !== 'standalone') throw new Error('Manifest display must be standalone');

console.log('Smoke checks passed.');
