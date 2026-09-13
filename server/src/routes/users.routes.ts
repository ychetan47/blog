import { Router, Response } from 'express';
import { prisma } from '../lib/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

export const usersRouter = Router();

/**
 * GET /api/users/interests
 * Retrieves subcategory interests followed by the authenticated user
 */
usersRouter.get('/interests', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const interests = await prisma.userInterest.findMany({
      where: { userId: req.user!.id },
      include: {
        subcategory: {
          include: {
            category: { select: { id: true, name: true, slug: true, color: true } },
          },
        },
      },
      orderBy: { subcategory: { name: 'asc' } },
    });

    res.json({
      interests: interests.map((item) => ({
        id: item.subcategory.id,
        name: item.subcategory.name,
        slug: item.subcategory.slug,
        description: item.subcategory.description,
        categoryId: item.subcategory.categoryId,
        category: item.subcategory.category,
      })),
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    res.status(500).json({ error: 'Failed to fetch user interests' });
  }
});

/**
 * PUT /api/users/interests
 * Updates subcategory interests followed by the authenticated user
 * Accepts subcategoryIds (array of IDs) or subcategories (array of names/slugs)
 */
usersRouter.put('/interests', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subcategoryIds, subcategories } = req.body;
    const userId = req.user!.id;

    let targetSubcategoryRecords: Array<{ id: string; name: string }> = [];

    if (Array.isArray(subcategoryIds) && subcategoryIds.length > 0) {
      targetSubcategoryRecords = await prisma.subcategory.findMany({
        where: { id: { in: subcategoryIds } },
        select: { id: true, name: true },
      });
    } else if (Array.isArray(subcategories) && subcategories.length > 0) {
      targetSubcategoryRecords = await prisma.subcategory.findMany({
        where: {
          OR: [
            { name: { in: subcategories, mode: 'insensitive' } },
            { slug: { in: subcategories.map((s: string) => s.toLowerCase().replace(/\s+/g, '-')) } },
          ],
        },
        select: { id: true, name: true },
      });

      // If user typed a custom topic not yet in subcategory table, create it
      const existingNames = new Set(targetSubcategoryRecords.map((s) => s.name.toLowerCase()));
      const missingNames = subcategories.filter((s: string) => !existingNames.has(s.trim().toLowerCase()));

      if (missingNames.length > 0) {
        let defaultCategory = await prisma.category.findFirst({
          where: { slug: 'technology' },
        });
        if (!defaultCategory) {
          defaultCategory = await prisma.category.findFirst();
        }

        if (defaultCategory) {
          for (const name of missingNames) {
            const cleanName = name.trim();
            if (!cleanName) continue;
            const slug = cleanName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            const created = await prisma.subcategory.upsert({
              where: { slug: slug || `custom-${Date.now()}` },
              update: {},
              create: {
                name: cleanName,
                slug: slug || `custom-${Date.now()}`,
                categoryId: defaultCategory.id,
              },
              select: { id: true, name: true },
            });
            targetSubcategoryRecords.push(created);
          }
        }
      }
    }

    // Atomic transaction: delete previous interests and insert new ones
    await prisma.$transaction([
      prisma.userInterest.deleteMany({ where: { userId } }),
      ...(targetSubcategoryRecords.length > 0
        ? [
            prisma.userInterest.createMany({
              data: targetSubcategoryRecords.map((sub) => ({
                userId,
                subcategoryId: sub.id,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
      // Also sync user.topics string array for backward compatibility
      prisma.user.update({
        where: { id: userId },
        data: {
          topics: targetSubcategoryRecords.map((s) => s.name),
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        topics: true,
      },
    });

    res.json({
      message: 'Interests updated successfully',
      interests: targetSubcategoryRecords,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user interests:', error);
    res.status(500).json({ error: 'Failed to update interests' });
  }
});

/**
 * PUT /api/users/topics
 * Legacy endpoint maintained for backward compatibility, automatically synced with UserInterest
 */
usersRouter.put('/topics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { topics } = req.body;
    if (!Array.isArray(topics)) {
      return res.status(400).json({ error: 'Topics must be an array of strings' });
    }

    const userId = req.user!.id;

    // Find matching subcategories
    const matchingSubs = await prisma.subcategory.findMany({
      where: {
        OR: [
          { name: { in: topics, mode: 'insensitive' } },
          { slug: { in: topics.map((t: string) => t.toLowerCase().replace(/\s+/g, '-')) } },
        ],
      },
      select: { id: true, name: true },
    });

    await prisma.$transaction([
      prisma.userInterest.deleteMany({ where: { userId } }),
      ...(matchingSubs.length > 0
        ? [
            prisma.userInterest.createMany({
              data: matchingSubs.map((sub) => ({
                userId,
                subcategoryId: sub.id,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
      prisma.user.update({
        where: { id: userId },
        data: { topics },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        topics: true,
      },
    });

    return res.json({ user: updatedUser, message: 'Topics updated successfully' });
  } catch (error) {
    console.error('Error updating topics:', error);
    return res.status(500).json({ error: 'Failed to update topics' });
  }
});

/**
 * GET /api/users/profile
 */
usersRouter.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        github: true,
        twitter: true,
        linkedin: true,
        topics: true,
        createdAt: true,
        interests: {
          include: {
            subcategory: {
              include: { category: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            savedStories: true,
            comments: true,
            claps: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      profile: {
        ...user,
        savedCount: user._count.savedStories,
        storiesCount: user._count.posts,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 */
usersRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, github, twitter, linkedin, avatarUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(github !== undefined && { github }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        github: true,
        twitter: true,
        linkedin: true,
        topics: true,
      },
    });

    res.json({ profile: updated, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default usersRouter;
