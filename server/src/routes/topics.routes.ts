import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import { optionalAuth, authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const topicsRouter = Router();

/**
 * GET /api/topics
 * Returns all available topics/subcategories flat and grouped by publication category
 */
topicsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const userId = req.user?.id;

    const where: any = {};
    if (category && typeof category === 'string' && category !== 'all') {
      where.category = { slug: category };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subcategories, categoriesWithSubs, userInterests] = await Promise.all([
      db.subcategory.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
          _count: {
            select: {
              storySubcategories: {
                where: { post: { published: true } },
              },
              userInterests: true,
            },
          },
        },
        orderBy: [{ name: 'asc' }],
      }),
      db.category.findMany({
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
      }),
      userId
        ? db.userInterest.findMany({
            where: { userId },
            select: { subcategoryId: true },
          })
        : Promise.resolve([]),
    ]);

    const userFollowedIds = new Set(userInterests.map((i) => i.subcategoryId));

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
      isFollowing: userFollowedIds.has(sub.id),
    }));

    const groupedCategories = categoriesWithSubs.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      topics: cat.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        storyCount: s._count.storySubcategories,
        isFollowing: userFollowedIds.has(s.id),
      })),
    }));

    res.json({
      topics: formatted,
      categories: groupedCategories,
    });
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

/**
 * GET /api/topics/recommended
 * Returns 4–6 personalized topic recommendations dynamically computed
 */
topicsRouter.get('/recommended', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // 1. Fetch all topics with counts and category
    const allTopics = await db.subcategory.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            storySubcategories: { where: { post: { published: true } } },
            userInterests: true,
          },
        },
      },
    });

    // 2. Fetch user's followed topics if logged in
    let followedSubcategoryIds: string[] = [];
    if (userId) {
      const interests = await db.userInterest.findMany({
        where: { userId },
        select: { subcategoryId: true },
      });
      followedSubcategoryIds = interests.map((i) => i.subcategoryId);
    }

    const followedSet = new Set(followedSubcategoryIds);

    // Identify user's followed categories
    const followedCategories = new Set<string>();
    for (const subId of followedSubcategoryIds) {
      const found = allTopics.find((t) => t.id === subId);
      if (found) followedCategories.add(found.categoryId);
    }

    // Filter to candidates that the user DOES NOT follow yet
    const unfollowedTopics = allTopics.filter((t) => !followedSet.has(t.id));

    // Scoring candidates:
    // +10 if belongs to a category user follows
    // +storyCount * 0.1 for topic vitality
    // +followerCount * 0.2
    const scoredCandidates = unfollowedTopics.map((topic) => {
      let score = topic._count.storySubcategories + topic._count.userInterests * 2;
      if (followedCategories.has(topic.categoryId)) {
        score += 25; // boost topics in domains user loves
      }
      return { topic, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick top 5 topics (maximum 6)
    let selected = scoredCandidates.slice(0, 5).map((c) => c.topic);

    // Fallback if user already follows almost everything or no unfollowed topics
    if (selected.length < 4) {
      const remaining = allTopics
        .sort((a, b) => b._count.storySubcategories - a._count.storySubcategories)
        .slice(0, 5);
      selected = remaining;
    }

    const formatted = selected.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      categoryId: sub.categoryId,
      categoryName: sub.category.name,
      categorySlug: sub.category.slug,
      storyCount: sub._count.storySubcategories,
      followerCount: sub._count.userInterests,
      isFollowing: followedSet.has(sub.id),
    }));

    res.json({ topics: formatted });
  } catch (error: any) {
    console.error('Error fetching recommended topics:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * GET /api/topics/:slug
 * Retrieves metadata for a specific topic
 */
topicsRouter.get('/:slug', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const topic = await db.subcategory.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        _count: {
          select: {
            storySubcategories: { where: { post: { published: true } } },
            userInterests: true,
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    let isFollowing = false;
    if (userId) {
      const exists = await db.userInterest.findUnique({
        where: {
          userId_subcategoryId: {
            userId,
            subcategoryId: topic.id,
          },
        },
      });
      isFollowing = Boolean(exists);
    }

    res.json({
      topic: {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        categoryId: topic.categoryId,
        categoryName: topic.category.name,
        categorySlug: topic.category.slug,
        categoryColor: topic.category.color,
        storyCount: topic._count.storySubcategories,
        followerCount: topic._count.userInterests,
        isFollowing,
      },
    });
  } catch (error: any) {
    console.error('Error fetching topic by slug:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

/**
 * GET /api/topics/:slug/stories
 * Retrieves stories associated with the specified topic (many-to-many)
 */
topicsRouter.get('/:slug/stories', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { sort = 'latest', page = '1', limit = '20' } = req.query;
    const userId = req.user?.id;

    const topic = await db.subcategory.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        _count: {
          select: {
            storySubcategories: { where: { post: { published: true } } },
            userInterests: true,
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    // Determine sort ordering
    const orderBy: any =
      sort === 'popular'
        ? [{ views: 'desc' }, { claps: 'desc' }, { publishedAt: 'desc' }]
        : [{ publishedAt: 'desc' }];

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    // Many-to-many query via storySubcategories join table
    const storySubcategories = await db.storySubcategory.findMany({
      where: {
        subcategoryId: topic.id,
        post: { published: true },
      },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true, role: true } },
            category: true,
            subcategories: {
              include: {
                subcategory: { select: { id: true, name: true, slug: true } },
              },
            },
            tags: { include: { tag: true } },
            _count: {
              select: { clapsList: true, comments: true, savedBy: true },
            },
            ...(userId
              ? {
                  savedBy: {
                    where: { userId },
                    select: { id: true },
                  },
                }
              : {}),
          },
        },
      },
      skip,
      take,
    });

    const posts = storySubcategories.map((item) => {
      const p = item.post;
      return {
        ...p,
        subcategories: p.subcategories.map((ps) => ps.subcategory),
        tags: p.tags.map((pt) => pt.tag.name),
        isSaved: Boolean(p.savedBy && p.savedBy.length > 0),
      };
    });

    // Apply sorting in-memory if needed
    if (sort === 'popular') {
      posts.sort((a, b) => b.views + b.claps * 2 - (a.views + a.claps * 2));
    } else {
      posts.sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
    }

    let isFollowing = false;
    if (userId) {
      const exists = await db.userInterest.findUnique({
        where: {
          userId_subcategoryId: {
            userId,
            subcategoryId: topic.id,
          },
        },
      });
      isFollowing = Boolean(exists);
    }

    res.json({
      topic: {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        categoryId: topic.categoryId,
        categoryName: topic.category.name,
        categorySlug: topic.category.slug,
        categoryColor: topic.category.color,
        storyCount: topic._count.storySubcategories,
        followerCount: topic._count.userInterests,
        isFollowing,
      },
      stories: posts,
      totalStories: topic._count.storySubcategories,
    });
  } catch (error: any) {
    console.error('Error fetching stories for topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic stories' });
  }
});

