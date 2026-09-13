"use client";

import React, { useActionState, useTransition } from "react";
import { createCategoryAction, deleteCategoryAction } from "../actions";
import { Plus, Trash2, Folder, Layers } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  _count?: { posts: number };
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, null);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      startTransition(async () => {
        await deleteCategoryAction(id);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Create Category Form (5 cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Add New Category</h2>
        </div>

        {state?.error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Distributed Systems"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Articles exploring consistency, consensus, and fault-tolerance..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                defaultValue="#D9E8FC"
                className="w-9 h-9 rounded-xl border-none cursor-pointer"
              />
              <span className="text-xs text-slate-400">Choose badge/card pastel tint</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isPending ? "Creating..." : "Create Category"}</span>
          </button>
        </form>
      </div>

      {/* Categories List (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Existing Categories</h2>
          <span className="text-xs text-slate-400 font-semibold">
            {categories.length} Total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10"
                  style={{ backgroundColor: cat.color || "#D9E8FC" }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    /category/{cat.slug} · {cat._count?.posts || 0} articles
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={isDeleting}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
