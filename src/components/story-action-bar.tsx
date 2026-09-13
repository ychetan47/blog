"use client";

import React, { useState, useTransition } from "react";
import {
  MessageSquare,
  Repeat2,
  Bookmark,
  ThumbsDown,
  MoreHorizontal,
  Hand,
} from "lucide-react";
import {
  clapStoryAction,
  repostStoryAction,
  toggleSaveStoryAction,
} from "@/app/actions/auth-actions";

interface StoryActionBarProps {
  postId: string;
  initialClaps?: number;
  initialCommentsCount?: number;
  initialReposts?: number;
  isInitiallySaved?: boolean;
  onOpenComments?: () => void;
  className?: string;
}

export function StoryActionBar({
  postId,
  initialClaps = 10100,
  initialCommentsCount = 294,
  initialReposts = 91,
  isInitiallySaved = false,
  onOpenComments,
  className = "",
}: StoryActionBarProps) {
  const [claps, setClaps] = useState(initialClaps);
  const [hasClapped, setHasClapped] = useState(false);
  const [reposts, setReposts] = useState(initialReposts);
  const [hasReposted, setHasReposted] = useState(false);
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isPending, startTransition] = useTransition();

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  const handleClap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClaps((prev) => prev + 1);
    setHasClapped(true);
    startTransition(async () => {
      await clapStoryAction(postId);
    });
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !hasReposted;
    setHasReposted(next);
    setReposts((prev) => (next ? prev + 1 : prev - 1));
    startTransition(async () => {
      await repostStoryAction(postId);
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isSaved;
    setIsSaved(next);
    startTransition(async () => {
      const res = await toggleSaveStoryAction(postId);
      if (res?.requiresLogin) {
        window.location.href = "/login";
      }
    });
  };

  return (
    <div
      className={`flex items-center justify-between text-stone-500 text-xs sm:text-sm pt-4 select-none ${className}`}
    >
      {/* Left items: Claps, Comments, Repost matching Screenshot 5 */}
      <div className="flex items-center gap-5 sm:gap-6">
        {/* Claps */}
        <button
          type="button"
          onClick={handleClap}
          className={`flex items-center gap-1.5 transition-all duration-150 cursor-pointer group ${
            hasClapped
              ? "text-[#1C1917] font-bold scale-105"
              : "hover:text-[#1C1917]"
          }`}
          title="Clap for this story"
        >
          {/* Custom hands/clap icon matching screenshot */}
          <Hand
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
              hasClapped ? "fill-current text-[#1C1917]" : ""
            }`}
          />
          <span className="font-semibold text-xs">{formatCount(claps)}</span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenComments?.();
          }}
          className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors cursor-pointer group"
          title="View discussion"
        >
          <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs">
            {formatCount(initialCommentsCount)}
          </span>
        </button>

        {/* Repost */}
        <button
          type="button"
          onClick={handleRepost}
          className={`flex items-center gap-1.5 transition-all duration-150 cursor-pointer group ${
            hasReposted ? "text-emerald-700 font-bold" : "hover:text-[#1C1917]"
          }`}
          title="Repost this story"
        >
          <Repeat2
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform ${
              hasReposted ? "text-emerald-600 stroke-[2.5]" : ""
            }`}
          />
          <span className="font-semibold text-xs">{formatCount(reposts)}</span>
        </button>
      </div>

      {/* Right items: Thumbs down / Bookmark Save pill matching screenshot */}
      <div className="flex items-center gap-3">
        {/* Pill Save / Saved Button (matching Screenshots 3, 4, 5) */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3.5 py-1 sm:py-1.5 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer shadow-2xs ${
            isSaved
              ? "bg-stone-100 border-stone-400 text-stone-900 font-bold"
              : "bg-white border-stone-300 hover:border-stone-500 text-stone-700 hover:text-stone-900"
          }`}
          title={isSaved ? "Saved to Library" : "Save story"}
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${
              isSaved ? "fill-stone-900 text-stone-900" : "text-stone-700"
            }`}
          />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Story feedback recorded.");
          }}
          className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          title="Less like this"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard?.writeText(window.location.href);
            alert("Story link copied to clipboard!");
          }}
          className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
