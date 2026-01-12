import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';
import logger from '../utils/logger.js';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // PostgreSQL unique constraint violation
  if (error.code === '23505') {
    logger.warn({ error: error.detail, path: req.path }, 'Duplicate entry');
    return res.status(HttpStatusCode.CONFLICT).json({
      error: 'Duplicate entry',
      message: error.detail || 'Resource already exists'
    });
  }

  // PostgreSQL foreign key violation
  if (error.code === '23503') {
    logger.warn({ error: error.detail, path: req.path }, 'Foreign key violation');
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
  }

  // PostgreSQL not null violation
  if (error.code === '23502') {
    logger.warn({ column: error.column, path: req.path }, 'Not null violation');
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'Missing required field',
      message: error.column ? `Field '${error.column}' is required` : 'Missing required data'
    });
  }

  // Custom AppError
  if (error instanceof AppError) {
    logger.warn({ statusCode: error.statusCode, message: error.message, path: req.path }, 'Application error');
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  // Log unexpected errors
  logger.error({ error: error.message, stack: error.stack, path: req.path }, 'Unexpected error');
  
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
