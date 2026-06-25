import { Router, Request, Response } from 'express';
import prisma from '../lib/db';
import { verifySupabaseToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generatePlayerCode } from '../lib/playerCode';

const router = Router();

// Maximum number of users allowed
const MAX_USERS = 50_000;

/**
 * POST /api/auth/callback
 *
 * Called by the frontend after a successful Supabase login (Google or email).
 * Syncs the Supabase Auth user to our database. Creates User + PlayerProfile
 * on first login.
 *
 * Body: { name?: string, username?: string, fideId?: string }
 * Headers: Authorization: Bearer <supabase-access-token>
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = authHeader.slice(7);
    const supabaseUser = await verifySupabaseToken(token);

    // Check if user already exists in our DB by authProviderId
    let dbUser = await prisma.user.findFirst({
      where: { authProviderId: supabaseUser.id },
      include: { profile: true },
    });

    // If not found by authProviderId, check by email (to link seeded users)
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: { profile: true },
      });

      if (dbUser) {
        // Link the seeded user to their Supabase Auth ID
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            authProvider: 'supabase',
            authProviderId: supabaseUser.id,
          },
          include: { profile: true },
        });
      }
    }

    if (dbUser) {
      // Existing user — return their data
      return res.json({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          username: dbUser.profile?.username,
          playerCode: dbUser.profile?.playerCode,
        },
        isNewUser: false,
      });
    }

    // New user — check 50K cap
    const userCount = await prisma.user.count();
    if (userCount >= MAX_USERS) {
      return res.status(403).json({
        error: `Registration closed — ${MAX_USERS.toLocaleString()} user limit reached`,
      });
    }

    // Extract info from request body or Supabase user metadata
    const { name, username, fideId } = req.body;
    const displayName = name || supabaseUser.email.split('@')[0];
    const userUsername = username || supabaseUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Check username uniqueness
    if (username) {
      const existingUsername = await prisma.playerProfile.findUnique({ where: { username: userUsername } });
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Ensure unique username by appending random suffix if needed
    let finalUsername = userUsername;
    const existingProfile = await prisma.playerProfile.findUnique({ where: { username: finalUsername } });
    if (existingProfile) {
      finalUsername = `${userUsername}_${Math.random().toString(36).slice(2, 6)}`;
    }

    // Generate unique ChessMate player code
    const playerCode = await generatePlayerCode();

    // Create new user + profile
    dbUser = await prisma.user.create({
      data: {
        email: supabaseUser.email,
        name: displayName,
        role: 'PLAYER',
        fideId: fideId || null,
        authProvider: 'supabase',
        authProviderId: supabaseUser.id,
        profile: {
          create: {
            username: finalUsername,
            playerCode,
            currentRating: 1200,
            peakRating: 1200,
          },
        },
      },
      include: { profile: true },
    });

    res.status(201).json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        username: dbUser.profile?.username,
        playerCode: dbUser.profile?.playerCode,
      },
      isNewUser: true,
    });
  } catch (err) {
    console.error('[Auth Callback Error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Strip passwordHash from response
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
