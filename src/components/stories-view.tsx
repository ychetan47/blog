"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight, Plus, MoreHorizontal, PenSquare, Trash2, Globe } from "lucide-react";

export interface StoryListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  readingTime: number;
  published: boolean;
  views: number;
  claps: number;
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
  createdAt: Date | string;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface StoriesViewProps {
  initialStories: StoryListItem[];
  userName?: string;
}

type TabType = "drafts" | "scheduled" | "published" | "unlisted" | "submissions";

export function StoriesView({ initialStories, userName }: StoriesViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("drafts");

  const drafts = initialStories.filter((s) => !s.published);
  const published = initialStories.filter((s) => s.published);
  const scheduled: StoryListItem[] = [];
  const unlisted: StoryListItem[] = [];
  const submissions: StoryListItem[] = [];

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const formatRelativeTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-12 sm:pt-20">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#211E1A]">
            Stories
          </h1>

          <Link
            href="/admin/posts/new"
            className="px-5 py-2 rounded-full bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Write a story
          </Link>
        </div>

        {/* Navigation Tabs matching screenshot: Drafts · Scheduled · Published · Unlisted | Submissions */}
        <div className="border-b border-[#DDD9D0] flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar text-sm sm:text-base">
          <button
            type="button"
            onClick={() => setActiveTab("drafts")}
            className={`pb-3.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "drafts"
                ? "border-b-2 border-[#211E1A] -mb-px text-[#211E1A] font-medium"
                : "text-[#716D65] hover:text-[#211E1A]"
            }`}
          >
            Drafts {drafts.length > 0 && <span className="text-xs text-[#8A867E]">({drafts.length})</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scheduled")}
            className={`pb-3.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "scheduled"
                ? "border-b-2 border-[#211E1A] -mb-px text-[#211E1A] font-medium"
                : "text-[#716D65] hover:text-[#211E1A]"
            }`}
          >
            Scheduled
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`pb-3.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "published"
                ? "border-b-2 border-[#211E1A] -mb-px text-[#211E1A] font-medium"
                : "text-[#716D65] hover:text-[#211E1A]"
            }`}
          >
            Published {published.length > 0 && <span className="text-xs text-[#8A867E]">({published.length})</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unlisted")}
            className={`pb-3.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "unlisted"
                ? "border-b-2 border-[#211E1A] -mb-px text-[#211E1A] font-medium"
                : "text-[#716D65] hover:text-[#211E1A]"
            }`}
          >
            Unlisted
          </button>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-[#DDD9D0] shrink-0" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`pb-3.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "submissions"
                ? "border-b-2 border-[#211E1A] -mb-px text-[#211E1A] font-medium"
                : "text-[#716D65] hover:text-[#211E1A]"
            }`}
          >
            Submissions
          </button>
        </div>

        {/* Tab Content Section */}
        <div className="mt-8">
          {/* 1. DRAFTS TAB */}
          {activeTab === "drafts" && (
            <div>
              {drafts.length === 0 ? (
                <div className="py-20 text-center border-t border-[#DDD9D0]">
                  <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                    You have no drafts
                  </p>
                  <p className="text-sm text-[#716D65] max-w-sm mx-auto mb-6">
                    Write, edit, and refine essays quietly before publishing them to the world.
                  </p>
                  <Link
                    href="/admin/posts/new"
                    className="inline-block px-6 py-2.5 rounded-full bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] text-xs sm:text-sm font-medium transition-colors"
                  >
                    Write a story
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#DDD9D0] border-t border-[#DDD9D0]">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <Link
                          href={`/admin/posts/${draft.id}/edit`}
                          className="font-editorial text-2xl sm:text-3xl text-[#211E1A] font-normal group-hover:text-[#716D65] transition-colors leading-snug"
                        >
                          {draft.title}
                        </Link>
                        {draft.excerpt && (
                          <p className="text-sm text-[#716D65] line-clamp-2">
                            {draft.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[#8A867E] pt-1">
                          <span>Last edited {formatRelativeTime(draft.updatedAt)}</span>
                          <span>·</span>
                          <span>{getWordCount(draft.content)} words</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={`/admin/posts/${draft.id}/edit`}
                          className="px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-[#211E1A] text-xs font-medium transition-colors"
                        >
                          Edit draft
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SCHEDULED TAB */}
          {activeTab === "scheduled" && (
            <div className="py-20 text-center border-t border-[#DDD9D0]">
              <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                You have no scheduled stories
              </p>
              <p className="text-sm text-[#716D65] max-w-md mx-auto">
                Schedule your essays in advance to publish at a thoughtful, deliberate pace.
              </p>
            </div>
          )}

          {/* 3. PUBLISHED TAB */}
          {activeTab === "published" && (
            <div>
              {published.length === 0 ? (
                <div className="py-20 text-center border-t border-[#DDD9D0]">
                  <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                    No published stories yet
                  </p>
                  <p className="text-sm text-[#716D65] max-w-sm mx-auto mb-6">
                    Publish your first essay or draft to share with The Margin community.
                  </p>
                  <Link
                    href="/admin/posts/new"
                    className="inline-block px-6 py-2.5 rounded-full bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] text-xs sm:text-sm font-medium transition-colors"
                  >
                    Write a story
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#DDD9D0] border-t border-[#DDD9D0]">
                  {published.map((story) => (
                    <div
                      key={story.id}
                      className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <Link
                          href={`/blog/${story.slug}`}
                          className="font-editorial text-2xl sm:text-3xl text-[#211E1A] font-normal group-hover:text-[#716D65] transition-colors leading-snug"
                        >
                          {story.title}
                        </Link>
                        {story.excerpt && (
                          <p className="text-sm text-[#716D65] line-clamp-2">
                            {story.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[#8A867E] pt-1">
                          <span>
                            Published {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "recently"}
                          </span>
                          <span>·</span>
                          <span>{story.readingTime} min read</span>
                          <span>·</span>
                          <span>{story.views} views</span>
                          <span>·</span>
                          <span>{story.claps} claps</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={`/admin/posts/${story.id}/edit`}
                          className="px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-[#211E1A] text-xs font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/blog/${story.slug}`}
                          className="px-4 py-1.5 rounded-full bg-transparent hover:text-[#211E1A] text-[#716D65] text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. UNLISTED TAB */}
          {activeTab === "unlisted" && (
            <div className="py-20 text-center border-t border-[#DDD9D0]">
              <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                You have no unlisted stories
              </p>
              <p className="text-sm text-[#716D65] max-w-md mx-auto">
                Unlisted stories are hidden from your profile and search, accessible only via direct link.
              </p>
            </div>
          )}

          {/* 5. SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div className="py-20 text-center border-t border-[#DDD9D0]">
              <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                No active submissions
              </p>
              <p className="text-sm text-[#716D65] max-w-md mx-auto">
                Stories you submit to publications on The Margin will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
