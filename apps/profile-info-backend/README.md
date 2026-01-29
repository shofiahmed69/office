# Profile Info Backend

Node.js + Express API for **users/me**: profile, preferences, tags, roles, permissions, and AI settings. Uses PostgreSQL.

## Auth for `/api/users/me`

- **Production:** `Authorization: Bearer <JWT>`
- **Development:** `X-User-Id: <profile_id>`. Create a profile via `POST /profiles` first.

## Setup

```bash
cd apps/profile-info-backend
cp .env.example .env   # edit with your DATABASE_URL, etc.
npm install
npm run db:init
npm run dev
```

## API

See root docs or run `npm run test:endpoints` (server must be running).
