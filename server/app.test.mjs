// Run with: npm run test:api
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

let handle;
let dataDir;
let token;

const call = async (method, url, body, auth = token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const res = await handle(
    new Request(`http://localhost${url}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  );
  const type = res.headers.get('content-type') || '';
  return { status: res.status, body: type.includes('json') ? await res.json() : await res.arrayBuffer(), res };
};

// Smallest valid PNG (1x1 pixel)
const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

before(async () => {
  dataDir = await mkdtemp(path.join(os.tmpdir(), 'ipps-test-'));
  Object.assign(process.env, {
    STORAGE: 'file',
    DATA_DIR: dataDir,
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'test-password',
    SESSION_SECRET: 'test-secret',
  });
  ({ handle } = await import('./app.mjs'));
});

after(() => rm(dataDir, { recursive: true, force: true }));

test('a new store is seeded with the starter articles', async () => {
  const { status, body } = await call('GET', '/api/posts', null, null);
  assert.equal(status, 200);
  assert.ok(body.total >= 1);
  const withImage = body.posts.find((p) => p.imageUrl);
  assert.ok(withImage, 'seed articles keep their images');
  const image = await call('GET', withImage.imageUrl, null, null);
  assert.equal(image.status, 200);
  assert.equal(image.res.headers.get('content-type'), 'image/jpeg');
  assert.ok(body.posts.every((p) => p.content === undefined), 'list responses leave out the full text');
});

test('login rejects wrong passwords and accepts the right one', async () => {
  const bad = await call('POST', '/api/auth/login', { username: 'admin', password: 'nope' }, null);
  assert.equal(bad.status, 401);
  const good = await call('POST', '/api/auth/login', { username: 'admin', password: 'test-password' }, null);
  assert.equal(good.status, 200);
  token = good.body.token;
  assert.equal((await call('GET', '/api/auth/me')).status, 200);
  assert.equal((await call('GET', '/api/auth/me', null, token + 'x')).status, 401);
});

test('writing requires a valid login', async () => {
  const res = await call('POST', '/api/posts', { title: 't', content: 'c', category: 'x' }, null);
  assert.equal(res.status, 401);
  assert.equal((await call('POST', '/api/images', { data: PNG }, null)).status, 401);
});

test('create, read, update and delete an article', async () => {
  const created = await call('POST', '/api/posts', {
    title: '  Patent reform  ',
    content: '## Background\nFirst paragraph with <script>alert(1)</script> text.\n\nSecond paragraph.',
    category: 'Policy',
    featured: true,
  });
  assert.equal(created.status, 201);
  const { id } = created.body.post;
  assert.equal(created.body.post.title, 'Patent reform');
  assert.ok(created.body.post.excerpt.startsWith('First paragraph'));
  assert.ok(created.body.post.publishedAt);

  const read = await call('GET', `/api/posts/${id}`, null, null);
  assert.equal(read.status, 200);

  const updated = await call('PUT', `/api/posts/${id}`, { content: 'Brand new text.', excerpt: '' });
  assert.equal(updated.body.post.excerpt, 'Brand new text.');
  assert.equal(updated.body.post.title, 'Patent reform');

  const cats = await call('GET', '/api/categories', null, null);
  assert.ok(cats.body.categories.some((c) => c.name === 'Policy'));

  assert.equal((await call('DELETE', `/api/posts/${id}`)).status, 200);
  assert.equal((await call('GET', `/api/posts/${id}`, null, null)).status, 404);
});

test('drafts are hidden from the public', async () => {
  const draft = await call('POST', '/api/posts', { title: 'Draft', content: 'x', category: 'Policy', status: 'draft' });
  const { id } = draft.body.post;
  assert.equal((await call('GET', `/api/posts/${id}`, null, null)).status, 404);
  assert.equal((await call('GET', `/api/posts/${id}`)).status, 200);
  const publicList = await call('GET', '/api/posts', null, null);
  assert.ok(!publicList.body.posts.some((p) => p.id === id));
  assert.equal((await call('GET', '/api/posts?status=all', null, null)).status, 401);
  const adminList = await call('GET', '/api/posts?status=all');
  assert.ok(adminList.body.posts.some((p) => p.id === id));
});

test('automatic summaries leave out formatting marks and sub-headings', async () => {
  const content = '## Intro\n\nFirst paragraph with **bold**.\n\n> A quote\n\n- one\n- two';
  const res = await call('POST', '/api/posts', { title: 'Marks', content, category: 'Policy', status: 'draft' });
  assert.equal(res.body.post.excerpt, 'First paragraph with bold. A quote one two');
  await call('DELETE', `/api/posts/${res.body.post.id}`);
});

test('search matches words inside the article text, without sending that text', async () => {
  const res = await call('POST', '/api/posts', { title: 'Plain title', content: 'Mentions the Zanzibar treaty deep inside.', category: 'Policy' });
  const found = await call('GET', '/api/posts?q=zanzibar', null, null);
  assert.deepEqual(found.body.posts.map((p) => p.id), [res.body.post.id]);
  assert.equal(found.body.posts[0].searchText, undefined);
  await call('DELETE', `/api/posts/${res.body.post.id}`);
});

test('validation errors are reported clearly', async () => {
  const res = await call('POST', '/api/posts', { title: '', content: 'x', category: 'y' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Title is required/);
  const badImage = await call('POST', '/api/posts', { title: 't', content: 'x', category: 'y', imageUrl: 'javascript:alert(1)' });
  assert.equal(badImage.status, 400);
});

test('image upload checks the file type and cleans up replaced images', async () => {
  const notImage = await call('POST', '/api/images', { data: Buffer.from('hello').toString('base64') });
  assert.equal(notImage.status, 400);

  const up = await call('POST', '/api/images', { data: `data:image/png;base64,${PNG}` });
  assert.equal(up.status, 201);
  const img = await call('GET', up.body.url, null, null);
  assert.equal(img.res.headers.get('content-type'), 'image/png');

  const post = await call('POST', '/api/posts', { title: 'Pic', content: 'x', category: 'y', imageUrl: up.body.url });
  await call('PUT', `/api/posts/${post.body.post.id}`, { imageUrl: '' });
  assert.equal((await call('GET', up.body.url, null, null)).status, 404, 'old image deleted once unused');
});

test('unknown routes return 404 JSON', async () => {
  const res = await call('GET', '/api/nothing', null, null);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});
