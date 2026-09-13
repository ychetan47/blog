"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, setUserSession, clearUserSession, getUserSession } from "@/lib/auth";

export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please enter your name, email, and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Please sign in." };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "READER",
      topics: [],
    },
  });

  await setUserSession(user.id);
  redirect("/onboarding");
}

export async function continueWithGoogleAction(
  email: string,
  name?: string,
  isSignUp: boolean = false
) {
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { error: "Please provide a valid Google email address." };
  }

  const cleanName =
    name?.trim() ||
    normalizedEmail
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  let user = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    const passwordHash = await hashPassword(`google-oauth-${Date.now()}`);
    user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: cleanName,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        passwordHash,
        role: "READER",
        topics: [],
      },
    });
  }

  await setUserSession(user.id);

  if (isSignUp || !user.topics || user.topics.length === 0) {
    redirect("/onboarding");
  }

  redirect("/");
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account found with this email." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid password. Please check your credentials." };
  }

  await setUserSession(user.id);

  // If user has not chosen topics yet, take them to onboarding
  if (!user.topics || user.topics.length === 0) {
    redirect("/onboarding");
  }

  redirect("/");
}

export async function logoutAction() {
  await clearUserSession();
  redirect("/login");
}

export async function saveTopicsAction(topics: string[]) {
  const user = await getUserSession();
  if (!user) {
    return { error: "Please sign in first." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { topics },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}

export async function toggleSaveStoryAction(postId: string) {
  const user = await getUserSession();
  if (!user) {
    return { error: "UNAUTHORIZED", requiresLogin: true };
  }

  const existing = await db.savedStory.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  });

  if (existing) {
    await db.savedStory.delete({
      where: { id: existing.id },
    });
  } else {
    await db.savedStory.create({
      data: {
        userId: user.id,
        postId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath(`/blog/${postId}`);
  return { saved: !existing };
}

export async function clapStoryAction(postId: string) {
  const user = await getUserSession();
  const userId = user?.id || "guest";

  const updated = await db.post.update({
    where: { id: postId },
    data: { claps: { increment: 1 } },
  });

  revalidatePath("/");
  revalidatePath(`/blog/${postId}`);
  return { claps: updated.claps };
}

export async function repostStoryAction(postId: string) {
  const user = await getUserSession();
  if (!user) return { requiresLogin: true };

  const existing = await db.storyRepost.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  });

  let reposted = false;
  let increment = 1;
  if (existing) {
    await db.storyRepost.delete({ where: { id: existing.id } });
    increment = -1;
    reposted = false;
  } else {
    await db.storyRepost.create({
      data: {
        userId: user.id,
        postId,
      },
    });
    reposted = true;
  }

  const updated = await db.post.update({
    where: { id: postId },
    data: { reposts: { increment } },
  });

  revalidatePath("/");
  return { reposted, reposts: updated.reposts };
}

export async function addCommentAction(postId: string, content: string) {
  const user = await getUserSession();
  if (!user) return { error: "Please sign in to join the conversation." };

  if (!content.trim()) return { error: "Comment cannot be empty." };

  const comment = await db.storyComment.create({
    data: {
      postId,
      userId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      content: content.trim(),
    },
  });

  revalidatePath(`/blog/${postId}`);
  return { success: true, comment };
}
