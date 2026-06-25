import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/players/search?q=CM-847 or ?q=arjun
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const profiles = await prisma.playerProfile.findMany({
      where: {
        OR: [
          { playerCode: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: { select: { name: true, email: true, fideId: true } },
      },
      take: 10,
    });

    res.json(profiles);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/players/:identifier — lookup by username OR playerCode (CM-XXXXXX)
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    // Determine if this is a player code (starts with CM-) or a username
    const isPlayerCode = /^CM-\d+$/i.test(identifier);

    const profile = await prisma.playerProfile.findUnique({
      where: isPlayerCode
        ? { playerCode: identifier.toUpperCase() }
        : { username: identifier },
      include: {
        user: { select: { name: true, email: true, fideId: true } },
        ratingHistory: { orderBy: { date: 'asc' } },
      },
    });
    if (!profile) return res.status(404).json({ error: 'Player not found' });
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/players/rating-entry (authenticated player)
router.post('/rating-entry', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      rating: z.number().min(100).max(3000),
      date: z.string(),
      tournamentName: z.string().optional(),
      delta: z.number().optional(),
      result: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const entry = await prisma.ratingEntry.create({
      data: { ...data, date: new Date(data.date), profileId: profile.id },
    });

    // Update current rating
    await prisma.playerProfile.update({
      where: { id: profile.id },
      data: {
        currentRating: data.rating,
        peakRating: Math.max(profile.peakRating, data.rating),
        totalTournaments: { increment: 1 },
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

