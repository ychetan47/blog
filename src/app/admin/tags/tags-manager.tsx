"use client";

import React, { useActionState, useTransition } from "react";
import { createTagAction, deleteTagAction } from "../actions";
import { Plus, Trash2, Tag as TagIcon } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export function TagsManager({ tags }: { tags: Tag[] }) {
  const [state, formAction, isPending] = useActionState(createTagAction, null);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete tag #${name}?`)) {
      startTransition(async () => {
        await deleteTagAction(id);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Create Tag Form */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Add New Tag</h2>
        </div>

        {state?.error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tag Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. distributed-systems"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isPending ? "Adding..." : "Add Tag"}</span>
          </button>
        </form>
      </div>

      {/* Tags Cloud / Table */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Active Tags</h2>
          <span className="text-xs text-slate-400 font-semibold">{tags.length} Total</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all group"
            >
              <span>#{tag.name}</span>
              <span className="text-[10px] text-slate-400">
                ({tag._count?.posts || 0})
              </span>
              <button
                onClick={() => handleDelete(tag.id, tag.name)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-rose-600 ml-1 transition-colors cursor-pointer"
                title="Delete tag"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
