// Run with: npm run test:api
// Articles added to server/seed/posts.json reach a store that already has data, once each.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

let tmp;
let seedDir;
let token;

// A fresh copy of the API, as after a new deploy (same store, new function instance).
let deploys = 0;
const deploy = async () => (await import(`./app.mjs?deploy=${++deploys}`)).handle;

const call = async (handle, method, url, auth) => {
  const headers = auth ? { Authorization: `Bearer ${auth}` } : {};
  const res = await handle(new Request(`http://localhost${url}`, { method, headers }));
  return { status: res.status, body: await res.json() };
};

const writeSeeds = (seeds) => writeFile(path.join(seedDir, 'posts.json'), JSON.stringify(seeds));

const STARTER = { id: 'rec4DeyzdD5xCHs5Y', title: 'Starter', content: 'Old article.', category: 'News', createdAt: '2025-03-05T16:43:00Z' };
const NEW_ONE = { id: 'trade-week-2026', title: 'Trade week', content: 'New article.', category: 'Trade', createdAt: '2026-11-06T10:00:00Z' };

before(async () => {
  tmp = await mkdtemp(path.join(os.tmpdir(), 'ipps-import-'));
  seedDir = path.join(tmp, 'seed');
  await mkdir(seedDir);
  Object.assign(process.env, {
    STORAGE: 'file',
    DATA_DIR: path.join(tmp, 'data'),
    SEED_DIR: seedDir,
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'test-password',
    SESSION_SECRET: 'test-secret',
  });
  // A store from before the import list existed: the starter article was copied in, then deleted.
  const { postsStore } = await import('./store.mjs');
  await (await postsStore()).setJSON('index', []);
});

after(() => rm(tmp, { recursive: true, force: true }));

test('new repo articles are added to an existing store, deleted starters stay deleted', async () => {
  await writeSeeds([STARTER, NEW_ONE]);
  const handle = await deploy();
  const list = await call(handle, 'GET', '/api/posts');
  assert.deepEqual(list.body.posts.map((p) => p.id), [NEW_ONE.id]);
  assert.equal(list.body.posts[0].publishedAt, '2026-11-06T10:00:00.000Z');
  assert.equal((await call(handle, 'GET', `/api/posts/${NEW_ONE.id}`)).status, 200);
});

test('an imported article deleted in the admin panel is not brought back by the next deploy', async () => {
  let handle = await deploy();
  const login = await handle(
    new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'test-password' }),
    })
  );
  token = (await login.json()).token;
  assert.equal((await call(handle, 'DELETE', `/api/posts/${NEW_ONE.id}`, token)).status, 200);

  const another = { ...NEW_ONE, id: 'second-article', title: 'Second' };
  await writeSeeds([STARTER, NEW_ONE, another]);
  handle = await deploy();
  const list = await call(handle, 'GET', '/api/posts');
  assert.deepEqual(list.body.posts.map((p) => p.id), ['second-article']);
});

test('opening a new article by its link works before any list request', async () => {
  const third = { ...NEW_ONE, id: 'third-article', title: 'Third' };
  await writeSeeds([STARTER, NEW_ONE, third]);
  const handle = await deploy();
  assert.equal((await call(handle, 'GET', '/api/posts/third-article')).status, 200);
});
