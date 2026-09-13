import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const USER_SESSION_COOKIE = "themargin_session";
const ADMIN_SESSION_COOKIE = "blog_admin_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setUserSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  // Also set admin session for compatibility
  cookieStore.set(ADMIN_SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE);
  if (!sessionCookie?.value) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: sessionCookie.value },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        topics: true,
        _count: {
          select: { savedStories: true },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const user = await getUserSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export const setAdminSession = setUserSession;
export const clearAdminSession = clearUserSession;
