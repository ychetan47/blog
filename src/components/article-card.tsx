import React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { ArticleIllustration } from "./illustrations";
import { formatDate } from "@/lib/utils";

export interface ArticleCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    illustration?: string | null;
    coverImage?: string | null;
    readingTime: number;
    publishedAt?: Date | string | null;
    category?: {
      name: string;
      slug: string;
      color?: string | null;
    } | null;
    tags?: { tag: { name: string; slug: string } }[];
    author?: {
      name: string;
      avatarUrl?: string | null;
    } | null;
  };
  variant?: "horizontal" | "featured" | "grid" | "compact" | "horizontal-large";
}

export function ArticleCard({ post, variant = "horizontal" }: ArticleCardProps) {
  const formattedDate = formatDate(post.publishedAt || new Date());

  // Variant 1: HORIZONTAL (Matches the reference screenshot on mobile, enriched on desktop)
  if (variant === "horizontal") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex items-center gap-4 sm:gap-5 p-3 sm:p-4 md:p-5 bg-white rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-blue-200/80 active:scale-[0.99]"
      >
        {/* Thumbnail: snug on mobile, generous on desktop */}
        <div className="w-24 sm:w-28 md:w-36 lg:w-40 h-20 sm:h-24 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-2xs group-hover:scale-103 transition-transform duration-300 relative bg-slate-100">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ArticleIllustration
              type={post.illustration || "astronaut"}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {post.category && (
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 truncate">
                {post.category.name}
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <span className="hidden md:inline text-[11px] font-medium text-slate-400">
                · #{post.tags[0].tag.name}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="hidden md:line-clamp-1 text-xs text-slate-500 mt-1 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1.5 sm:mt-2">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  // Variant 2: HORIZONTAL LARGE (For primary feed on desktop)
  if (variant === "horizontal-large") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 p-4 sm:p-6 bg-white rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-200/80"
      >
        <div className="w-full sm:w-48 md:w-52 h-44 sm:h-36 rounded-2xl overflow-hidden shrink-0 shadow-2xs group-hover:scale-102 transition-transform duration-300 relative bg-slate-100">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ArticleIllustration
              type={post.illustration || "astronaut"}
              className="w-full h-full"
            />
          )}
          {post.category && (
            <div className="sm:hidden absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-2xs">
              {post.category.name}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between min-w-0 flex-1 h-full py-1">
          <div>
            <div className="hidden sm:flex items-center gap-2 mb-2">
              {post.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                  {post.category.name}
                </span>
              )}
              {post.tags?.slice(0, 2).map(({ tag }) => (
                <span
                  key={tag.name}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                >
                  #{tag.name}
                </span>
              ))}
            </div>

            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              {post.author?.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span className="text-slate-600 font-semibold">{post.author?.name || "Author"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span>{formattedDate}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variant 3: FEATURED (Showcase card for Desktop homepage)
  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 h-full"
      >
        {/* Large Illustration / Hero Cover */}
        <div className="relative w-full h-64 sm:h-80 md:h-92 overflow-hidden bg-slate-100">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <ArticleIllustration
              type={post.illustration || "astronaut"}
              className="w-full h-full"
            />
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="px-3.5 py-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Featured Story
            </span>
            {post.category && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
                {post.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-slate-600 text-sm sm:text-base mt-3 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Tags strip */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.slice(0, 3).map(({ tag }) => (
                  <span
                    key={tag.name}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2.5">
              {post.author?.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              )}
              <span className="text-slate-800 font-bold">{post.author?.name || "Author"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span>{formattedDate}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-blue-600 font-bold ml-2 group-hover:translate-x-1 transition-transform">
                Read &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variant 4: GRID (Standard responsive catalog card)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-200/80 h-full"
    >
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <ArticleIllustration
            type={post.illustration || "astronaut"}
            className="w-full h-full"
          />
        )}
        {post.category && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-2xs">
            {post.category.name}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-slate-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-medium pt-4 mt-4 border-t border-slate-100">
          <span>{formattedDate}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
