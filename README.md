# IPPS — Empowering Bangladesh Through Awareness

News site about intellectual property in Bangladesh, with an admin panel for managing articles.

- **Frontend:** React (Create React App), React Router, Chart.js
- **Backend:** one Netlify Function (`netlify/functions/api.mjs` → `server/app.mjs`) with
  **Netlify Blobs** for articles and images. Everything is on Netlify's free plan: no database
  account, no server to keep awake.

## Features

**Readers**
- Front page laid out like a newspaper: masthead, sticky section navigation, scrolling headlines
  ticker, lead story, top stories, latest news grid with "More stories", sidebar
- Section pages (`/category/<name>`) and search (`/search?q=`)
- Article pages with byline, reading time, image caption, related stories, and share buttons
  (Facebook, WhatsApp, X, copy link)
- Share previews on social media show the article's own title, summary and image
  (`netlify/edge-functions/article-meta.js`)
- **IP in Bangladesh** page with charts, IP offices and WIPO resources, and an **About Us** page
- Works on phones; Bangla text uses the Noto Bengali fonts

**Admin** (`/admin`, linked in the footer)
- Login checked by the server; sessions expire after 7 days
- Article list with counts, search, filter by status, one-click headline toggle, delete
- Editor: headline, optional summary, category (suggests existing ones), author, image upload
  (resized in the browser) with caption, formatting buttons, live preview, draft/publish,
  warning before leaving with unsaved changes, and unsaved text kept in the browser so it can be
  restored after a closed tab or expired login
- **Guide** (`/admin/guide`): a step-by-step tutorial for writers, with formatting examples

Article formatting: empty line = new paragraph, `## Heading`, `**bold**`, `> quote`,
`- list item`. Links starting with `https://` become clickable. HTML is shown as plain text,
never run, so articles can't inject scripts.

## Run locally

Requires Node 20+.

```bash
npm install
cp .env.example .env     # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev              # API on :8888 + site on http://localhost:3000
```

Locally, data is stored in `.data/` (git-ignored). On first start the store is filled with the
starter articles in `server/seed/`. Delete `.data/` to start over.

| Command | What it does |
|---|---|
| `npm run dev` | API server and React dev server together |
| `npm run server` | API only (port 8888) |
| `npm start` | React only (expects the API on 8888) |
| `npm test` | Frontend tests |
| `npm run test:api` | Backend tests |
| `npm run build` | Production build into `build/` |

## Deploy to Netlify (free)

1. Push this repo to GitHub and import it in Netlify (or keep your existing site connected).
   `netlify.toml` already sets the build command, Node 20, functions and redirects.
2. In **Site configuration → Environment variables**, add:
   - `ADMIN_USERNAME`: e.g. `admin`
   - `ADMIN_PASSWORD`: a long, unique password
   - `SESSION_SECRET`: a long random string (e.g. from `openssl rand -hex 32`)
3. Deploy. Netlify Blobs is enabled automatically. The first visit fills the empty store with
   the starter articles; after that, manage everything at `https://<your-site>/admin`.

## API

All under `/api`. Write routes need `Authorization: Bearer <token>` from the login route.

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{ username, password }` → `{ token, expiresAt }` |
| GET | `/auth/me` | Checks a token |
| GET | `/posts` | `?category=&q=&featured=1&limit=&offset=`; `status=all` (admin) includes drafts |
| GET | `/posts/:id` | Full article (drafts only for admin) |
| POST / PUT / DELETE | `/posts` / `/posts/:id` | Create, update (partial), delete |
| GET | `/categories` | Published categories with counts |
| POST | `/images` | `{ data: "<base64 or data URL>" }` → `{ url }`; JPEG/PNG/WebP/GIF, max 4MB |
| GET | `/images/:id` | Image file, cached long-term |
