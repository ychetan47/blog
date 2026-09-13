import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { PlusCircle, Search, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PostRowActions } from "./post-row-actions";
import { ArticleIllustration } from "@/components/illustrations";

export const dynamic = "force-dynamic";

interface AdminPostsPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status, q } = await searchParams;

  const whereClause: any = {};
  if (status === "published") whereClause.published = true;
  if (status === "draft") whereClause.published = false;

  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }

  const posts = await db.post.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Article Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit, organize, and publish your technical and personal blogs.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          href="/admin/posts"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            !status
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Posts
        </Link>
        <Link
          href="/admin/posts?status=published"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status === "published"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Published
        </Link>
        <Link
          href="/admin/posts?status=draft"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status === "draft"
              ? "bg-amber-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Drafts
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No articles found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first article.</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Cover</th>
                  <th className="px-6 py-3.5">Title & Slug</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Tags</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        {post.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ArticleIllustration
                            type={post.illustration}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                        {post.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {post.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {post.tags.slice(0, 2).map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-medium"
                          >
                            #{tag.name}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-[11px] text-slate-400">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          post.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-medium">
                      {post.views}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <PostRowActions post={post} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
