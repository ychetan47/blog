import { db } from "@/lib/db";
import { BlogsCatalog } from "@/components/blogs-catalog";

export const dynamic = "force-dynamic";

interface BlogsPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    q?: string;
  }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const { category, tag } = await searchParams;

  const [posts, categories, tags] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <BlogsCatalog
      initialPosts={posts}
      categories={categories}
      tags={tags}
      initialCategory={category || "all"}
      initialTag={tag || "all"}
    />
  );
}
