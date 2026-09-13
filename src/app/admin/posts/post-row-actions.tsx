"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { togglePublishAction, deletePostAction } from "../actions";

interface PostRowActionsProps {
  post: {
    id: string;
    slug: string;
    published: boolean;
  };
}

export function PostRowActions({ post }: PostRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      await togglePublishAction(post.id, post.published);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      startTransition(async () => {
        await deletePostAction(post.id);
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {post.published && (
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title="View live article"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}

      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          post.published
            ? "text-emerald-600 hover:bg-emerald-50"
            : "text-amber-600 hover:bg-amber-50"
        }`}
        title={post.published ? "Unpublish to draft" : "Publish article"}
      >
        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      <Link
        href={`/admin/posts/${post.id}/edit`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Edit article"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        title="Delete article"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
