import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken } from '../lib/jwt';
import prisma from '../lib/db';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string; supabaseId: string };
}

/**
 * Authentication middleware — verifies the Supabase JWT from the
 * Authorization header and attaches the corresponding DB user.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const token = authHeader.slice(7);

    // 1. Verify token with Supabase
    const supabaseUser = await verifySupabaseToken(token);

    // 2. Find the corresponding user in our database
    const dbUser = await prisma.user.findFirst({
      where: { authProviderId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'User not found. Please complete registration.' });
    }

    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      supabaseId: supabaseUser.id,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
