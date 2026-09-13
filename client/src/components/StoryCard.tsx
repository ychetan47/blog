import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SaveButton } from './SaveButton.js';
import { CommentsDrawer } from './CommentsDrawer.js';
import { MessageSquare, ThumbsUp, Share2, Repeat2 } from 'lucide-react';
import type { Post } from '../types/index.js';
import { api } from '../services/api.js';
import { RepostButton } from './RepostButton.js';
import { StoryMoreMenu } from './StoryMoreMenu.js';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export interface StoryCardProps {
  story: Post;
  repostBadge?: {
    repostedBy: string;
    repostedAt: string;
  };
}

export function StoryCard({ story, repostBadge }: StoryCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [claps, setClaps] = useState(story.claps || 0);
  const [hasClapped, setHasClapped] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Sep 2, 2026';

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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${story.slug}`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  return (
    <article className="border-b border-[#DDD9D0] py-5 sm:py-6.5 first:pt-0 last:border-b-0">
      {/* Repost Badge (e.g. You reposted · just now) */}
      {repostBadge && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2.5">
          <Repeat2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2]" />
          <span>
            <span className="font-medium text-stone-800">{repostBadge.repostedBy}</span> reposted · {formatRelativeTime(repostBadge.repostedAt)}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-5 sm:gap-7 lg:gap-9">
        {/* Left (70–72%): Story Content */}
        <div className="flex-1 min-w-0">
          {/* 1. Category · Subcategory · Date */}
          <div className="flex flex-wrap items-center gap-y-1 text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#716D65] mb-2">
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

          {/* 2. Story Title (30-34px desktop) */}
          <Link to={`/blog/${story.slug}`} className="block group">
            <h2 className="font-editorial text-2xl sm:text-[27px] lg:text-[31px] text-[#211E1A] font-normal leading-[1.18] tracking-tight group-hover:text-[#716D65] transition-colors">
              {story.title}
            </h2>
          </Link>

          {/* 3. Short Story Excerpt (2 lines) */}
          {story.excerpt && (
            <p className="text-[#716D65] text-sm sm:text-[15px] leading-relaxed mt-2 font-normal line-clamp-2">
              {story.excerpt}
            </p>
          )}

          {/* 4. Byline */}
          <div className="mt-2.5 text-xs sm:text-[13px] text-[#8A867E]">
            By <span className="text-[#211E1A] font-normal">{story.author?.name || 'Editorial Staff'}</span>
          </div>

          {/* 5. Engagement Actions: Left [Clap · Comment · Repost] | Right [Share · Save · More] */}
          <div className="mt-3.5 sm:mt-4 flex items-center justify-between text-xs text-[#8A867E]">
            <div className="flex items-center gap-4 sm:gap-5">
              <button
                type="button"
                onClick={handleClap}
                className="inline-flex items-center gap-1.5 hover:text-[#211E1A] transition-colors cursor-pointer py-1"
                title="Clap"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasClapped ? 'text-[#211E1A]' : ''}`} />
                <span className="font-mono text-[11px] tabular-nums">{claps > 1000 ? `${(claps / 1000).toFixed(1)}k` : claps}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCommentsOpen(true);
                }}
                className="inline-flex items-center gap-1.5 hover:text-[#211E1A] transition-colors cursor-pointer py-1"
                title="Comments"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] tabular-nums">{story._count?.comments || 0}</span>
              </button>

              <RepostButton
                postId={story.id}
                initialReposted={story.isReposted}
                initialCount={story.reposts ?? (story._count?.repostsList ?? 0)}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors p-1 rounded-full hover:bg-stone-100"
                title={copied ? 'Link copied' : 'Share story link'}
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied && <span className="text-[11px] text-emerald-700 font-medium">Copied</span>}
              </button>

              <SaveButton postId={story.id} initialIsSaved={story.isSaved} size="sm" />

              <StoryMoreMenu
                slug={story.slug}
                authorId={story.authorId || story.author?.id}
                authorName={story.author?.name}
                title={story.title}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Right (28–30%): Compact Editorial Thumbnail Image (180-210px width, 115-135px height) */}
        {story.coverImage && (
          <Link
            to={`/blog/${story.slug}`}
            className="block shrink-0 group mt-1"
            aria-label={story.title}
          >
            <div className="w-[95px] h-[68px] sm:w-[150px] sm:h-[105px] md:w-[190px] md:h-[125px] lg:w-[205px] lg:h-[135px] overflow-hidden rounded-[3px] border border-[#DDD9D0]/80 bg-[#EFECE6]/50">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                loading="lazy"
              />
            </div>
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
