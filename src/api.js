// Client for the IPPS API (server/app.mjs). All requests go to /api on the same site.
const TOKEN_KEY = 'ipps_admin_session';

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(TOKEN_KEY));
    return session && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (session) localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked (private mode); the session just won't survive a reload.
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body) {
  const headers = {};
  const session = getSession();
  if (session) headers.Authorization = `Bearer ${session.token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && session) onUnauthorized();
    throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  }
  return data;
}

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const api = {
  listPosts: (params = {}) => request('GET', `/posts${query(params)}`),
  getPost: (id) => request('GET', `/posts/${encodeURIComponent(id)}`),
  createPost: (post) => request('POST', '/posts', post),
  updatePost: (id, post) => request('PUT', `/posts/${encodeURIComponent(id)}`, post),
  deletePost: (id) => request('DELETE', `/posts/${encodeURIComponent(id)}`),
  categories: () => request('GET', '/categories'),
  uploadImage: (dataUrl) => request('POST', '/images', { data: dataUrl }),
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  me: () => request('GET', '/auth/me'),
};
