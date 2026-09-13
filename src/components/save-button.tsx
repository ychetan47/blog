"use client";

import React, { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveStoryAction } from "@/app/actions/auth-actions";

interface SaveButtonProps {
  postId: string;
  initialIsSaved?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function SaveButton({
  postId,
  initialIsSaved = false,
  className = "",
  size = "md",
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    setIsSaved((prev) => !prev);

    startTransition(async () => {
      try {
        const res = await toggleSaveStoryAction(postId);
        if (typeof res?.saved === "boolean") {
          setIsSaved(res.saved);
        }
      } catch {
        // Revert on error
        setIsSaved((prev) => !prev);
      }
    });
  };

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isSaved ? "Remove from saved stories" : "Save story to library"}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
        isSmall ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-xs sm:text-sm"
      } ${
        isSaved
          ? "bg-[#211E1A] text-[#F8F7F3] border border-[#211E1A]"
          : "bg-transparent text-[#716D65] border border-[#DDD9D0] hover:text-[#211E1A] hover:border-[#8A867E]"
      } ${className}`}
    >
      <Bookmark
        className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} ${
          isSaved ? "fill-current text-[#F8F7F3]" : "text-current"
        }`}
      />
      <span>{isSaved ? "Saved" : "Save"}</span>
    </button>
  );
}
