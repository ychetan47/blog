import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import {
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  PlusCircle,
  FolderTree,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PostRowActions } from "./posts/post-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [totalPosts, publishedPosts, draftPosts, categoriesCount, totalViews, recentPosts] =
    await Promise.all([
      db.post.count(),
      db.post.count({ where: { published: true } }),
      db.post.count({ where: { published: false } }),
      db.category.count(),
      db.post.aggregate({ _sum: { views: true } }),
      db.post.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      }),
    ]);

  const stats = [
    {
      label: "Total Articles",
      value: totalPosts,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Drafts",
      value: draftPosts,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Views",
      value: totalViews._sum.views || 0,
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, {session.name}. Here is a summary of your publication metrics.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/60 shadow-xs flex items-center gap-4"
            >
              <div className={`p-3.5 rounded-2xl ${item.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Recently Modified Posts
            </h2>
            <p className="text-xs text-slate-400">Quickly toggle status or edit content</p>
          </div>

          <Link
            href="/admin/posts"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View all posts &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Article Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Views</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                      {post.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      /blog/{post.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {post.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-slate-600 font-medium">{post.views}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <PostRowActions post={post} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
