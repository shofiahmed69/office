# Admin Dashboard Backend (ScholarPass)

Node.js + Express API for the admin dashboard. Uses PostgreSQL and Redis; sensitive config is in `.env` (gitignored).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` and set values (or use existing `.env`).
   - `.env` is in `.gitignore`; never commit secrets.

3. **Database**
   - Backend expects PostgreSQL with tables: `users`, `audit_logs`, `prompts`.
   - `users`: `id`, `email`, `locked` (boolean), `lock_reason` (text), `created_at`, `updated_at`.
   - `audit_logs`: `id`, `action`, `actor_user_id`, `metadata`, `created_at`.
   - `prompts`: `id`, `title`, `category`, `prompt_template`, `is_published`, `created_at`, `updated_at`.
   - If your schema differs, adjust queries in `src/controllers/adminController.js` or add migrations. See `scripts/schema.sql` for hints.

4. **Redis**
   - Used for jobs list (`job:*` keys). If Redis is down, jobs list may be empty; other endpoints still work if DB is up.

5. **Optional – skip admin auth (dev only)**
   - In `.env` set `SKIP_ADMIN_AUTH=1` to call admin APIs without a JWT. Do not use in production.

## Run

```bash
npm run dev
```

Server runs at `http://localhost:3001` (or `PORT` from `.env`).

## API Endpoints (Demo 2.19 Admin / Ops)

All under `/api/admin`. Send `Authorization: Bearer <JWT>` unless `SKIP_ADMIN_AUTH=1`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users?page=&limit=` | List users (paginated) |
| PATCH | `/api/admin/users/:id/lock` | Lock/unlock user `{ "locked": true, "reason": "..." }` |
| GET | `/api/admin/jobs` | List jobs (from Redis) |
| POST | `/api/admin/jobs/:jobId/retry` | Retry job |
| GET | `/api/admin/audit-logs?page=&limit=` | List audit logs (paginated) |
| POST | `/api/admin/prompts` | Create prompt `{ "title", "category", "promptTemplate", "isPublished" }` |
| PATCH | `/api/admin/prompts/:id/publish` | Publish prompt `{ "isPublished": true }` |

- Health: `GET /health`

## JWT

Admin routes expect a JWT in `Authorization: Bearer <token>` signed with `JWT_SECRET`, with a `role: "admin"` claim. Use your main app’s login to get a token, or set `SKIP_ADMIN_AUTH=1` for local testing.
