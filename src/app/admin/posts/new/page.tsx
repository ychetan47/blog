import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <PostForm categories={categories} />
    </div>
  );
}
