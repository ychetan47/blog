"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyPassword, setAdminSession, clearAdminSession, getAdminSession } from "@/lib/auth";
import { slugify, calculateReadingTime } from "@/lib/utils";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter email and password" };
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || user.role !== "ADMIN") {
    return { error: "Invalid admin credentials" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid password" };
  }

  await setAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

// Post Actions
export async function savePostAction(prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  let slug = (formData.get("slug") as string)?.trim();
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const illustration = (formData.get("illustration") as string) || "astronaut";
  const coverImage = (formData.get("coverImage") as string) || null;
  const rawTags = (formData.get("tags") as string) || "";
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  if (!title || !content || !categoryId) {
    return { error: "Title, content, and category are required" };
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  const readingTime = calculateReadingTime(content);

  // Parse tags comma-separated
  const tagNames = rawTags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  try {
    let post;
    if (id) {
      // Update existing post
      post = await db.post.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content,
          categoryId,
          illustration,
          coverImage,
          readingTime,
          published,
          featured,
        },
      });

      // Clear existing tags and re-attach
      await db.postTag.deleteMany({ where: { postId: id } });
    } else {
      // Create new post
      post = await db.post.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          categoryId,
          illustration,
          coverImage,
          readingTime,
          published,
          featured,
          authorId: session.id,
        },
      });
    }

    // Connect tags
    for (const name of tagNames) {
      const tagSlug = slugify(name);
      let tag = await db.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await db.tag.create({ data: { name, slug: tagSlug } });
      }
      await db.postTag.create({
        data: {
          postId: post.id,
          tagId: tag.id,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/posts");
  } catch (err: any) {
    console.error("Failed to save post", err);
    if (err.code === "P2002") {
      return { error: "An article with this slug already exists. Please choose a unique slug." };
    }
    return { error: "Failed to save post: " + err.message };
  }

  redirect("/admin/posts");
}

export async function togglePublishAction(id: string, currentPublished: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.post.update({
    where: { id },
    data: { published: !currentPublished },
  });

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/admin/posts");
}

export async function deletePostAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/admin/posts");
}

// Category Actions
export async function createCategoryAction(prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = (formData.get("color") as string) || "#D9E8FC";

  if (!name) return { error: "Category name is required" };
  const slug = slugify(name);

  try {
    await db.category.create({
      data: { name, slug, description, color },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/blogs");
  } catch (err: any) {
    return { error: "Category creation failed: " + err.message };
  }

  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// Tag Actions
export async function createTagAction(prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name) return { error: "Tag name is required" };
  const slug = slugify(name);

  try {
    await db.tag.create({ data: { name, slug } });
    revalidatePath("/admin/tags");
    revalidatePath("/blogs");
  } catch (err: any) {
    return { error: "Tag creation failed: " + err.message };
  }

  return { success: true };
}

export async function deleteTagAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}

// Settings Action
export async function updateSettingsAction(prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const authorName = formData.get("authorName") as string;
  const authorBio = formData.get("authorBio") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const twitterUrl = formData.get("twitterUrl") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;

  try {
    await db.settings.upsert({
      where: { id: "default" },
      update: {
        heroTitle,
        heroSubtitle,
        authorName,
        authorBio,
        avatarUrl,
        githubUrl,
        twitterUrl,
        linkedinUrl,
      },
      create: {
        id: "default",
        heroTitle,
        heroSubtitle,
        authorName,
        authorBio,
        avatarUrl,
        githubUrl,
        twitterUrl,
        linkedinUrl,
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update settings: " + err.message };
  }
}
