import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SaveButton } from './SaveButton.js';
import { CommentsDrawer } from './CommentsDrawer.js';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import type { Post } from '../types/index.js';
import { api } from '../services/api.js';

export function StoryCard({ story }: { story: Post }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [claps, setClaps] = useState(story.claps || 0);
  const [hasClapped, setHasClapped] = useState(false);

  const formattedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'September 2, 2026';

  const categoryName = story.category?.name || 'Design';

  const handleClap = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClaps((prev) => prev + 1);
    setHasClapped(true);
    try {
      await api.posts.clap(story.id, 1);
    } catch {
      // ignore
    }
  };

  return (
    <article className="border-b border-[#DDD9D0] py-10 sm:py-14 first:pt-4 last:border-b-0">
      <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-8 sm:gap-12">
        {/* Left: Metadata + Editorial Title + Excerpt + Byline + Actions */}
        <div className="flex-1 min-w-0">
          {/* Editorial Metadata & Subcategory Hierarchy */}
          <div className="flex flex-wrap items-center gap-y-1 text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#716D65] mb-3">
            <span className="font-medium text-[#211E1A]">{categoryName}</span>
            {story.matchedSubcategories && story.matchedSubcategories.length > 0 ? (
              <>
                <span className="mx-1.5 text-[#A39E93]">·</span>
                <span className="text-[#795536] font-medium">
                  {story.matchedSubcategories.slice(0, 2).join(' · ')}
                </span>
              </>
            ) : story.subcategories && story.subcategories.length > 0 ? (
              <>
                <span className="mx-1.5 text-[#A39E93]">·</span>
                <span>
                  {story.subcategories.slice(0, 2).map((s) => s.name).join(' · ')}
                </span>
              </>
            ) : null}
            <span className="mx-2 text-[#DDD9D0]">·</span>
            <span>{formattedDate}</span>
            <span className="mx-2 text-[#DDD9D0]">·</span>
            <span>{story.readingTime} min read</span>
          </div>

          {/* Title */}
          <Link to={`/blog/${story.slug}`} className="block group">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[40px] text-[#211E1A] font-normal leading-[1.12] tracking-tight group-hover:text-[#716D65] transition-colors">
              {story.title}
            </h2>
          </Link>

          {/* Description */}
          {story.excerpt && (
            <p className="text-[#716D65] text-base sm:text-[17px] leading-relaxed mt-3.5 font-normal line-clamp-3">
              {story.excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="mt-4 text-xs sm:text-sm text-[#8A867E]">
            By <span className="text-[#211E1A] font-normal">{story.author?.name || 'Editorial Staff'}</span>
          </div>

          {/* Controls: Save Action + Subtle Claps & Comments */}
          <div className="mt-6 flex items-center gap-4">
            <SaveButton postId={story.id} initialIsSaved={story.isSaved} />

            <div className="flex items-center gap-3 text-xs text-[#8A867E] ml-2">
              <button
                type="button"
                onClick={handleClap}
                className="inline-flex items-center gap-1 hover:text-[#211E1A] transition-colors cursor-pointer"
                title="Clap"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasClapped ? 'text-[#211E1A]' : ''}`} />
                <span>{claps > 1000 ? `${(claps / 1000).toFixed(1)}k` : claps}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCommentsOpen(true);
                }}
                className="inline-flex items-center gap-1 hover:text-[#211E1A] transition-colors cursor-pointer"
                title="Comments"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{story._count?.comments || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Editorial Photograph */}
        {story.coverImage && (
          <Link
            to={`/blog/${story.slug}`}
            className="block shrink-0 w-full md:w-[320px] lg:w-[420px] aspect-4/3 overflow-hidden rounded-[3px] border border-[#DDD9D0]/80 group"
          >
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </Link>
        )}
      </div>

      {/* Comments Drawer */}
      <CommentsDrawer
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={story.id}
        storyTitle={story.title}
      />
    </article>
  );
}
