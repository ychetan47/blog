import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const [post, categories] = await Promise.all([
    db.post.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PostForm post={post as any} categories={categories} />
    </div>
  );
}
