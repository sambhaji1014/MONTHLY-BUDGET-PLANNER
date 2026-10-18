import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware: Enforces valid JWT Access Token
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing Bearer token.',
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired access token. Please refresh your session.',
    });
  }

  req.user = payload;
  next();
};

/**
 * Optional Authentication: Attaches req.user if a valid token is present, but doesn't block unauthenticated requests
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};
