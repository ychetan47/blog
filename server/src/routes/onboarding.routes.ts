import { Router, Request, Response } from 'express';
import { db } from '../lib/db.js';

export const onboardingRouter = Router();

const CATEGORY_COLORS: Record<string, { border: string; active: string }> = {
  Technology: { border: 'border-[#D0E1F9]', active: 'border-[#2563EB]' },
  Programming: { border: 'border-[#D1F0DE]', active: 'border-[#059669]' },
  Wellness: { border: 'border-[#FCD7E4]', active: 'border-[#DB2777]' },
  Life: { border: 'border-[#FCE5B8]', active: 'border-[#D97706]' },
  Society: { border: 'border-[#D5E3F8]', active: 'border-[#2563EB]' },
  Culture: { border: 'border-[#E3DAFC]', active: 'border-[#7C3AED]' },
  Business: { border: 'border-[#CCEAF5]', active: 'border-[#0284C7]' },
  Design: { border: 'border-[#D0E1F9]', active: 'border-[#2563EB]' },
  Craft: { border: 'border-[#FEF2D6]', active: 'border-[#D97706]' },
};

// GET /api/onboarding/categories - serves database subcategories grouped by category
onboardingRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categoriesFromDb = await db.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    if (categoriesFromDb.length > 0) {
      const formatted = categoriesFromDb
        .filter((cat) => cat.subcategories.length > 0)
        .map((cat) => {
          const colors = CATEGORY_COLORS[cat.name] || {
            border: 'border-[#DDD9D0]',
            active: 'border-[#211E1A]',
          };
          return {
            id: cat.id,
            name: cat.name,
            borderColor: colors.border,
            activeBorderColor: colors.active,
            topics: cat.subcategories.map((sub) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              storyCount:
                sub._count.storySubcategories > 0
                  ? `${sub._count.storySubcategories}`
                  : undefined,
            })),
          };
        });

      res.json({
        categories: formatted,
        minRequired: 3,
        title: 'What would you like to read?',
        subtitle: 'Choose 3 topics or more to personalize your publication feed.',
      });
      return;
    }

    res.json({
      categories: [],
      minRequired: 3,
      title: 'What would you like to read?',
      subtitle: 'Choose 3 topics or more to personalize your publication feed.',
    });
  } catch (error) {
    console.error('Error in /onboarding/categories:', error);
    res.status(500).json({ error: 'Failed to load onboarding categories' });
  }
});

export default onboardingRouter;
