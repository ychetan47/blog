import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db.js';

export const categoriesRouter = Router();

// GET /api/categories - list all categories with post count
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default categoriesRouter;
