import { Router, Response } from 'express';
import { prisma } from '../lib/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

export const listsRouter = Router();

/**
 * Helper: Ensures the user has at least one default "Reading list".
 * If not, creates it and migrates any existing SavedStory records into it.
 */
async function ensureDefaultReadingList(userId: string) {
  const count = await prisma.readingList.count({
    where: { userId },
  });

  if (count === 0) {
    const defaultList = await prisma.readingList.create({
      data: {
        name: 'Reading list',
        description: 'Stories saved for quiet, undisturbed reading.',
        isPrivate: true,
        userId,
      },
    });

    // Migrate any existing SavedStory entries into this default list
    const existingSaved = await prisma.savedStory.findMany({
      where: { userId },
      select: { postId: true, createdAt: true },
    });

    if (existingSaved.length > 0) {
      await prisma.readingListItem.createMany({
        data: existingSaved.map((s) => ({
          listId: defaultList.id,
          postId: s.postId,
          createdAt: s.createdAt,
        })),
        skipDuplicates: true,
      });
    }

    return defaultList;
  }
}

/**
 * GET /api/lists
 * Returns all reading lists belonging to the authenticated user
 */
listsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await ensureDefaultReadingList(userId);

    const lists = await prisma.readingList.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        items: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            post: {
              select: {
                coverImage: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    const formattedLists = lists.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      isPrivate: list.isPrivate,
      userId: list.userId,
      storyCount: list._count.items,
      previewCovers: list.items.map((i) => i.post.coverImage).filter(Boolean),
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    }));

    res.json({ lists: formattedLists });
  } catch (error) {
    console.error('Error fetching reading lists:', error);
    res.status(500).json({ error: 'Failed to fetch reading lists' });
  }
});

/**
 * POST /api/lists
 * Creates a new reading list
 */
listsRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, description, isPrivate } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'List name is required' });
      return;
    }

    const newList = await prisma.readingList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : true,
        userId,
      },
      include: {
        _count: { select: { items: true } },
      },
    });

    res.status(201).json({
      list: {
        id: newList.id,
        name: newList.name,
        description: newList.description,
        isPrivate: newList.isPrivate,
        userId: newList.userId,
        storyCount: 0,
        previewCovers: [],
        createdAt: newList.createdAt.toISOString(),
        updatedAt: newList.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating reading list:', error);
    res.status(500).json({ error: 'Failed to create reading list' });
  }
});

/**
 * GET /api/lists/story/:postId
 * Returns all user's lists and whether the specified post is currently in each
 */
listsRouter.get('/story/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;
    await ensureDefaultReadingList(userId);

    const userLists = await prisma.readingList.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        items: {
          where: { postId },
          select: { id: true },
        },
      },
    });

    const statuses = userLists.map((l) => ({
      listId: l.id,
      listName: l.name,
      isPrivate: l.isPrivate,
      isInList: l.items.length > 0,
    }));

    res.json({ lists: statuses });
  } catch (error) {
    console.error('Error fetching story list statuses:', error);
    res.status(500).json({ error: 'Failed to fetch story list statuses' });
  }
});

/**
 * POST /api/lists/story/:postId/sync
 * Sets which lists contain this story (multi-select sync)
 */
listsRouter.post('/story/:postId/sync', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;
    const { listIds } = req.body;

    if (!Array.isArray(listIds)) {
      res.status(400).json({ error: 'listIds must be an array of string IDs' });
      return;
    }

    // Verify all requested lists belong to the authenticated user
    const userLists = await prisma.readingList.findMany({
      where: { userId },
      select: { id: true },
    });
    const userListIdSet = new Set(userLists.map((l) => l.id));
    const validListIds = listIds.filter((id: string) => userListIdSet.has(id));

    // Remove post from user's lists not in validListIds
    await prisma.readingListItem.deleteMany({
      where: {
        postId,
        listId: { in: Array.from(userListIdSet), notIn: validListIds },
      },
    });

    // Add post to lists in validListIds
    for (const listId of validListIds) {
      await prisma.readingListItem.upsert({
        where: { listId_postId: { listId, postId } },
        update: {},
        create: { listId, postId },
      });
    }

    // Sync with legacy SavedStory to keep general isSaved indicators accurate
    if (validListIds.length > 0) {
      await prisma.savedStory.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
      });
    } else {
      await prisma.savedStory.deleteMany({
        where: { userId, postId },
      });
    }

    res.json({
      success: true,
      saved: validListIds.length > 0,
      listIds: validListIds,
    });
  } catch (error) {
    console.error('Error syncing story lists:', error);
    res.status(500).json({ error: 'Failed to sync story lists' });
  }
});

/**
 * GET /api/lists/:id
 * Returns a specific reading list with its full stories
 */
listsRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const list = await prisma.readingList.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            post: {
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
                savedBy: {
                  where: { userId },
                  select: { id: true },
                },
                repostsList: {
                  where: { userId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!list) {
      res.status(404).json({ error: 'Reading list not found' });
      return;
    }

    if (list.isPrivate && list.userId !== userId) {
      res.status(403).json({ error: 'This reading list is private' });
      return;
    }

    const stories = list.items
      .filter((i) => i.post && i.post.published)
      .map((i) => {
        const p = i.post;
        return {
          ...p,
          isSaved: true,
          isReposted: (p.repostsList?.length ?? 0) > 0,
          subcategories: p.subcategories.map((ps) => ps.subcategory),
          tags: p.tags.map((t) => t.tag.name),
          savedCount: p._count.savedBy,
          commentsCount: p._count.comments,
        };
      });

    res.json({
      list: {
        id: list.id,
        name: list.name,
        description: list.description,
        isPrivate: list.isPrivate,
        userId: list.userId,
        author: list.user,
        storyCount: stories.length,
        previewCovers: stories.map((s) => s.coverImage).filter(Boolean).slice(0, 3),
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        stories,
      },
    });
  } catch (error) {
    console.error('Error fetching list details:', error);
    res.status(500).json({ error: 'Failed to fetch list details' });
  }
});

/**
 * PUT /api/lists/:id
 * Updates list name, description, or privacy
 */
listsRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, isPrivate } = req.body;

    const existing = await prisma.readingList.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to edit this list' });
      return;
    }

    const updated = await prisma.readingList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isPrivate !== undefined && { isPrivate: Boolean(isPrivate) }),
      },
    });

    res.json({ list: updated });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

/**
 * DELETE /api/lists/:id
 * Deletes a reading list
 */
listsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.readingList.findUnique({
      where: { id },
      select: { userId: true, name: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this list' });
      return;
    }

    await prisma.readingList.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Reading list deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

/**
 * DELETE /api/lists/:id/stories/:postId
 * Removes a story from a specific list
 */
listsRouter.delete('/:id/stories/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: listId, postId } = req.params;

    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      select: { userId: true },
    });

    if (!list || list.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.readingListItem.deleteMany({
      where: { listId, postId },
    });

    // Check if post is in any other of the user's lists
    const remainingInOtherLists = await prisma.readingListItem.count({
      where: {
        postId,
        list: { userId },
      },
    });

    if (remainingInOtherLists === 0) {
      await prisma.savedStory.deleteMany({
        where: { userId, postId },
      });
    }

    res.json({ success: true, remainingInOtherLists });
  } catch (error) {
    console.error('Error removing story from list:', error);
    res.status(500).json({ error: 'Failed to remove story from list' });
  }
});

export default listsRouter;
