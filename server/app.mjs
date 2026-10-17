// IPPS content API. Framework-free: takes a standard Web Request and returns a Response,
// so the same code runs as a Netlify Function and in the local dev server.
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { postsStore, imagesStore } from './store.mjs';
import { checkCredentials, createToken, isConfigured, userFromRequest } from './auth.mjs';

const INDEX_KEY = 'index';
const postKey = (id) => `post/${id}`;
const ID_PATTERN = /^[A-Za-z0-9_-]{3,40}$/;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/gif': (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  'image/webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

const newId = () => crypto.randomBytes(6).toString('hex');

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON');
  }
}

function requireAdmin(request) {
  const user = userFromRequest(request);
  if (!user) throw new HttpError(401, 'Please log in again');
  return user;
}

// ---------- posts ----------

// Article text without the formatting marks (## headings, **bold**, > quotes, - lists).
function plainText(content) {
  return content
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Summary for cards and share previews: the opening paragraphs, skipping sub-headings.
function makeExcerpt(content, max = 220) {
  const text = plainText(content.replace(/^#{1,3}\s+.*$/gm, '')) || plainText(content);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 120 ? cut.lastIndexOf(' ') : max).trim() + '…';
}

// Index entry for a post: everything except the full text, plus a lower-case plain-text copy
// so search can match words inside articles. `searchText` never leaves the server.
function summarize(post) {
  const { content, ...rest } = post;
  return { ...rest, searchText: plainText(content).toLowerCase().slice(0, 20000) };
}

const toPublic = ({ searchText, ...post }) => post;

const byNewest = (a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt);

function str(value, field, { required = false, max = 300 } = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} is required`);
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long (max ${max} characters)`);
  return trimmed;
}

function validatePost(body, existing) {
  const merged = { ...existing, ...body };
  const title = str(merged.title, 'Title', { required: true, max: 300 });
  const content = str(merged.content, 'Content', { required: true, max: 200000 });
  const category = str(merged.category, 'Category', { required: true, max: 60 });
  const author = str(merged.author, 'Author', { max: 100 });
  const imageCaption = str(merged.imageCaption, 'Image caption', { max: 300 });
  let excerpt = str(merged.excerpt, 'Summary', { max: 500 });
  const imageUrl = str(merged.imageUrl, 'Image', { max: 2000 });
  if (imageUrl && !/^\/api\/images\/[A-Za-z0-9_-]+$/.test(imageUrl) && !/^https?:\/\//i.test(imageUrl)) {
    throw new HttpError(400, 'Image must be an uploaded image or an http(s) URL');
  }
  const status = merged.status === 'draft' ? 'draft' : 'published';
  let publishedAt = merged.publishedAt || null;
  if (publishedAt && Number.isNaN(Date.parse(publishedAt))) throw new HttpError(400, 'Invalid publish date');
  if (publishedAt) publishedAt = new Date(publishedAt).toISOString();
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();

  const autoExcerpt = !excerpt;
  if (autoExcerpt) excerpt = makeExcerpt(content);
  const words = plainText(content).split(' ').filter(Boolean).length;

  return {
    title,
    content,
    category,
    author,
    excerpt,
    autoExcerpt,
    imageUrl,
    imageCaption,
    featured: Boolean(merged.featured),
    status,
    publishedAt,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

async function loadIndex() {
  const store = await postsStore();
  const index = await store.getJSON(INDEX_KEY);
  // A missing index means a brand-new store; an empty array means every post was deleted.
  if (index === null) return seedStore();
  // Indexes saved before search covered article text: add it once.
  if (index.some((p) => p.searchText === undefined)) {
    const filled = await Promise.all(
      index.map(async (entry) => {
        if (entry.searchText !== undefined) return entry;
        const post = await store.getJSON(postKey(entry.id));
        return post ? summarize(post) : { ...entry, searchText: '' };
      })
    );
    await saveIndex(filled);
    return filled;
  }
  return index;
}

function seedDir() {
  const candidates = [process.env.LAMBDA_TASK_ROOT, process.cwd()]
    .filter(Boolean)
    .map((root) => path.join(root, 'server', 'seed'));
  return candidates.find((dir) => existsSync(path.join(dir, 'posts.json')));
}

// Fills a new, empty store with the starter articles in server/seed/.
// Article ids are kept so old share links (/article/<id>) keep working.
async function seedStore() {
  const dir = seedDir();
  const index = [];
  if (dir) {
    const store = await postsStore();
    const images = await imagesStore();
    const seeds = JSON.parse(await readFile(path.join(dir, 'posts.json'), 'utf8'));
    for (const seed of seeds) {
      let imageUrl = '';
      if (seed.image) {
        const imageId = seed.id.toLowerCase();
        await images.setBinary(imageId, await readFile(path.join(dir, 'images', seed.image)), { contentType: 'image/jpeg' });
        imageUrl = `/api/images/${imageId}`;
      }
      const post = {
        id: seed.id,
        ...validatePost({ ...seed, imageUrl, publishedAt: seed.createdAt }, {}),
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      };
      await store.setJSON(postKey(post.id), post);
      index.push(summarize(post));
    }
  }
  await saveIndex(index);
  return index;
}

async function saveIndex(index) {
  const store = await postsStore();
  await store.setJSON(INDEX_KEY, index.sort(byNewest));
}

async function deleteImageIfUnused(imageUrl, index) {
  const match = /^\/api\/images\/([A-Za-z0-9_-]+)$/.exec(imageUrl || '');
  if (!match || index.some((p) => p.imageUrl === imageUrl)) return;
  const images = await imagesStore();
  await images.delete(match[1]);
}

async function listPosts(request, url) {
  const isAdmin = Boolean(userFromRequest(request));
  const params = url.searchParams;
  const wantAll = params.get('status') === 'all';
  if (wantAll && !isAdmin) throw new HttpError(401, 'Please log in again');

  let posts = await loadIndex();
  if (!wantAll) posts = posts.filter((p) => p.status === 'published');

  const category = params.get('category');
  if (category) posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (params.get('featured') === '1') posts = posts.filter((p) => p.featured);
  const exclude = params.get('exclude');
  if (exclude) posts = posts.filter((p) => p.id !== exclude);
  const q = (params.get('q') || '').trim().toLowerCase();
  if (q) {
    posts = posts.filter((p) =>
      [p.title, p.excerpt, p.category, p.author, p.searchText].some((field) => (field || '').toLowerCase().includes(q))
    );
  }

  const total = posts.length;
  const limit = Math.min(Math.max(parseInt(params.get('limit'), 10) || 20, 1), 100);
  const offset = Math.max(parseInt(params.get('offset'), 10) || 0, 0);
  return json(200, { posts: posts.slice(offset, offset + limit).map(toPublic), total, limit, offset });
}

async function listCategories() {
  const counts = new Map();
  for (const p of await loadIndex()) {
    if (p.status !== 'published') continue;
    counts.set(p.category, (counts.get(p.category) || 0) + 1);
  }
  const categories = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return json(200, { categories });
}

async function getPost(request, id) {
  const store = await postsStore();
  if (!ID_PATTERN.test(id)) throw new HttpError(404, 'Article not found');
  let post = await store.getJSON(postKey(id));
  if (!post && (await store.getJSON(INDEX_KEY)) === null) {
    await loadIndex(); // first request on a new store: seed, then look again
    post = await store.getJSON(postKey(id));
  }
  if (!post || (post.status !== 'published' && !userFromRequest(request))) {
    throw new HttpError(404, 'Article not found');
  }
  return json(200, { post });
}

async function createPost(request) {
  requireAdmin(request);
  const body = await readBody(request);
  const store = await postsStore();
  const index = await loadIndex();

  const id = newId();
  const now = new Date().toISOString();
  const post = { id, ...validatePost(body, {}), createdAt: now, updatedAt: now };
  await store.setJSON(postKey(id), post);
  index.push(summarize(post));
  await saveIndex(index);
  return json(201, { post });
}

async function updatePost(request, id) {
  requireAdmin(request);
  const body = await readBody(request);
  const store = await postsStore();
  const existing = ID_PATTERN.test(id) ? await store.getJSON(postKey(id)) : null;
  if (!existing) throw new HttpError(404, 'Article not found');

  const base = existing.autoExcerpt && body.excerpt === undefined ? { ...existing, excerpt: '' } : existing;
  const post = { ...existing, ...validatePost(body, base), id, updatedAt: new Date().toISOString() };
  await store.setJSON(postKey(id), post);

  const index = (await loadIndex()).filter((p) => p.id !== id);
  index.push(summarize(post));
  await saveIndex(index);
  if (existing.imageUrl !== post.imageUrl) await deleteImageIfUnused(existing.imageUrl, index);
  return json(200, { post });
}

async function deletePost(request, id) {
  requireAdmin(request);
  const store = await postsStore();
  const index = await loadIndex();
  const existing = index.find((p) => p.id === id);
  if (!existing) throw new HttpError(404, 'Article not found');

  const remaining = index.filter((p) => p.id !== id);
  await saveIndex(remaining);
  await store.delete(postKey(id));
  await deleteImageIfUnused(existing.imageUrl, remaining);
  return json(200, { ok: true });
}

// ---------- images ----------

async function uploadImage(request) {
  requireAdmin(request);
  const body = await readBody(request);
  if (typeof body.data !== 'string') throw new HttpError(400, 'Image data is missing');
  const base64 = body.data.replace(/^data:[^;]+;base64,/, '');
  const bytes = Buffer.from(base64, 'base64');
  if (!bytes.length) throw new HttpError(400, 'Image data is empty');
  if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Image is larger than 4MB');

  const contentType = Object.keys(IMAGE_TYPES).find((type) => IMAGE_TYPES[type](bytes));
  if (!contentType) throw new HttpError(400, 'Only JPEG, PNG, WebP or GIF images are supported');

  const id = newId();
  const images = await imagesStore();
  await images.setBinary(id, bytes, { contentType, uploadedAt: new Date().toISOString() });
  return json(201, { id, url: `/api/images/${id}` });
}

async function getImage(id) {
  if (!ID_PATTERN.test(id)) throw new HttpError(404, 'Image not found');
  const images = await imagesStore();
  const entry = await images.getBinary(id);
  if (!entry) throw new HttpError(404, 'Image not found');
  return new Response(entry.data, {
    status: 200,
    headers: {
      'Content-Type': entry.metadata?.contentType || 'application/octet-stream',
      // Image ids are never reused, so browsers and the CDN can cache them forever.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

// ---------- auth ----------

async function login(request) {
  if (!isConfigured()) throw new HttpError(503, 'Admin login is not set up: ADMIN_PASSWORD is missing on the server');
  const body = await readBody(request);
  if (!checkCredentials(body.username, body.password)) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // slow down password guessing
    throw new HttpError(401, 'Invalid username or password');
  }
  return json(200, createToken(body.username));
}

// ---------- router ----------

export async function handle(request) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const method = request.method.toUpperCase();
  const [resource, id, extra] = parts;

  try {
    if (extra !== undefined) throw new HttpError(404, 'Not found');

    if (resource === 'health' && method === 'GET') return json(200, { ok: true, adminConfigured: isConfigured() });

    if (resource === 'auth' && id === 'login' && method === 'POST') return await login(request);
    if (resource === 'auth' && id === 'me' && method === 'GET') return json(200, { user: requireAdmin(request).u });

    if (resource === 'categories' && !id && method === 'GET') return await listCategories();

    if (resource === 'posts' && !id) {
      if (method === 'GET') return await listPosts(request, url);
      if (method === 'POST') return await createPost(request);
    }
    if (resource === 'posts' && id) {
      if (method === 'GET') return await getPost(request, id);
      if (method === 'PUT') return await updatePost(request, id);
      if (method === 'DELETE') return await deletePost(request, id);
    }

    if (resource === 'images' && !id && method === 'POST') return await uploadImage(request);
    if (resource === 'images' && id && method === 'GET') return await getImage(id);

    throw new HttpError(404, 'Not found');
  } catch (err) {
    if (err instanceof HttpError) return json(err.status, { error: err.message });
    console.error('[api] unexpected error', err);
    return json(500, { error: 'Something went wrong on the server' });
  }
}
