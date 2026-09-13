"use client";

import React, { useState, useMemo, useTransition } from "react";
import { ArticleCard } from "./article-card";
import { SearchInput } from "./search-input";
import { SlidersHorizontal, ArrowUpDown, Tag as TagIcon, Layers, Search } from "lucide-react";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  illustration?: string | null;
  coverImage?: string | null;
  readingTime: number;
  featured: boolean;
  published: boolean;
  publishedAt?: Date | string | null;
  views: number;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
  tags?: { tag: { name: string; slug: string } }[];
  author?: {
    name: string;
    avatarUrl?: string | null;
  } | null;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface BlogsCatalogProps {
  initialPosts: PostItem[];
  categories: CategoryItem[];
  tags: TagItem[];
  initialCategory?: string;
  initialTag?: string;
}

export function BlogsCatalog({
  initialPosts,
  categories,
  tags,
  initialCategory = "all",
  initialTag = "all",
}: BlogsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "popular">("latest");
  const [isPending, startTransition] = useTransition();

  const filteredPosts = useMemo(() => {
    let result = [...initialPosts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.tag.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // Tag filter
    if (selectedTag !== "all") {
      result = result.filter((p) =>
        p.tags?.some((t) => t.tag.slug === selectedTag)
      );
    }

    // Sorting
    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt || 0).getTime() -
          new Date(a.publishedAt || 0).getTime()
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.publishedAt || 0).getTime() -
          new Date(b.publishedAt || 0).getTime()
      );
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [initialPosts, searchQuery, selectedCategory, selectedTag, sortBy]);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center sm:text-left mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          All Articles
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mt-2">
          Explore everything I&apos;ve written on engineering, architectures, and life.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white shadow-xs space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-8">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                startTransition(() => {
                  setSearchQuery(val);
                });
              }}
              placeholder="Search by title, keyword, tech stack..."
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2 justify-end">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-[#f1f5f9] hover:bg-[#e9edf3] text-slate-800 text-xs sm:text-sm font-semibold rounded-2xl border-none outline-none cursor-pointer"
            >
              <option value="latest">Sort: Latest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="popular">Sort: Most Popular</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tags Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" /> Tags:
          </span>
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            All Tags
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.slug)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag.slug
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Reset Filter */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="text-xs sm:text-sm font-semibold text-slate-500">
          Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
        </span>

        {(selectedCategory !== "all" || selectedTag !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedTag("all");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs max-w-md mx-auto my-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No articles match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, category, or tag filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
