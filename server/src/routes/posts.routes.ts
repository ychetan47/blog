import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import {
  authenticate,
  optionalAuth,
  AuthenticatedRequest,
} from '../middleware/auth.middleware.js';

export const postsRouter = Router();

/**
 * Helper to compute personalized feed for a user
 */
async function computePersonalizedFeed(user: any, options: { category?: string; search?: string } = {}) {
  const { category, search } = options;

  // 1. Fetch user's followed subcategories from UserInterest
  let userSubcategoryIds: string[] = [];
  let userInterestNames: string[] = [];

  if (user) {
    const userInterests = await db.userInterest.findMany({
      where: { userId: user.id },
      include: { subcategory: true },
    });
    userSubcategoryIds = userInterests.map((ui) => ui.subcategoryId);
    userInterestNames = userInterests.map((ui) => ui.subcategory.name);

    // Fallback to user.topics string array if UserInterest is empty
    if (userSubcategoryIds.length === 0 && user.topics && user.topics.length > 0) {
      const matchingSubs = await db.subcategory.findMany({
        where: {
          OR: [
            { name: { in: user.topics, mode: 'insensitive' } },
            { slug: { in: user.topics.map((t: string) => t.toLowerCase().replace(/\s+/g, '-')) } },
          ],
        },
        select: { id: true, name: true },
      });
      userSubcategoryIds = matchingSubs.map((s) => s.id);
      userInterestNames = matchingSubs.map((s) => s.name);
    }
  }

  // 2. Build base query
  const where: any = { published: true };

  if (category && typeof category === 'string' && category !== 'all') {
    where.category = { slug: category };
  }

  if (search && typeof search === 'string') {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { subcategories: { some: { subcategory: { name: { contains: search, mode: 'insensitive' } } } } },
    ];
  }

  const allPublished = await db.post.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true, role: true },
      },
      category: true,
      subcategories: {
        include: {
          subcategory: {
            select: { id: true, name: true, slug: true, categoryId: true },
          },
        },
      },
      tags: { include: { tag: true } },
      _count: {
        select: { clapsList: true, comments: true, savedBy: true },
      },
      ...(user
        ? {
            savedBy: {
              where: { userId: user.id },
              select: { id: true },
            },
          }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
  });

  // 3. Score stories based on: story.subcategories ∩ user.interests
  const scoredPosts = allPublished.map((post) => {
    const postSubs = post.subcategories.map((ps) => ps.subcategory);
    const matchedSubs = postSubs.filter((sub) => userSubcategoryIds.includes(sub.id));
    const matchScore = matchedSubs.length;

    return {
      ...post,
      subcategories: postSubs,
      matchedSubcategories: matchedSubs.map((m) => m.name),
      matchScore,
      isPersonalized: matchScore > 0,
      isSaved: Boolean(post.savedBy && post.savedBy.length > 0),
    };
  });

  const hasInterests = userSubcategoryIds.length > 0;

  if (hasInterests && (!category || category === 'all') && !search) {
    const matchingStories = scoredPosts.filter((p) => p.matchScore > 0);
    const nonMatchingStories = scoredPosts.filter((p) => p.matchScore === 0);

    // Rank matching stories by matchScore DESC, then publishedAt DESC
    matchingStories.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    });

    // 4. Compute Pick of the Week:
    // Relevant, high engagement, recent, editorial quality, strictly EXCLUDING main feed stories
    const mainFeedIds = new Set(matchingStories.map((s) => s.id));
    const userCategoryIds = new Set(
      matchingStories.map((s) => s.categoryId || s.category?.id).filter(Boolean)
    );

    const pickCandidates = scoredPosts
      .filter((p) => !mainFeedIds.has(p.id))
      .map((story) => {
        let score = 0;
        // Domain / category alignment
        if (userCategoryIds.has(story.categoryId)) {
          score += 35;
        }
        // Engagement
        score += Math.min(30, (story.views || 0) * 0.1 + (story.claps || 0) * 0.6);
        // Featured
        if (story.featured) score += 15;
        // Recency
        const ageDays = (Date.now() - new Date(story.publishedAt || 0).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays < 14) score += 10;
        else if (ageDays < 30) score += 5;
        // Controlled freshness variance
        score += Math.random() * 5;

        return { story, score };
      });

    pickCandidates.sort((a, b) => b.score - a.score);

    // Pick 3-4 distinct stories
    const pickOfTheWeek: typeof scoredPosts = [];
    const seenPickCategories = new Set<string>();

    for (const c of pickCandidates) {
      if (pickOfTheWeek.length >= 3) break;
      const catId = c.story.categoryId || '';
      if (!seenPickCategories.has(catId) || pickCandidates.length <= 3) {
        pickOfTheWeek.push(c.story);
        seenPickCategories.add(catId);
      }
    }
    for (const c of pickCandidates) {
      if (pickOfTheWeek.length >= 3) break;
      if (!pickOfTheWeek.some((p) => p.id === c.story.id)) {
        pickOfTheWeek.push(c.story);
      }
    }

    return {
      stories: matchingStories,
      pickOfTheWeek,
      pickedForYou: pickOfTheWeek,
      moreToExplore: [], // Unrelated content must NEVER appear as an additional feed section at bottom
      personalized: matchingStories.length > 0,
      userInterests: userInterestNames,
    };
  }

  // Fallback: If no interests or filtered by category/search
  const candidatePick = [...scoredPosts]
    .sort((a, b) => (b.views + b.claps * 2) - (a.views + a.claps * 2))
    .slice(0, 3);

  return {
    stories: category || search ? scoredPosts : [],
    pickOfTheWeek: candidatePick,
    pickedForYou: candidatePick,
    moreToExplore: [],
    personalized: false,
    userInterests: userInterestNames,
  };
}

