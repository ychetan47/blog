import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Category Taxonomy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Organize your technical topics and personal interest pillars.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
