import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 4197;
const server = spawn(process.execPath, ['scripts/serve-static.mjs'], {
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';
server.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
server.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

async function waitForServer() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`http://localhost:${port}/index.html`);
      if (response.status === 200) return;
    } catch (e) {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Static server did not start. stdout=${stdout} stderr=${stderr}`);
}

try {
  await waitForServer();

  const home = await fetch(`http://localhost:${port}/`);
  assert.equal(home.status, 200);
  assert.ok(home.headers.get('content-type').includes('text/html'));
  assert.ok((await home.text()).includes('<title>今晚吃命</title>'));

  const manifest = await fetch(`http://localhost:${port}/manifest.webmanifest`);
  assert.equal(manifest.status, 200);
  assert.ok(manifest.headers.get('content-type').includes('application/manifest+json'));
  assert.equal((await manifest.json()).name, '今晚吃命');

  const jsx = await fetch(`http://localhost:${port}/App.jsx`);
  assert.equal(jsx.status, 200);
  assert.ok(jsx.headers.get('content-type').includes('text/javascript'));

  const missing = await fetch(`http://localhost:${port}/missing-file.js`);
  assert.equal(missing.status, 404);

  const traversal = await fetch(`http://localhost:${port}/..%2Fpackage.json`);
  assert.equal(traversal.status, 404);
} finally {
  server.kill();
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 1000);
    server.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

console.log('Static server tests passed.');
