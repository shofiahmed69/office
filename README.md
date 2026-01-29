# ScholarPass Backend

Node.js + Express backend with PostgreSQL and JWT authentication.

## Configuration (.env)

- **DATABASE_URL** – PostgreSQL connection string
- **REDIS_URL** – Redis URL (optional)
- **JWT_SECRET** – Access token signing
- **JWT_REFRESH_SECRET** – Refresh token & reset token signing
- **PORT** – Server port (default 3001)
- **FRONTEND_URL** – Allowed CORS origin
- **LOG_LEVEL** – `info` or `debug`

## Setup

```bash
npm install
npm run init-db   # create/update users table + OTP columns
npm start
```

Server: **http://localhost:3001**

## Database

**users**: `id`, `email` (unique), `password_hash`, `name`, `created_at`, `updated_at`, `otp`, `otp_expires_at`

## Auth API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register – `{ email, password, name? }` |
| POST | `/api/auth/login` | Login – `{ email, password }` |
| POST | `/api/auth/logout` | Logout – `Authorization: Bearer <accessToken>` |
| GET | `/api/auth/me` | Current user – `Authorization: Bearer <accessToken>` |
| POST | `/api/auth/refresh` | New access token – `{ refreshToken }` |
| POST | `/api/auth/forgot-password` | Request OTP – `{ email }` |
| POST | `/api/auth/verify-otp` | Verify OTP – `{ email, otp }` → returns `resetToken` |
| POST | `/api/auth/reset-password` | Set new password – `{ resetToken, newPassword }` |

### Register

- **POST** `/api/auth/register`  
- Body: `{ "email", "password", "name?" }`  
- Response: `{ success, message, data: { user, accessToken, refreshToken, expiresIn } }`

### Login

- **POST** `/api/auth/login`  
- Body: `{ "email", "password" }`  
- Response: `{ success, message, data: { user, accessToken, refreshToken, expiresIn } }`

### Logout

- **POST** `/api/auth/logout`  
- Header: `Authorization: Bearer <accessToken>`  
- Response: `{ success, message }` – client should discard tokens.

### Me (protected)

- **GET** `/api/auth/me`  
- Header: `Authorization: Bearer <accessToken>`  
- Response: `{ success, data: { user } }`

### Refresh

- **POST** `/api/auth/refresh`  
- Body: `{ "refreshToken" }`  
- Response: `{ success, data: { accessToken, expiresIn, user } }`

### Forgot password (request OTP)

- **POST** `/api/auth/forgot-password`  
- Body: `{ "email" }`  
- Stores 6-digit OTP in DB (expires in 10 min). In **development**, response includes `otp` for testing; in production, send OTP by email and do not return it.

### Verify OTP

- **POST** `/api/auth/verify-otp`  
- Body: `{ "email", "otp" }`  
- Response: `{ success, message, data: { resetToken, expiresIn } }` – use `resetToken` in reset-password.

### Reset password

- **POST** `/api/auth/reset-password`  
- Body: `{ "resetToken", "newPassword" }`  
- Clears OTP and updates password. Response: `{ success, message }`.

## Other

- **GET** `/health` – API health
- **GET** `/api/db/test` – Database connection check

## Scripts

- `npm start` – Start server
- `npm run init-db` – Create/update users table and OTP columns
- `npm run test-db` – Inspect DB tables/columns