/**
 * POST /api/topics/:id/follow
 * Follows a topic (creates UserInterest and syncs user.topics)
 */
topicsRouter.post('/:id/follow', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const topic = await db.subcategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    // Insert user interest
    await db.userInterest.upsert({
      where: {
        userId_subcategoryId: {
          userId,
          subcategoryId: topic.id,
        },
      },
      update: {},
      create: {
        userId,
        subcategoryId: topic.id,
      },
    });

    // Sync user.topics array
    const allInterests = await db.userInterest.findMany({
      where: { userId },
      include: { subcategory: { select: { name: true } } },
    });

    const updatedTopics = allInterests.map((i) => i.subcategory.name);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { topics: updatedTopics },
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
      success: true,
      isFollowing: true,
      topic: {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
      },
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error following topic:', error);
    res.status(500).json({ error: 'Failed to follow topic' });
  }
});

/**
 * DELETE /api/topics/:id/follow
 * Unfollows a topic (deletes UserInterest and syncs user.topics)
 */
topicsRouter.delete('/:id/follow', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const topic = await db.subcategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    // Delete user interest
    await db.userInterest.deleteMany({
      where: {
        userId,
        subcategoryId: topic.id,
      },
    });

    // Sync user.topics array
    const allInterests = await db.userInterest.findMany({
      where: { userId },
      include: { subcategory: { select: { name: true } } },
    });

    const updatedTopics = allInterests.map((i) => i.subcategory.name);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { topics: updatedTopics },
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
      success: true,
      isFollowing: false,
      topic: {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
      },
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error unfollowing topic:', error);
    res.status(500).json({ error: 'Failed to unfollow topic' });
  }
});

export default topicsRouter;
