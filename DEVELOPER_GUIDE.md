# Developer Guide - ScholarPass

Welcome! This guide will help you get started developing on ScholarPass.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/shofiahmed69/office.git
cd office
npm install
```

### 2. Set Up Environment Variables

**Backend** (`apps/api/.env`):
```bash
# Copy example
cp apps/api/.env.example apps/api/.env

# Required variables:
DATABASE_URL=postgresql://username:password@host:port/scholarpass
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`apps/web/.env.local`):
```bash
cp apps/web/.env.example apps/web/.env.local

# Add:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Start Development
```bash
# Terminal 1 - Start all services
npm run dev

# Or separately:
cd apps/api && npm run dev    # Backend on :3001
cd apps/web && npm run dev    # Frontend on :3000
```

---

## 📁 Project Structure

```
scholarpass/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js 14 App Router
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Frontend utilities
│   │   └── package.json
│   │
│   └── api/                    # Node.js Backend
│       ├── src/
│       │   ├── config/        # Database, Redis, Logger
│       │   ├── controllers/   # Request handlers
│       │   ├── services/      # Business logic
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Auth, validation, errors
│       │   ├── utils/         # Utilities
│       │   ├── types/         # TypeScript types
│       │   └── index.ts       # Entry point
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configs
│
├── docs/                       # Documentation
├── scripts/                    # Build/deploy scripts
└── TECHNICAL_PRD.md           # Technical specifications
```

---

## 🏗️ Backend Architecture

### API Layers

1. **Routes** (`routes/`) - Define endpoints and validation
2. **Controllers** (`controllers/`) - Handle requests/responses
3. **Services** (`services/`) - Business logic
4. **Models/DB** (`config/database.ts`) - Data access

### Example Flow

```
Request → Route → Validation → Controller → Service → Database
                                     ↓
Response ← Controller ← Service ← Database
```

### Adding a New Feature

**1. Define Route** (`routes/feature.routes.ts`):
```typescript
import { Router } from 'express';
import { FeatureController } from '../controllers/feature.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new FeatureController();

router.get('/', authenticateToken, controller.list);
router.post('/', authenticateToken, controller.create);

export default router;
```

**2. Create Controller** (`controllers/feature.controller.ts`):
```typescript
import { Request, Response, NextFunction } from 'express';
import featureService from '../services/feature.service';
import { sendSuccess } from '../utils/response.utils';

export class FeatureController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await featureService.list();
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  }
}
```

**3. Create Service** (`services/feature.service.ts`):
```typescript
import { query } from '../config/database';

export class FeatureService {
  async list() {
    const result = await query('SELECT * FROM features');
    return result.rows;
  }
}

export default new FeatureService();
```

**4. Register Route** (`index.ts`):
```typescript
import featureRoutes from './routes/feature.routes';
app.use('/api/features', featureRoutes);
```

---

## 🗄️ Database

### Connection
```typescript
import { query } from '../config/database';

// Simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
import { getClient } from '../config/database';
const client = await getClient();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

### Schema
See `TECHNICAL_PRD.md` Section 3 for complete database schema.

---

## 🔐 Authentication

### Protecting Routes

```typescript
import { authenticateToken } from '../middleware/auth.middleware';

// Protected route
router.get('/profile', authenticateToken, controller.getProfile);

// Optional auth
import { optionalAuth } from '../middleware/auth.middleware';
router.get('/public', optionalAuth, controller.getPublic);
```

### Accessing User in Controllers

```typescript
export class MyController {
  async myMethod(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.userId;  // Available after authenticateToken
    const userEmail = req.user!.email;
    const userRole = req.user!.role;
  }
}
```

### Generating Tokens

```typescript
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

const payload = { userId: 1, email: 'user@example.com', role: 'Student' };
const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);
```

---

## 🔌 WebSocket (Socket.io)

### Server Side (`index.ts`):
```typescript
import { io } from './index';

// Emit to specific room
io.to(roomId).emit('event-name', data);

// Broadcast to all
io.emit('event-name', data);
```

### Client Side:
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected');
});

socket.emit('join-room', roomId);
socket.on('message', (data) => {
  console.log(data);
});
```

---

## ✅ Validation

### Using express-validator

```typescript
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Min 8 chars'),
    validateRequest,  // Must be last
  ],
  controller.register
);
```

---

## 🛠️ Utilities

### Response Helpers

```typescript
import { sendSuccess, sendError, sendPaginated } from '../utils/response.utils';

// Success response
sendSuccess(res, { user }, 'User created', 201);

// Error response
sendError(res, 'Not found', 404);

// Paginated response
sendPaginated(res, users, page, limit, total);
```

### Password Hashing

```typescript
import { hashPassword, comparePassword } from '../utils/password.utils';

const hash = await hashPassword('plaintext');
const isValid = await comparePassword('plaintext', hash);
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### API Testing with curl
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Protected endpoint
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Logging

```typescript
import logger from '../config/logger';

logger.info('Info message', { metadata });
logger.error('Error message', { error });
logger.warn('Warning message');
logger.debug('Debug message');
```

Logs are written to:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs
- Console - Development only

---

## 🔄 Git Workflow

### Feature Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create pull request
gh pr create --base main --head feature/your-feature-name
```

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

---

## 🐛 Debugging

### VS Code Launch Config (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Logs
```typescript
// Enable debug logs
process.env.LOG_LEVEL = 'debug';
```

---

## 📚 Resources

- [Technical PRD](./TECHNICAL_PRD.md) - Complete specifications
- [GitHub Branches](./GITHUB_BRANCHES.md) - Branch organization
- [API README](./apps/api/README.md) - API documentation
- [Next.js Docs](https://nextjs.org/docs) - Frontend framework
- [Express Docs](https://expressjs.com/) - Backend framework

---

## 🆘 Common Issues

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL in `.env`

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Best Practices

1. **Always use TypeScript types**
2. **Handle errors with try-catch**
3. **Validate all inputs**
4. **Use parameterized queries** (prevent SQL injection)
5. **Log important events**
6. **Write meaningful commit messages**
7. **Keep functions small and focused**
8. **Add comments for complex logic**
9. **Test your changes**
10. **Never commit secrets**

---

**Happy coding! 🚀**
