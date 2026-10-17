// Storage adapter.
// On Netlify it uses Netlify Blobs (free, no external database needed).
// Locally (STORAGE=file) it writes to the .data/ folder so the API can run without Netlify.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const POSTS_STORE = 'ipps-posts';
const IMAGES_STORE = 'ipps-images';

function fileStore(name) {
  const root = path.resolve(process.env.DATA_DIR || '.data', name);
  const fileFor = (key) => path.join(root, encodeURIComponent(key));

  return {
    async getJSON(key) {
      try {
        return JSON.parse(await fs.readFile(fileFor(key), 'utf8'));
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
      }
    },
    async setJSON(key, value) {
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(fileFor(key), JSON.stringify(value));
    },
    async getBinary(key) {
      try {
        const [data, meta] = await Promise.all([
          fs.readFile(fileFor(key)),
          fs.readFile(fileFor(key) + '.meta', 'utf8'),
        ]);
        return { data, metadata: JSON.parse(meta) };
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
      }
    },
    async setBinary(key, data, metadata) {
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(fileFor(key), Buffer.from(data));
      await fs.writeFile(fileFor(key) + '.meta', JSON.stringify(metadata));
    },
    async delete(key) {
      await fs.rm(fileFor(key), { force: true });
      await fs.rm(fileFor(key) + '.meta', { force: true });
    },
  };
}

async function blobStore(name) {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name, consistency: 'strong' });

  return {
    getJSON: (key) => store.get(key, { type: 'json' }),
    setJSON: (key, value) => store.setJSON(key, value),
    async getBinary(key) {
      const entry = await store.getWithMetadata(key, { type: 'arrayBuffer' });
      return entry ? { data: entry.data, metadata: entry.metadata } : null;
    },
    setBinary: (key, data, metadata) => store.set(key, data, { metadata }),
    delete: (key) => store.delete(key),
  };
}

const cache = new Map();

function open(name) {
  if (!cache.has(name)) {
    cache.set(name, process.env.STORAGE === 'file' ? Promise.resolve(fileStore(name)) : blobStore(name));
  }
  return cache.get(name);
}

export const postsStore = () => open(POSTS_STORE);
export const imagesStore = () => open(IMAGES_STORE);
