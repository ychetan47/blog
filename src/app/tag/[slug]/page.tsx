import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Tag as TagIcon } from "lucide-react";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/article-card";

export const dynamic = "force-dynamic";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  const tag = await db.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          post: {
            include: {
              category: true,
              tags: { include: { tag: true } },
              author: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const publishedPosts = tag.posts
    .map((tp) => tp.post)
    .filter((p) => p.published);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs font-semibold shadow-xs hover:bg-white/80 transition-all mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Blogs</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          <TagIcon className="w-3.5 h-3.5" />
          <span>Topic Tag</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          #{tag.name}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg mt-2">
          Curated articles and practical walkthroughs tagged with #{tag.name}.
        </p>
        <div className="mt-4 text-xs font-semibold text-slate-400">
          {publishedPosts.length} {publishedPosts.length === 1 ? "article" : "articles"} found
        </div>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8">
          <p className="text-slate-500">No published articles under this tag yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
