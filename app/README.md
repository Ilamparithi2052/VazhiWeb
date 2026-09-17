# வழி (Vazhi) — heritage travel wiki

A long-form heritage travel blog & atlas. React 19 + Vite + Tailwind frontend; Hono + tRPC + Drizzle ORM (MySQL/TiDB) backend; deploys to **Vercel** (serverless) with **TiDB Cloud** as the database.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind 3.4, react-router v7 |
| API | Hono 4 + tRPC 11 (single serverless function: `api/index.ts`) |
| DB | Drizzle ORM + mysql2 (`mode: "planetscale"` — TiDB-compatible) |
| Auth | Email/password (scrypt) + Google sign-in + TOTP 2FA, JWT session cookie |
| Images | sharp (upload compression, OG cards), Wikimedia Commons free-image search |
| Extras | Weekly newsletter (Resend + Vercel Cron), RSS, sitemap, OG cards, analytics |

## Local development

```bash
npm install
cp .env.example .env   # fill in values (see below)
npm run dev            # http://localhost:3000
```

Production build & run locally:

```bash
npm run build          # vite build → dist/public + esbuild → dist/boot.js
npm start              # serves on PORT (default 3000)
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | MySQL/TiDB connection string, e.g. `mysql://USER:PASS@HOST:4000/vazhi?ssl={"rejectUnauthorized":true}` |
| `APP_SECRET` | ✅ | Any long random string — signs session JWTs (`openssl rand -hex 32`) |
| `APP_ID` | ✅* | Legacy platform var — set any placeholder (e.g. `vazhi`) |
| `KIMI_AUTH_URL` | ✅* | Legacy — set `https://unused.local` |
| `KIMI_OPEN_URL` | ✅* | Legacy — set `https://unused.local` |
| `GOOGLE_CLIENT_ID` | optional | Enables "Sign in with Google" (server-side verification) |
| `VITE_GOOGLE_CLIENT_ID` | optional | Same value — renders the Google button on /login |
| `SITE_BASE_URL` | optional | Canonical origin, e.g. `https://vazhi.net` (OG cards, RSS, newsletter) |
| `RESEND_API_KEY` | optional | Newsletter sending via Resend |
| `NEWSLETTER_FROM` | optional | e.g. `Vazhi Letters <letters@vazhi.net>` |
| `CRON_SECRET` | optional | Protects the weekly newsletter cron endpoint (Vercel sends it as a Bearer token) |

\* `APP_ID` / `KIMI_*` are still read at boot; placeholders are fine.

## First launch — create your admin account

1. Open `https://your-domain/login`.
2. With an empty users table you'll see **"Create the first admin"** — pick your name, email, password. This works exactly once.
3. After signing in you'll be offered **2FA setup**: scan the QR with Google Authenticator / Authy / 1Password. From then on, every login requires the 6-digit code.

## Deploy: GitHub → Vercel → TiDB (click-by-click)

### 1. Push to GitHub

```bash
git init            # if not already a repo
git add .
git commit -m "Vazhi — initial deploy"
# create an EMPTY repo on github.com (no README), then:
git remote add origin git@github.com:YOURUSER/vazhi.git
git branch -M main
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `dist`, `.env`, `.vercel`.

### 2. Create the TiDB database

1. Sign in at <https://tidbcloud.com> → **Create Cluster** → **Serverless** (free tier is fine).
2. Pick a region close to your Vercel region (e.g. AWS `ap-south-1` for Mumbai).
3. Once created: **Connect** → **Connect with: General** → copy the connection parameters.
4. Build the URL: `mysql://<user>:<password>@<host>:4000/vazhi?ssl={"rejectUnauthorized":true}`
   (create the database first: in the TiDB SQL editor or any MySQL client run `CREATE DATABASE vazhi;`)

### 3. Import into Vercel

1. <https://vercel.com/new> → **Import** your GitHub repo.
2. Vercel auto-detects the config from `vercel.json` (build command, output dir, cron) — don't override it in the UI.
3. **Environment Variables** — add everything from the table above (at minimum `DATABASE_URL`, `APP_SECRET`, and the three legacy placeholders).
4. **Deploy**.

That's it — every `git push` to `main` now rebuilds and redeploys automatically.

### 4. Create the tables (one time)

The app self-creates its auxiliary tables on boot, but the core schema is pushed with Drizzle:

```bash
# locally, with DATABASE_URL pointed at TiDB in .env
npx drizzle-kit push
```

Then open `https://your-app.vercel.app/login` and create the first admin.

## How GitHub ↔ Vercel ↔ TiDB stay in sync

There are two completely different "syncs" — it helps to keep them separate:

**Code (GitHub → Vercel): automatic.** Vercel watches the repo you imported. `git push` to `main` → production deploy; pushes to other branches / PRs → preview deployments. Nothing to configure. Roll back any time from the Vercel dashboard (Deployments → ⋯ → Redeploy).

**Data (TiDB): not synced — it's shared.** TiDB is a live database, not a deployed artifact. All environments (production, previews, your local dev) simply *connect* to it via `DATABASE_URL`. There is no GitHub↔TiDB link to set up; the only thing that ever changes in TiDB is the **schema** (`npx drizzle-kit push` after you edit `db/schema.ts`) and the **content** (written through the Studio UI at runtime).

Recommended setup:

| Environment | DATABASE_URL |
|---|---|
| Vercel Production | TiDB cluster → database `vazhi` |
| Vercel Preview + local dev | Same cluster → database `vazhi_dev` (create with `CREATE DATABASE vazhi_dev;`) |

Schema-change workflow when you edit `db/schema.ts`:

```bash
git push                       # code → Vercel redeploys
npx drizzle-kit push           # schema → TiDB (run once per database)
```

## Useful routes

- `/admin` — Studio (content, atlas, gallery, insights) — requires login
- `/rss.xml`, `/sitemap.xml`, `/robots.txt` — SEO
- `/og/:kind/:id.png` — generated social cards
- `/api/newsletter/run-weekly` — called by Vercel Cron every Sunday 09:00 IST (protected by `CRON_SECRET`)

## Newsletter cron

`vercel.json` registers a daily cron (`30 0 * * *` = 06:00 IST) — the per-subscriber no-repeat log in the DB means each reader only gets items they have not seen before. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` — set `CRON_SECRET` (and optionally the same value as `NEWSLETTER_CRON_SECRET`) in env vars. 
