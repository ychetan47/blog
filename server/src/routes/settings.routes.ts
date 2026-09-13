import { Router, Request, Response } from 'express';
import { db } from '../lib/db.js';

export const settingsRouter = Router();

// GET /api/settings - retrieve publication settings
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await db.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await db.settings.create({
        data: {
          id: 'default',
          siteName: 'The Margin',
          siteDescription: 'An independent journal about reading, craft, and quiet software.',
          heroTitle: 'Slow reading for a fast internet.',
          heroSubtitle:
            'Essays on typography, attention and the craft of making things worth finishing.',
          authorName: 'Devansh Rao',
          authorBio:
            'Writer and engineer observing software craft, interface tranquility, and distributed systems.',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default settingsRouter;
