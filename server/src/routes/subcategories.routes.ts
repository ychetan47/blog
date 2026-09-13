import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const subcategoriesRouter = Router();

/**
 * GET /api/subcategories
 * Returns subcategories grouped by category or as a list with story counts
 */
subcategoriesRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category && typeof category === 'string') {
      where.category = { slug: category };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const subcategories = await db.subcategory.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        _count: {
          select: {
            storySubcategories: {
              where: {
                post: { published: true },
              },
            },
            userInterests: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    const formatted = subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      categoryId: sub.categoryId,
      categoryName: sub.category.name,
      categorySlug: sub.category.slug,
      storyCount: sub._count.storySubcategories,
      followerCount: sub._count.userInterests,
    }));

    // Also build grouped by category for ease of onboarding/authoring
    const categoriesWithSubs = await db.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            _count: {
              select: {
                storySubcategories: { where: { post: { published: true } } },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      subcategories: formatted,
      categories: categoriesWithSubs.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        subcategories: cat.subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          storyCount: s._count.storySubcategories,
        })),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});
