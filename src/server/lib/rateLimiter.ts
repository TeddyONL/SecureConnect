import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res) => {
    throw new ApiError(429, 'Too many requests');
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed login attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  handler: (req, res) => {
    throw new ApiError(429, 'Too many login attempts');
  },
});