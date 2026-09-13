import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { TagsManager } from "./tags-manager";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Topic Tags
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage keyword tags for technical topics and cross-cutting themes.
        </p>
      </div>

      <TagsManager tags={tags} />
    </div>
  );
}
