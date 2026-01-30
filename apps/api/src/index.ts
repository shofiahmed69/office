import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './config/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';
import docsRoutes from './routes/docs.routes';
import assessmentRoutes from './routes/assessment.routes';
import roadmapRoutes from './routes/roadmap.routes';
import contentRoutes from './routes/content.routes';
import studyBuddyRoutes from './routes/studyBuddy.routes';
import sessionRoutes from './routes/session.routes';
import aiAssistantRoutes from './routes/aiAssistant.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check routes (no /api prefix)
app.use(healthRoutes);

// API Documentation
app.use('/api/docs', docsRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/study-buddies', studyBuddyRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'ScholarPass API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ready: '/ready',
      docs: '/api/docs',
      auth: '/api/auth',
      users: '/api/users',
      assessments: '/api/assessments',
      roadmaps: '/api/roadmaps',
      content: '/api/content',
      studyBuddies: '/api/study-buddies',
      sessions: '/api/sessions',
      aiAssistant: '/api/ai-assistant',
      analytics: '/api/analytics',
      admin: '/api/admin',
    },
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info('Client joined room', { socketId: socket.id, roomId });
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    logger.info('Client left room', { socketId: socket.id, roomId });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;

  httpServer.listen(PORT, () => {
    logger.info(`🚀 ScholarPass API running on http://localhost:${PORT}`);
    logger.info(`🔌 WebSocket server ready`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

export { app, httpServer, io };
