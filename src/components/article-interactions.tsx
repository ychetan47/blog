"use client";

import React, { useState } from "react";
import { Heart, Bookmark, Share2, Check, Copy } from "lucide-react";
import { TwitterIcon, LinkedinIcon } from "./social-icons";

interface ArticleInteractionsProps {
  initialLikes?: number;
  title: string;
  slug: string;
}

export function ArticleInteractions({
  initialLikes = 0,
  title,
  slug,
}: ArticleInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : ""
  )}`;

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
          hasLiked
            ? "bg-rose-50 border-rose-200 text-rose-600 shadow-xs"
            : "bg-white border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/50"
        }`}
      >
        <Heart
          className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`}
        />
        <span>{likes}</span>
      </button>

      {/* Bookmark Button */}
      <button
        onClick={() => setBookmarked(!bookmarked)}
        className={`p-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
          bookmarked
            ? "bg-blue-50 border-blue-200 text-blue-600 shadow-xs"
            : "bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50"
        }`}
        title="Bookmark article"
      >
        <Bookmark
          className={`w-4 h-4 ${bookmarked ? "fill-blue-600 text-blue-600" : ""}`}
        />
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      {/* Twitter Share */}
      <a
        href={shareTwitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 text-slate-600 transition-all"
        title="Share on Twitter"
      >
        <TwitterIcon className="w-4 h-4" />
      </a>

      {/* LinkedIn Share */}
      <a
        href={shareLinkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 transition-all"
        title="Share on LinkedIn"
      >
        <LinkedinIcon className="w-4 h-4" />
      </a>
    </div>
  );
}
