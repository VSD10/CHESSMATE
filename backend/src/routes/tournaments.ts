import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { TournamentStatus, TournamentFormat } from '@prisma/client';

const router = Router();

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  state: z.string().optional(),
  format: z.string().optional(),
  status: z.string().optional(),
  fideRated: z.string().optional(),
  q: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  format: z.nativeEnum(TournamentFormat),
  rounds: z.number().min(1).max(20),
  timeControl: z.string(),
  category: z.string(),
  fideRated: z.boolean().default(false),
  entryFee: z.string(),
  prizePool: z.string(),
  status: z.nativeEnum(TournamentStatus).default(TournamentStatus.UPCOMING),
  emoji: z.string().default('♟'),
  about: z.string(),
  detail: z.object({
    venue: z.string(),
    chiefArbiter: z.string(),
    organizer: z.string(),
    organizingCommittee: z.string().optional(),
    registrationLink: z.string().url().optional().or(z.literal('')),
    resultsLink: z.string().url().optional().or(z.literal('')),
    rules: z.string().optional(),
    prizes: z.array(z.object({ position: z.string(), amount: z.string() })),
  }),
});

// Generate slug from name
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit, state, format, status, fideRated, q } = querySchema.parse(req.query);

    const where: any = {};
    if (state) where.state = state;
    if (format) where.format = format as TournamentFormat;
    if (status) {
      if (status === 'UPCOMING') {
        where.status = { in: ['UPCOMING', 'OPEN'] };
      } else {
        where.status = status as TournamentStatus;
      }
    }
    if (fideRated !== undefined) where.fideRated = fideRated === 'true';
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, tournaments] = await Promise.all([
      prisma.tournament.count({ where }),
      prisma.tournament.findMany({
        where,
        orderBy: [{ status: 'asc' }, { startDate: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, slug: true, name: true, city: true, state: true,
          startDate: true, endDate: true, format: true, rounds: true,
          timeControl: true, category: true, fideRated: true, entryFee: true,
          prizePool: true, status: true, posterUrl: true, emoji: true,
        },
      }),
    ]);

    res.json({
      data: tournaments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tournaments/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: req.params.slug },
      include: { detail: true },
    });
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tournaments (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const baseSlug = slugify(data.name);

    // Ensure unique slug
    let slug = baseSlug;
    let count = 0;
    while (await prisma.tournament.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++count}`;
    }

    const { detail, ...tournamentData } = data;
    const tournament = await prisma.tournament.create({
      data: {
        ...tournamentData,
        slug,
        startDate: new Date(tournamentData.startDate),
        endDate: new Date(tournamentData.endDate),
        detail: { create: detail },
      },
      include: { detail: true },
    });
    res.status(201).json(tournament);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tournaments/:id (admin only)
router.put('/:id', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const { detail, ...data } = createSchema.partial().parse(_req.body);

    const tournament = await prisma.tournament.update({
      where: { id: _req.params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        detail: detail ? { update: detail } : undefined,
      },
      include: { detail: true },
    });
    res.json(tournament);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tournaments/:id (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.tournament.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tournament deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
