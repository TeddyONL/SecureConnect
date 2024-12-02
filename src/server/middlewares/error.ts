import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'A record with this unique constraint already exists',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Record not found',
      });
    }
  }

  logger.error('Unhandled error:', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
};