/**
 * GET /api/posts/pick-of-the-week & GET /api/stories/pick-of-the-week
 * Returns the full curated list of Pick of the Week stories for the dedicated page
 */
postsRouter.get('/pick-of-the-week', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    // Fetch user interests
    let userSubcategoryIds: string[] = [];
    if (user) {
      const interests = await db.userInterest.findMany({
        where: { userId: user.id },
        select: { subcategoryId: true },
      });
      userSubcategoryIds = interests.map((i) => i.subcategoryId);
    }

    const allPublished = await db.post.findMany({
      where: { published: true },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        category: true,
        subcategories: {
          include: {
            subcategory: { select: { id: true, name: true, slug: true, categoryId: true } },
          },
        },
        tags: { include: { tag: true } },
        _count: { select: { clapsList: true, comments: true, savedBy: true } },
        ...(user
          ? {
              savedBy: {
                where: { userId: user.id },
                select: { id: true },
              },
            }
          : {}),
      },
      orderBy: { publishedAt: 'desc' },
    });

    const userCategories = new Set<string>();
    for (const post of allPublished) {
      for (const ps of post.subcategories) {
        if (userSubcategoryIds.includes(ps.subcategory.id)) {
          userCategories.add(ps.subcategory.categoryId);
        }
      }
    }

    const scored = allPublished.map((post) => {
      const postSubs = post.subcategories.map((ps) => ps.subcategory);
      let score = (post.views || 0) * 0.1 + (post.claps || 0) * 0.6;
      if (userCategories.has(post.categoryId)) score += 30;
      if (post.featured) score += 20;

      return {
        ...post,
        subcategories: postSubs,
        tags: post.tags.map((t) => t.tag.name),
        isSaved: Boolean(post.savedBy && post.savedBy.length > 0),
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topStories = scored.slice(0, 15);

    res.json({ stories: topStories, total: topStories.length });
  } catch (error) {
    console.error('Error fetching pick-of-the-week:', error);
    res.status(500).json({ error: 'Failed to fetch Pick of the Week stories' });
  }
});

/**
 * GET /api/posts/feed & GET /api/stories/feed
 * High-level personalized content recommendation feed based on Subcategories
 */
