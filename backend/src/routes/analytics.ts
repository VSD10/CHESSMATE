import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const analyticsLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.post('/event', analyticsLimiter, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      tournamentId: z.string(),
      type: z.enum(['PAGE_VIEW', 'REGISTER_CLICK', 'RESULTS_CLICK']),
    });
    const { tournamentId, type } = schema.parse(req.body);
    await prisma.analyticsEvent.create({
      data: { tournamentId, type, userAgent: req.headers['user-agent'], ip: req.ip },
    });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// GET /api/analytics/dashboard (admin)
router.get('/dashboard', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalTournaments, totalViews, totalClicks, recentTournaments] = await Promise.all([
      prisma.tournament.count(),
      prisma.analyticsEvent.count({ where: { type: 'PAGE_VIEW' } }),
      prisma.analyticsEvent.count({ where: { type: 'REGISTER_CLICK' } }),
      prisma.tournament.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, createdAt: true },
      }),
    ]);
    res.json({ totalTournaments, totalViews, totalClicks, recentTournaments });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
