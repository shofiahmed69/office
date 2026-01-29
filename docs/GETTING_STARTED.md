# Getting Started with ScholarPass

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/shofiahmed69/office.git scholarpass
cd scholarpass
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment

**Backend** (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials
```

**Frontend** (`apps/web/.env.local`):
```bash
cp apps/web/.env.example apps/web/.env.local
```

### 4. Start Development Servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

### 5. Access Database

Database is already set up and running. See [DB_CREDENTIALS.md](../DB_CREDENTIALS.md) for connection details.

## Project Structure

```
scholarpass/
├── apps/
│   ├── web/              # Next.js frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router pages
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── api/              # Node.js backend (Port 3001)
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── shared/           # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configs
└── docs/                 # Documentation
```

## Development Workflow

### Working on Features

1. **Create/Checkout feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

4. **Create Pull Request**
   ```bash
   gh pr create --base main --head feature/your-feature
   ```

## Available Scripts

```bash
npm run dev          # Start all dev servers
npm run build        # Build all apps
npm run start        # Start production servers
npm run lint         # Lint all code
npm run test         # Run tests
npm run clean        # Clean all node_modules
```

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
kill -9 $(lsof -ti:3000)  # Frontend
kill -9 $(lsof -ti:3001)  # Backend
```

### Database Connection Issues
See [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md)

### Module Not Found
```bash
# Reinstall dependencies
npm run clean
npm install
```

## Next Steps

1. ✅ Review [TECHNICAL_PRD.md](../TECHNICAL_PRD.md)
2. ✅ Check [Database Setup](./DATABASE_CONNECTION.md)
3. ✅ Explore [GitHub Branches](../GITHUB_BRANCHES.md)
4. ✅ Start building features!

## Support

- Documentation: `./docs/`
- Technical PRD: `TECHNICAL_PRD.md`
- Database Info: `DB_CREDENTIALS.md`
