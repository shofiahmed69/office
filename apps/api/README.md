# ScholarPass API

Backend API for ScholarPass learning platform.

## Features

- ✅ JWT Authentication
- ✅ User Management
- ✅ PostgreSQL Database
- ✅ Redis Caching
- ✅ WebSocket Support (Socket.io)
- ✅ Error Handling
- ✅ Request Validation
- ✅ Rate Limiting
- ✅ Logging (Winston)
- ✅ Health Checks

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users (Protected)
- `GET /api/users/me` - Get current user
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users` - List users (admin)

## Architecture

```
src/
├── config/          # Configuration (DB, Redis, Logger)
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
└── index.ts         # App entry point
```

## Development

```bash
npm run dev         # Start dev server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Lint code
```

## Testing

```bash
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Rate limiting enabled
- Helmet.js security headers
- Input validation
- SQL injection prevention

## Database

Uses PostgreSQL with connection pooling.

Schema: See `/TECHNICAL_PRD.md` for complete database schema.

## WebSocket Events

- `connection` - Client connected
- `join-room` - Join a room
- `leave-room` - Leave a room
- `disconnect` - Client disconnected

## Environment Variables

See `.env.example` for all required variables.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up monitoring and logging
