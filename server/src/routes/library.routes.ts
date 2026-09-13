import { Router, Response } from 'express';
import { prisma } from '../lib/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

export const libraryRouter = Router();

// GET /api/library - list user's saved stories
libraryRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const saved = await prisma.savedStory.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
            category: true,
            _count: {
              select: { clapsList: true, comments: true, savedBy: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = saved.map((s: (typeof saved)[0]) => ({
      ...s.post,
      savedAt: s.createdAt,
      isSaved: true,
    }));

    return res.json({ savedStories: items });
  } catch (error) {
    console.error('Error fetching library:', error);
    return res.status(500).json({ error: 'Failed to fetch saved stories' });
  }
});

export default libraryRouter;
