# Security & Quality Audit

Scan date: repo scan for unprofessional and vulnerable patterns.

---

## CRITICAL – Security Vulnerabilities

### 1. **Hardcoded database credentials (FIXED)**

- **File:** `apps/api/run-migration.js` (removed; project uses `run-all-migrations.js` for `npm run migrate`)
- **Issue:** Fallback `connectionString` contained a real DB URL with username/password.
- **Fix applied:** Script removed; migrations are run via `npm run migrate` (run-all-migrations.js), which requires `DATABASE_URL` from `.env`.

### 2. **Admin routes lack role check**

- **Files:** `apps/api/src/routes/admin.routes.ts`, `apps/api/src/routes/user.routes.ts`
- **Issue:** Admin routes only use `authenticateToken`. Any logged-in user can call `/api/admin/*` (list users, update users, analytics, notifications, audit log).
- **Recommendation:** Add `requireAdmin` (or similar) middleware that checks `req.user.role === 'Admin'` (or your admin role name) and returns 403 for non-admins. Apply to all admin routes and to `GET /api/users` if it is admin-only.

### 3. **JWT secrets not validated at startup**

- **Files:** `apps/api/src/utils/jwt.utils.ts`, `apps/api/src/middleware/auth.middleware.ts`
- **Issue:** `process.env.JWT_SECRET!` and `JWT_REFRESH_SECRET!` are used with non-null assertion. If env vars are missing, the app fails at runtime with a cryptic error.
- **Recommendation:** On app startup, check that `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and have sufficient length (e.g. ≥ 32 chars); exit with a clear message if not.

### 4. **Logout does not invalidate tokens**

- **File:** `apps/api/src/controllers/auth.controller.ts`
- **Issue:** Comment: "TODO: Implement token blacklisting with Redis". Logout only clears tokens on the client; tokens remain valid until expiry.
- **Recommendation:** Implement token blacklisting (e.g. Redis) and check it in auth middleware so logout actually invalidates the token.

### 5. **Ensure `.env` is never committed**

- **Note:** `.gitignore` includes `.env` and `.env.*`. If `.env` was ever committed (e.g. before being ignored), rotate all secrets (JWT, DB, API keys) and remove the file from git history (e.g. `git filter-branch` or BFG).

---

## HIGH – Unprofessional / Risky

### 6. **Console.log / console.warn / console.error in production code**

- **Files (examples):**
  - `apps/api/src/services/roadmap.service.ts` – `console.log`, `console.warn`
  - `apps/api/src/services/aiAssessment.service.ts` – many `console.log`/`console.warn`/`console.error` (including request/response previews)
  - `apps/api/src/services/ollama.service.ts` – `console.log`, `console.error` with prompt/response snippets
  - `apps/api/src/services/courseGenerator.service.ts` – `console.warn`
  - `apps/web/src/hooks/useAuth.ts` – `console.error` on token refresh / logout
  - `apps/web/src/app/(dashboard)/assessment/*` – `console.error`
- **Risk:** Logs can leak sensitive data (prompts, tokens, PII) and clutter production logs.
- **Recommendation:** Use the app logger (e.g. `logger.debug`/`logger.warn`/`logger.error`) and avoid logging request/response bodies or tokens. Remove or guard verbose debug logs so they only run in development.

### 7. **Hardcoded / sensitive values in examples**

- **File:** `apps/api/.env.example`
- **Issue:** Previously contained a real Ollama URL (`http://16.170.249.187:11434`). Updated to `http://localhost:11434` so the example does not expose an internal IP.

### 8. **Widespread use of `any`**

- **Files:** Many under `apps/api/src` and `apps/web/src` (e.g. `(res: any)`, `(row: any)`, `data?: any`, `details: any`).
- **Risk:** Bypasses type safety and can hide bugs and insecure use of data.
- **Recommendation:** Replace with proper types/interfaces (API response types, DB row types, etc.) and use `unknown` where the shape is not known.

### 9. **TODO / FIXME in production code**

- **Examples:**
  - `apps/api/src/routes/admin.routes.ts`: "TODO: Add admin role check middleware"
  - `apps/api/src/routes/user.routes.ts`: "GET /api/users (admin only - TODO: add admin middleware)"
  - `apps/api/src/controllers/auth.controller.ts`: "TODO: Implement token blacklisting with Redis"
- **Recommendation:** Either implement these or track them in issues and remove misleading TODOs from critical paths.

---

## MEDIUM – Good to fix

### 10. **Error stack only in development**

- **File:** `apps/api/src/middleware/error.middleware.ts`
- **Status:** Stack is only sent when `NODE_ENV === 'development'`, which is correct. No change needed; just ensure `NODE_ENV` is set correctly in production.

### 11. **Rate limiting**

- **File:** `apps/api/src/index.ts`
- **Status:** Global rate limit exists (e.g. 100 req / 15 min per IP on `/api/`). Consider stricter limits on auth routes (e.g. login/register) to reduce brute-force risk.

### 12. **CORS**

- **File:** `apps/api/src/index.ts`
- **Status:** CORS uses `FRONTEND_URL` or a fixed list of origins; no wildcard `*` in production. Ensure production `FRONTEND_URL` is set and does not include untrusted origins.

### 13. **SQL usage**

- **Status:** Queries seen use parameterized calls (e.g. `query('...', [param1, param2])`). No string concatenation of user input into SQL was found. Keep using parameterized queries for all user-controlled input.

### 14. **Password hashing**

- **File:** `apps/api/src/utils/password.utils.ts`
- **Status:** bcrypt with 8 salt rounds. Acceptable; 10–12 rounds is slightly stronger if performance allows.

---

## LOW – Hygiene

### 15. **Migration scripts and logging**

- **Files:** `apps/api/run-all-migrations.js`
- **Status:** Use `console.log`/`console.error` for CLI output, which is acceptable for migration scripts. No secrets should be logged.

### 16. **Test secrets**

- **File:** `apps/api/src/tests/setup.ts`
- **Status:** Sets `JWT_SECRET` and `JWT_REFRESH_SECRET` for tests. Clearly test-only values; ensure test env is never used as production.

---

## Summary

| Severity | Count | Action |
|----------|--------|--------|
| Critical (fixed) | 1 | `run-migration.js` removed (use `run-all-migrations.js`); `.env.example` Ollama URL sanitized. |
| Critical (open) | 4 | Add admin role check, validate JWT env at startup, implement logout blacklist, verify `.env` not in history. |
| High | 4 | Replace console.* with logger, reduce `any`, resolve TODOs. |
| Medium | 5 | Optional hardening (auth rate limits, CORS, etc.). |
| Low | 2 | Script/test hygiene. |

Implement the critical open items first (admin middleware, JWT validation, logout blacklist, and secret rotation if `.env` was ever committed).

---

## Rescan – Additional Findings (post-fix)

### Security – IDOR (FIXED)

**1. GET /api/ai-assistant/sessions/:sessionId/history**

- **Issue:** `getSessionAssistanceHistory(sessionId)` returned AI assistance history for any session without verifying the caller is the host or study buddy of that session. Any authenticated user could read another user’s assistance history by guessing session IDs.
- **Fix:** Service now accepts `userId`, checks `study_sessions` for `session_id` and `(host_user_id = userId OR study_buddy_user_id = userId)`, and returns 404 if the user has no access. Controller passes `req.user!.userId`.

**2. POST /api/ai-assistant/rate/:assistanceId**

- **Issue:** `rateResponse(assistanceId, wasHelpful)` updated `was_helpful` for any assistance row without verifying the assistance belonged to a session the caller participates in.
- **Fix:** Service now accepts `userId`, resolves the assistance’s `session_id`, verifies session ownership (host or buddy), returns 403 if denied, then performs the update. Controller passes `req.user!.userId`.

### Code quality

- **parseInt radix:** AI Assistant controller now uses `parseInt(..., 10)` for `sessionId` and `assistanceId` for consistency.
- **GET /api/users:** Already fixed in a prior pass (protected with `requireAdmin`).
