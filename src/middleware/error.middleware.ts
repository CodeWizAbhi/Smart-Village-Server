import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  errorResponse(res, statusCode, err.message || 'Server Error', process.env.NODE_ENV === 'development' ? err.stack : null);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
