import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { Role, User, UserDoc } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Rejects the request unless a valid JWT resolves to an active user. */
export async function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account is no longer active');

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Session expired, please sign in again'));
  }
}

/** Attaches req.user when a token is present, but never blocks the request. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
  } catch {
    /* anonymous request, carry on */
  }
  return next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires: ${roles.join(' or ')}`));
    }
    return next();
  };
}

/** Admins and dispatchers share most back-office privileges. */
export const requireStaff = requireRole('admin', 'dispatcher');
