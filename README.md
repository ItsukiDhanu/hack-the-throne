# Hack The Throne — Next.js + Tailwind + Redis/KV

Next.js 14 App Router site for the AIT CSE hackathon. Registrations are stored in Redis or Vercel KV; content is editable via an admin JSON editor. A lightweight admin page lists registrations and exports CSV.

## Quick start
1) Install deps: `npm install`
2) Copy env template: `cp .env.example .env.local` and fill in either Vercel KV _or_ `REDIS_URL`, plus `ADMIN_TOKEN`.
3) Dev server: `npm run dev`
4) Seed demo content (optional, requires Redis/KV): `npm run seed`
5) Lint: `npm run lint`
6) Deploy on Vercel: `npx vercel --prod`

## Environment
Use one storage backend:
- **Vercel KV**: set `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`
- **Redis URL**: set `REDIS_URL` (e.g., `redis://default:<pass>@host:port`)

Always set: `ADMIN_TOKEN` (used for POST /api/content and for /api/registrations when configured).

## APIs
- `GET /api/content` — fetch published content
- `POST /api/content` — admin-only; `Authorization: Bearer ADMIN_TOKEN`; body matches `ContentSchema` in `app/lib/content.ts`
- `POST /api/register` — stores a team registration (leader + 3 required members, optional 4th)
- `GET /api/registrations?limit=100` — list recent registrations; requires `ADMIN_TOKEN` if set

## Admin UIs
- `/admin` — JSON content editor (publish/update the site content)
- `/admin/registrations` — fetch registrations and export CSV (enter admin token if set)

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Redis / Vercel KV for content and registrations

## Notes
- Secrets are not committed; keep credentials in `.env.local`.
- Static exports are not used; runs as a serverless app on Vercel.
- Images in the gallery use `next/image` with `unoptimized` to avoid domain config during prototyping.