postsRouter.get('/feed', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await computePersonalizedFeed(req.user);
    res.json(result);
  } catch (error) {
    console.error('Error in /feed:', error);
    res.status(500).json({ error: 'Failed to compute story feed' });
  }
});

/**
 * GET /api/posts
 * Retrieves published stories with subcategory match score ranking
 */
postsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    const result = await computePersonalizedFeed(req.user, {
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    res.json({
      posts: result.stories,
      stories: result.stories,
      pickedForYou: result.pickedForYou,
      moreToExplore: [],
      personalized: result.personalized,
      userInterests: result.userInterests,
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

/**
 * GET /api/posts/my-stories
 */
postsRouter.get('/my-stories', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.user!.id;

    const where: any = { authorId: userId };
    if (status === 'drafts') where.published = false;
    if (status === 'published') where.published = true;

    const posts = await db.post.findMany({
      where,
      include: {
        category: true,
        subcategories: { include: { subcategory: true } },
        _count: {
          select: { clapsList: true, comments: true, savedBy: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = posts.map((p) => ({
      ...p,
      subcategories: p.subcategories.map((ps) => ps.subcategory),
    }));

    res.json({ posts: formatted });
  } catch (error) {
    console.error('Error fetching my-stories:', error);
    res.status(500).json({ error: 'Failed to fetch author stories' });
  }
});

/**
 * POST /api/posts
 * Creates or drafts a new story with primary Category, multiple Subcategories, and Tags
 */
postsRouter.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      excerpt,
      content,
      categoryId,
      subcategoryIds,
      published = true,
      coverImage,
      tagNames,
    } = req.body;
    const userId = req.user!.id;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    // Find default category if none provided
    let catId = categoryId;
    if (!catId) {
      const firstCat = await db.category.findFirst();
      if (!firstCat) {
        res.status(400).json({ error: 'No category available.' });
        return;
      }
      catId = firstCat.id;
    }

    // Generate unique slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await db.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate reading time
    let wordCount = 0;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        wordCount = parsed.reduce((acc: number, b: any) => {
          const text = b.content || (b.items && b.items.join(' ')) || '';
          return acc + text.trim().split(/\s+/).filter(Boolean).length;
        }, 0);
      } else {
        wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      }
    } catch {
      wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    }
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        coverImage: coverImage || null,
        readingTime,
        published: Boolean(published),
        publishedAt: published ? new Date() : null,
        authorId: userId,
        categoryId: catId,
        ...(Array.isArray(subcategoryIds) && subcategoryIds.length > 0
          ? {
              subcategories: {
                create: subcategoryIds.map((subId: string) => ({
                  subcategoryId: subId,
                })),
              },
            }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: true,
        subcategories: { include: { subcategory: true } },
      },
    });

    // Handle optional tags
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      for (const t of tagNames) {
        const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: t, slug: tagSlug },
        });
        await db.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          update: {},
          create: { postId: post.id, tagId: tag.id },
        });
      }
    }

    const fullPost = await db.post.findUnique({
      where: { id: post.id },
      include: {
        category: true,
        subcategories: { include: { subcategory: true } },
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({
      post: {
        ...fullPost,
        subcategories: fullPost?.subcategories.map((ps) => ps.subcategory) || [],
        tags: fullPost?.tags.map((pt) => pt.tag.name) || [],
      },
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message || 'Failed to create story.' });
  }
});

/**
 * GET /api/posts/draft/:id
 */
postsRouter.get('/draft/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        subcategories: { include: { subcategory: true } },
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }

    if (post.authorId !== userId) {
      res.status(403).json({ error: 'You do not have permission to edit this story.' });
      return;
    }

    res.json({
      post: {
        ...post,
        subcategories: post.subcategories.map((ps) => ps.subcategory),
        tags: post.tags.map((pt) => pt.tag.name),
      },
    });
  } catch (error: any) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: error.message || 'Failed to load story.' });
  }
});

/**
 * PUT /api/posts/:id
 */
