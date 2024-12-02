import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './lib/logger';
import { errorHandler } from './middlewares/error';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(rateLimit(config.rateLimit));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compress responses
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;