import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // PostgreSQL unique constraint violation
  if (error.code === '23505') {
    return res.status(HttpStatusCode.CONFLICT).json({
      error: 'Duplicate entry',
      message: error.detail || 'Resource already exists'
    });
  }

  // PostgreSQL foreign key violation
  if (error.code === '23503') {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
  }

  // PostgreSQL not null violation
  if (error.code === '23502') {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'Missing required field',
      message: error.column ? `Field '${error.column}' is required` : 'Missing required data'
    });
  }

  // Custom AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
