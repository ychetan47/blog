import { Request, Response, NextFunction } from 'express';
import { validateSession, SESSION_COOKIE_NAME } from '../lib/session.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    googleId?: string | null;
    email: string;
    name: string;
    role: string;
    topics: string[];
    avatarUrl?: string | null;
    bio?: string | null;
    savedCount?: number;
    storiesCount?: number;
  } | null;
}

export type AuthRequest = AuthenticatedRequest;

/**
 * Strict authentication middleware: requires a valid active database session.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionToken =
    req.cookies?.[SESSION_COOKIE_NAME] ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    res.status(401).json({ error: 'Unauthorized: Please sign in with Google.' });
    return;
  }

  const user = await validateSession(sessionToken);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Session has expired or is invalid.' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware: attaches user if a valid session exists.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const sessionToken =
    req.cookies?.[SESSION_COOKIE_NAME] ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    req.user = null;
    return next();
  }

  const user = await validateSession(sessionToken);
  req.user = user || null;
  next();
}
