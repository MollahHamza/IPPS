// Local API server for development: `npm run server` (or `npm run dev` for API + site together).
// Serves the same handler as the Netlify Function, storing data in .data/ instead of Netlify Blobs.
import http from 'node:http';
import { readFileSync } from 'node:fs';

function loadEnvFile(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

loadEnvFile('.env');
process.env.STORAGE = process.env.STORAGE || 'file';

const { handle } = await import('./app.mjs');
const port = Number(process.env.API_PORT) || 8888;
const MAX_BODY = 6 * 1024 * 1024; // same request limit as Netlify Functions

const server = http.createServer(async (req, res) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      res.writeHead(413, { 'Content-Type': 'application/json' }).end('{"error":"Request too large"}');
      return;
    }
    chunks.push(chunk);
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value !== undefined) headers.set(key, value);
  }
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const request = new Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });

  const response = await handle(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(port, () => {
  console.log(`IPPS API running at http://localhost:${port}/api (data folder: .data/)`);
  if (!process.env.ADMIN_PASSWORD) console.warn('Warning: ADMIN_PASSWORD is not set in .env, so admin login is disabled.');
});
