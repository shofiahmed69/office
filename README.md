# ScholarPass

AI-Powered Personalized Learning Platform

## 🎓 About

ScholarPass is a comprehensive educational platform that provides personalized learning experiences through AI-powered roadmaps, study buddy matching, and intelligent content curation.

## 🚀 Tech Stack

### Frontend
- Next.js 14+ (React 18+, App Router)
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui (Radix UI)
- Socket.io-client, PeerJS

### Backend
- Node.js 20 LTS
- Express/Fastify
- TypeScript 5+
- Socket.io
- PostgreSQL 16+
- Redis 7+

### AI/ML
- Ollama (self-hosted LLM)
- Whisper (transcription)
- WebGazer.js (eye tracking)

## 📁 Project Structure

```
scholarpass/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Node.js backend
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configurations
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Run development servers
npm run dev
```

### Environment Variables

**Backend (apps/api/.env)**
```
DATABASE_URL=postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
```

**Frontend (apps/web/.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📚 Documentation

- [Technical PRD](./TECHNICAL_PRD.md)
- [Database Setup](./docs/DATABASE_CONNECTION.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🔀 Branch Structure

See [GITHUB_BRANCHES.md](./GITHUB_BRANCHES.md) for complete branch organization.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- **Database**: PostgreSQL on AWS EC2
- **Repository**: https://github.com/shofiahmed69/office
- **Documentation**: [Technical PRD](./TECHNICAL_PRD.md)

---

Built with ❤️ by the ScholarPass Team
