// Stateless admin sessions: an HMAC-signed token, so no session database is needed.
import crypto from 'node:crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret() {
  // A dedicated SESSION_SECRET is preferred; otherwise derive one from the password,
  // which also means changing the password logs everyone out.
  const base = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!base) throw new Error('ADMIN_PASSWORD is not configured');
  return crypto.createHash('sha256').update('ipps-session:' + base).digest();
}

const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function isConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;
  // Evaluate both comparisons so timing doesn't reveal which one failed.
  const userOk = safeEqual(username || '', expectedUser);
  const passOk = safeEqual(password || '', expectedPass);
  return userOk && passOk;
}

export function createToken(username) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function userFromRequest(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
