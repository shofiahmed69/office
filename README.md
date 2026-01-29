# Profile Info Backend

Node.js + Express API for **users/me**: profile, preferences, tags, roles, permissions, and AI settings. Uses PostgreSQL and your existing `.env` (DB, JWT, etc.).

## Auth for `/api/users/me`

- **Production:** `Authorization: Bearer <JWT>`. Token payload should include `sub` or `userId` (profile id or user id that resolves to a profile).
- **Development:** `X-User-Id: <profile_id>` (numeric). Create a profile first via `POST /profiles` and use the returned `id`.

## Setup

```bash
npm install
npm run db:init   # schema + migrations
npm run dev       # http://localhost:3001
```

## API: `/api/users/me`

All responses use `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Current user profile (id, username, email, firstName, lastName, profilePictureUrl, masterHubId, masterCountryId, primaryRole) |
| PATCH | `/api/users/me` | Update profile (firstName, lastName, profilePictureUrl, city, state) → `{ updated: true }` |
| GET | `/api/users/me/roles` | `{ roles: ["Student"] }` |
| GET | `/api/users/me/permissions` | `{ permissions: ["content.read", ...] }` |
| GET | `/api/users/me/preferences` | `{ timezone, weeklyStudyHours, learningStyle, availableTimes: [{ day, start, end }] }` |
| PATCH | `/api/users/me/preferences` | Body: timezone, weeklyStudyHours, learningStyle, availableTimes → `{ updated: true }` |
| GET | `/api/users/me/tags` | `{ tags: [{ id, tagName, tagValue, ratingScore }] }` |
| POST | `/api/users/me/tags` | Body: tagName, tagValue?, ratingScore?, sourceType? → `{ tagId }` |
| DELETE | `/api/users/me/tags/:id` | Remove tag (id = tag id) → `{ deleted: true }` |
| GET | `/api/users/me/ai-settings` | List AI provider settings |
| POST | `/api/users/me/ai-settings` | Body: providerName, apiKeyEncrypted?, model?, isActive? |
| PATCH | `/api/users/me/ai-settings/:id` | Update one AI setting |
| DELETE | `/api/users/me/ai-settings/:id` | `{ deleted: true }` |

## Database

- **profiles** – id, username, email, first_name, last_name, profile_picture_url, master_hub_id, master_country_id, primary_role, city, state, …
- **preferences** – profile_id, key, value (keys: timezone, weeklyStudyHours, learningStyle, availableTimes as JSON)
- **user_roles** – profile_id, role
- **user_permissions** – profile_id, permission
- **tags** – id, name, slug
- **profile_tags** – profile_id, tag_id, tag_value, rating_score, source_type
- **user_ai_settings** – id, profile_id, provider_name, api_key_encrypted, model, is_active

## Quick test (dev)

```bash
# Create a profile (no auth)
curl -X POST http://localhost:3001/profiles -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"username\":\"johndoe\",\"first_name\":\"John\",\"last_name\":\"Doe\"}"

# Use returned id as X-User-Id (e.g. 1)
curl -H "X-User-Id: 1" http://localhost:3001/api/users/me
curl -H "X-User-Id: 1" http://localhost:3001/api/users/me/preferences
curl -X PATCH -H "X-User-Id: 1" -H "Content-Type: application/json" -d "{\"timezone\":\"Asia/Kolkata\",\"weeklyStudyHours\":10}" http://localhost:3001/api/users/me/preferences
```

Legacy routes still available: `/profiles`, `/profiles/:id/preferences`, `/profiles/:id/tags`, `/tags`.
