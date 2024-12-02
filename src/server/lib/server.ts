import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from '../config/database';
import { errorHandler } from './errorHandler';
import { apiLimiter } from './rateLimiter';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from '../routes';
import { socketHandler } from './socket';
import logger from './logger';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Routes
app.use('/api', routes);

// Socket.io handler
socketHandler(io);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, httpServer };