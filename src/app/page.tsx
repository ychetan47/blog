import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { HomeView } from "@/components/home-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUserSession();

  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    include: {
      category: true,
      tags: { include: { tag: true } },
      author: {
        select: { name: true, avatarUrl: true },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          authorName: true,
          authorAvatar: true,
          content: true,
          createdAt: true,
        },
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

  const stories = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    readingTime: p.readingTime,
    publishedAt: p.publishedAt,
    claps: p.claps,
    reposts: p.reposts,
    author: p.author,
    category: p.category,
    tags: p.tags,
    comments: p.comments,
    isSaved: Boolean(p.savedBy && p.savedBy.length > 0),
  }));

  return (
    <HomeView
      stories={stories}
      userTopics={user?.topics || []}
      userName={user?.name}
    />
  );
}
