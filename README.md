# ScholarPass Backend

Node.js + Express backend for master data and courses API, using PostgreSQL and Redis.

## Setup

1. **Copy environment file** (sensitive data stays out of git via `.gitignore`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL`, Redis, and other variables.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database**
   - If the database is **empty**, run `npm run db:migrate` to create tables.
   - If you are using the **existing ScholarPass DB** (tables already exist), skip migrate and run only:
   ```bash
   npm run db:seed
   ```
   to load dummy master data into the existing schema.

4. **Start the server**
   ```bash
   npm run dev
   ```
   API runs at `http://localhost:3001` (or `PORT` from `.env`).
   Health: `GET /health`

## API Endpoints

### Master Data

| Method | Endpoint | Query params |
|--------|----------|--------------|
| GET | `/api/master/countries` | — |
| GET | `/api/master/states` | `countryId` |
| GET | `/api/master/cities` | `stateId` |
| GET | `/api/master/timezones` | — |
| GET | `/api/master/languages` | — |
| GET | `/api/master/hubs` | `countryId`, `stateId`, `cityId` |
| GET | `/api/master/tags/groups` | — |
| GET | `/api/master/tags/categories` | `groupId` |
| GET | `/api/master/tags` | `categoryId` |
| GET | `/api/master/ai-models` | — |
| GET | `/api/master/ai-prompts` | `category` |

### Courses

| Method | Endpoint |
|--------|----------|
| POST | `/api/courses/generate` |

All list endpoints return: `{ "success": true, "data": { "items": [...] } }`.

## Scripts

- `npm start` — run server
- `npm run dev` — run with watch
- `npm run db:migrate` — create tables
- `npm run db:seed` — load dummy master data