postsRouter.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const {
      title,
      excerpt,
      content,
      categoryId,
      subcategoryIds,
      published,
      coverImage,
      tagNames,
    } = req.body;

    const existing = await db.post.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }

    if (existing.authorId !== userId) {
      res.status(403).json({ error: 'You do not have permission to edit this story.' });
      return;
    }

    // Helper to calculate reading time
    let wordCount = 0;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          wordCount = parsed.reduce((acc: number, b: any) => {
            const text = b.content || (b.items && b.items.join(' ')) || '';
            return acc + text.trim().split(/\s+/).filter(Boolean).length;
          }, 0);
        } else {
          wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        }
      } catch {
        wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      }
    }
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readingTime = readingTime;
    }
    if (categoryId) updateData.categoryId = categoryId;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    if (published !== undefined) {
      updateData.published = Boolean(published);
      if (published && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Sync subcategories if provided
    if (Array.isArray(subcategoryIds)) {
      await db.storySubcategory.deleteMany({ where: { postId: id } });
      if (subcategoryIds.length > 0) {
        await db.storySubcategory.createMany({
          data: subcategoryIds.map((subId: string) => ({
            postId: id,
            subcategoryId: subId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Sync tags if provided
    if (Array.isArray(tagNames)) {
      await db.postTag.deleteMany({ where: { postId: id } });
      for (const t of tagNames) {
        const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: t, slug: tagSlug },
        });
        await db.postTag.create({
          data: { postId: id, tagId: tag.id },
        });
      }
    }

    const refreshed = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        subcategories: { include: { subcategory: true } },
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.json({
      post: {
        ...refreshed,
        subcategories: refreshed?.subcategories.map((ps) => ps.subcategory) || [],
        tags: refreshed?.tags.map((pt) => pt.tag.name) || [],
      },
    });
  } catch (error: any) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: error.message || 'Failed to update story.' });
  }
});

/**
 * GET /api/posts/:slug
 * Retrieves full story by slug with subcategories and category hierarchy
 */
postsRouter.get('/:slug', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const user = req.user;

    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true, bio: true },
        },
        category: true,
        subcategories: {
          include: {
            subcategory: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        tags: { include: { tag: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        _count: {
          select: { clapsList: true, comments: true, savedBy: true },
        },
        ...(user
          ? {
              savedBy: {
                where: { userId: user.id },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    // Increment views quietly
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    res.json({
      post: {
        ...post,
        subcategories: post.subcategories.map((ps) => ps.subcategory),
        tags: post.tags.map((pt) => pt.tag.name),
        isSaved: Boolean(post.savedBy && post.savedBy.length > 0),
      },
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

/**
 * POST /api/posts/:id/clap
 */
postsRouter.post('/:id/clap', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { count = 1 } = req.body;
    const addCount = Math.min(Math.max(Number(count) || 1, 1), 10);

    const post = await db.post.update({
      where: { id: postId },
      data: { claps: { increment: addCount } },
      select: { claps: true },
    });

    if (req.user) {
      await db.storyClap.upsert({
        where: { userId_postId: { userId: req.user.id, postId } },
        update: { count: { increment: addCount } },
        create: { userId: req.user.id, postId, count: addCount },
      }).catch(() => {});
    }

    res.json({ claps: post.claps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clap' });
  }
});

/**
 * POST /api/posts/:id/save
 */
postsRouter.post('/:id/save', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const userId = req.user!.id;

    const existing = await db.savedStory.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await db.savedStory.delete({
        where: { id: existing.id },
      });
      res.json({ saved: false });
    } else {
      await db.savedStory.create({
        data: { userId, postId },
      });
      res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle save story' });
  }
});

/**
 * GET /api/posts/:id/comments & POST /api/posts/:id/comments
 */
postsRouter.get('/:id/comments', async (req, res): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const comments = await db.storyComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

postsRouter.post('/:id/comments', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;
    const user = req.user!;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment cannot be empty.' });
      return;
    }

    const comment = await db.storyComment.create({
      data: {
        postId,
        userId: user.id,
        authorName: user.name,
        authorAvatar: user.avatarUrl,
        content: content.trim(),
      },
    });

    res.status(201).json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to post comment.' });
  }
});

export default postsRouter;
