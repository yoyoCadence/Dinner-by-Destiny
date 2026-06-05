import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outDir = 'dist';
const files = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'data.js',
  'theme.js',
  'import-util.js',
  'tweaks-panel.jsx',
  'store.jsx',
  'icons.jsx',
  'bits.jsx',
  'App.jsx',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'screens/Explore.jsx',
  'screens/Dice.jsx',
  'screens/Diary.jsx',
  'screens/Stats.jsx',
  'screens/Group.jsx',
  'screens/ImportSheet.jsx',
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of files) {
  const target = join(outDir, file);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
}

writeFileSync(join(outDir, '.nojekyll'), '');
console.log(`Prepared GitHub Pages artifact in ${outDir}`);
