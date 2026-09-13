import React from "react";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { StoriesView } from "@/components/stories-view";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const user = await getUserSession();

  // Fetch all posts for the author (or all posts if viewing overview)
  const posts = await db.post.findMany({
    where: user ? { authorId: user.id } : {},
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <StoriesView
      initialStories={posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        readingTime: p.readingTime,
        published: p.published,
        views: p.views,
        claps: p.claps,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        category: p.category,
      }))}
      userName={user?.name}
    />
  );
}
