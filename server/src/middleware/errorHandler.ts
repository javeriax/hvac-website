import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Something went wrong on our end';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof MongooseError.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([key, e]) => [key, e.message]),
    );
  } else if (err instanceof MongooseError.CastError) {
    status = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
    status = 409;
    const field = Object.keys((err as { keyValue?: object }).keyValue ?? {})[0] ?? 'value';
    message = `That ${field} is already registered`;
  } else if (err instanceof Error) {
    message = env.isProd ? message : err.message;
  }

  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
