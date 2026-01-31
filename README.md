# ScholarPass - AI-Powered Personalized Learning Platform

[![CI](https://github.com/shofiahmed69/office/workflows/CI/badge.svg)](https://github.com/shofiahmed69/office/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-20.x-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> A comprehensive learning platform that uses AI to create personalized learning roadmaps and facilitate collaborative study sessions.

## 🌟 Features

- **🤖 AI-Powered Learning Roadmaps**: Personalized learning paths based on skill assessments
- **👥 Study Buddy Matching**: Smart matching algorithm to find compatible study partners
- **📹 Video Study Sessions**: WebRTC-based video calls with real-time transcription
- **📊 Progress Tracking**: Comprehensive analytics and progress monitoring
- **🎯 Skill Assessment**: Adaptive testing to identify knowledge gaps
- **📚 Content Aggregation**: Curated educational content from multiple sources

## 🏗️ Project Structure

```
office/
├── apps/
│   ├── api/              # Express.js REST API
│   │   ├── src/
│   │   │   ├── config/   # Configuration (DB, Redis, Logger)
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── tests/    # Jest tests
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/              # Next.js Frontend
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/
│       │   │   ├── ui/   # Reusable UI components
│       │   │   ├── forms/
│       │   │   └── layouts/
│       │   ├── hooks/    # Custom React hooks
│       │   ├── lib/      # Utilities
│       │   ├── services/ # API clients
│       │   └── types/    # TypeScript types
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/           # Shared code between apps
│       ├── src/
│       │   ├── types/    # Shared TypeScript types
│       │   ├── utils/    # Shared utilities
│       │   └── constants.ts
│       └── package.json
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
│
├── docs/                 # Documentation
├── docker-compose.yml    # Docker services
├── Makefile             # Development commands
├── turbo.json           # Turborepo configuration
└── package.json         # Root package
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/shofiahmed69/office.git
cd office

# Install dependencies
npm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Update .env files with your configuration
```

### Development

```bash
# Start all services in development mode
npm run dev

# Or use Make commands
make dev

# Start with Docker (recommended)
make docker-up-dev
make dev
```

The applications will be available at:
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Web**: http://localhost:3000

## 📚 Available Commands

```bash
# Development
npm run dev              # Start all apps in development mode
npm run build            # Build all applications
npm run start            # Start production build

# Testing
npm run test             # Run all tests
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests in CI mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Check TypeScript types

# Docker
npm run docker:build     # Build Docker images
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers

# Or use Makefile commands
make install            # Install dependencies
make dev                # Start development
make test               # Run tests
make lint               # Run linters
make docker-up          # Start Docker services
make ci                 # Run all CI checks
```

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator + Zod
- **Real-time**: Socket.io 4
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand 4
- **HTTP Client**: Fetch API + Custom Client
- **Forms**: React Hook Form (planned)
- **UI Components**: Custom components

### DevOps & Tools
- **Monorepo**: Turborepo
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier + Husky
- **Git Hooks**: lint-staged + commitlint
- **Testing**: Jest (unit) + Playwright (E2E, planned)

## 📖 API Documentation

API documentation is available via Swagger UI:
- **Local**: http://localhost:3001/api/docs
- **Staging**: https://api-staging.scholarpass.com/api/docs
- **Production**: https://api.scholarpass.com/api/docs

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

#### Health Checks
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe (checks DB + Redis)
- `GET /metrics` - Application metrics

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run API tests only
cd apps/api && npm test
```

### Test Structure

```
apps/api/src/tests/
├── setup.ts              # Test configuration
├── auth.test.ts          # Authentication tests
└── utils/
    ├── jwt.test.ts       # JWT utility tests
    └── password.test.ts  # Password utility tests
```

## 🐳 Docker Deployment

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Production

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔄 CI/CD Pipeline

### Automated Workflows

1. **CI Pipeline** (on push/PR)
   - Code linting (ESLint)
   - Type checking (TypeScript)
   - Format checking (Prettier)
   - Unit tests (Jest)
   - Build verification
   - Security audit

2. **Deploy to Staging** (on push to `develop`)
   - Run full test suite
   - Build Docker images
   - Deploy to staging environment

3. **Deploy to Production** (on push to `main`)
   - Run full test suite
   - Build optimized Docker images
   - Deploy to production
   - Create GitHub release

4. **Security Scanning**
   - Dependency review (on PRs)
   - CodeQL analysis (weekly)

## 🤝 Contributing

### Git Workflow

1. Create a feature branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit using conventional commits
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push and create a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Build system changes
- `ci:` CI/CD changes
- `chore:` Other changes

### Code Style

- Follow the ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 🗄️ Database Structure

PostgreSQL is the primary database. The schema below assumes a base `app_users` table exists (id, username, email, password hash, etc.). Apply the structure in order when setting up a new database.

### Prerequisite: app_users

Ensure `app_users` has at least: `id` (SERIAL PRIMARY KEY), `username`, `email`, and these columns (add if missing):

- `active_or_archive` BOOLEAN DEFAULT TRUE  
- `account_lock` BOOLEAN DEFAULT FALSE  
- `access_failed_count` INTEGER DEFAULT 0  
- `email_confirmed` BOOLEAN DEFAULT FALSE  
- `first_name`, `last_name` VARCHAR(255)  
- `primary_role_id` INTEGER (FK to roles table if applicable)  
- `created_at`, `updated_at` TIMESTAMP  

### Core tables

| Table | Purpose |
|-------|--------|
| **app_user_tags** | User skills/interests; rating_score 1–10, source_type, ai_suggested, etc. |
| **user_skill_assessments** | Assessment results; subject_id, subject_name, skill_scores (JSONB), weak_points, concepts_tested (JSONB) |
| **user_learning_roadmaps** | Learning roadmaps; subject, learning_goal, skill_gaps, roadmap_data (JSONB), hours_per_week, estimated_weeks, status, progress_percentage |
| **roadmap_modules** | Modules per roadmap; roadmap_id FK, module_name, topics (JSONB), estimated_hours, sequence_order, status |
| **content_sources** | External content sources; name, type, base_url, api_key_encrypted, is_active |
| **educational_content** | Content items; source_id FK, external_id, title, description, content_url, thumbnail_url, duration_seconds, difficulty_level, topics (JSONB), quality_score. UNIQUE (source_id, external_id) |
| **user_content_progress** | Per-user watch progress; user_id, content_id, watch_time_seconds, last_position, is_completed. UNIQUE (user_id, content_id) |
| **roadmap_content** | Links content to roadmap modules; roadmap_id, content_id, module_id, sequence_order. UNIQUE (roadmap_id, content_id, module_id) |
| **study_buddy_matches** | Buddy requests; requester_user_id, requested_user_id, match_score, status (e.g. pending). UNIQUE (requester, requested) |
| **study_buddies** | Connected pairs; user_id_1, user_id_2, total_sessions, is_active. UNIQUE (user_id_1, user_id_2) |
| **buddy_assignments** | Assignments; buddy_id FK, roadmap_id, module_id, status |
| **user_study_preferences** | One row per user; available_times, timezone, preferred_subjects, learning_style, max_study_buddies, is_findable |
| **study_sessions** | Sessions; host_user_id, study_buddy_user_id, video_call_room_id, video_call_url, status, scheduled_start_time, duration_minutes, study_topics (JSONB), learning_goals (JSONB) |
| **study_session_transcription_chunks** | Transcript chunks; session_id FK, speaker_user_id, transcript_text, sequence_number, confidence_score |
| **study_session_ai_assistance** | AI Q&A per session; session_id, user_id, question_text, ai_response_text, was_helpful |
| **attention_tracking_data** | Focus metrics; session_id, user_id, focus_percentage, total_samples, focused_samples, distraction_events |
| **app_notifications** | User notifications; user_id, title, message, notification_type, is_read |
| **admin_audit_log** | Admin actions; admin_user_id, action, details (JSONB) |
| **topic_video_suggestions** | Cached video suggestions per topic; topic_normalized, external_id, title, description, thumbnail_url, content_url, duration_seconds, channel_title, source. UNIQUE (topic_normalized, external_id) |

### Indexes (main)

- `app_user_tags`: user_id, (user_id, is_filled)  
- `user_skill_assessments`: user_id, subject_name  
- `user_learning_roadmaps`: user_id, status  
- `roadmap_modules`: roadmap_id  
- `educational_content`: GIN(topics), GIN(to_tsvector title/description)  
- `user_content_progress`: user_id  
- `roadmap_content`: roadmap_id, (roadmap_id, module_id)  
- `study_sessions`: host_user_id, study_buddy_user_id, status, scheduled_start_time  
- `study_session_transcription_chunks`: (session_id, sequence_number)  
- `study_session_ai_assistance`: session_id  
- `attention_tracking_data`: session_id, user_id  
- `app_notifications`: user_id, (user_id, is_read)  
- `admin_audit_log`: admin_user_id, created_at  
- `topic_video_suggestions`: topic_normalized, (topic_normalized, created_at DESC)  

### Seed / bootstrap

- Insert at least one `content_sources` row for YouTube (name `YouTube`, type `youtube`, base_url `https://www.youtube.com`, is_active true).

Schema is documented here only; apply it manually or via your own migration/setup scripts.

## 📁 Environment Variables

### API (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Web (.env)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ScholarPass
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- SQL injection prevention (parameterized queries)
- XSS protection
- Environment variable validation

## 📊 Monitoring & Observability

### Health Checks

- **Liveness**: `/health` - Checks if the application is running
- **Readiness**: `/ready` - Checks if dependencies (DB, Redis) are healthy
- **Metrics**: `/metrics` - Application metrics (memory, CPU, uptime)

### Logging

- Structured JSON logging with Winston
- Log levels: error, warn, info, debug
- Automatic request/response logging
- Error stack traces in development

## 🗺️ Roadmap

- [x] ✅ Testing infrastructure
- [x] ✅ ESLint & code quality tools
- [x] ✅ Frontend structure
- [x] ✅ Shared package utilities
- [x] ✅ Docker support
- [x] ✅ CI/CD pipeline
- [x] ✅ API documentation
- [x] ✅ Health check endpoints
- [ ] 🚧 E2E testing (Playwright)
- [ ] 🚧 Performance monitoring
- [ ] 🚧 Error tracking (Sentry)
- [x] ✅ Database structure documented in README
- [ ] 🚧 API rate limiting per user

## 📞 Support

For questions and support:
- 📧 Email: support@scholarpass.com
- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/shofiahmed69/office/issues)

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ by the ScholarPass Team**