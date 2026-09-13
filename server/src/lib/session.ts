import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

export const SESSION_COOKIE_NAME = 'themargin_session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

/**
 * Creates an authenticated session in PostgreSQL
 */
export async function createSession(
  userId: string,
  tokens?: { accessToken?: string; refreshToken?: string }
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_COOKIE_OPTIONS.maxAge);

  await db.session.create({
    data: {
      sessionToken,
      userId,
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      expiresAt,
    },
  });

  return sessionToken;
}

/**
 * Validates a session token from the database
 */
export async function validateSession(sessionToken: string) {
  if (!sessionToken || typeof sessionToken !== 'string') {
    return null;
  }

  const session = await db.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          googleId: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          bio: true,
          topics: true,
          _count: {
            select: {
              savedStories: true,
              posts: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    ...session.user,
    sessionId: session.id,
    savedCount: session.user._count.savedStories,
    storiesCount: session.user._count.posts,
  };
}

/**
 * Destroys a session in the database
 */
export async function destroySession(sessionToken: string): Promise<void> {
  if (!sessionToken) return;
  await db.session.deleteMany({
    where: { sessionToken },
  }).catch(() => {});
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
