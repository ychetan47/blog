"use client";

import React, { useState, useTransition } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { addCommentAction } from "@/app/actions/auth-actions";

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: Date | string;
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  storyTitle: string;
  initialComments?: CommentItem[];
}

export function CommentsDrawer({
  isOpen,
  onClose,
  postId,
  storyTitle,
  initialComments = [],
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(postId, newComment);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.comment) {
        setComments([res.comment as any, ...comments]);
        setNewComment("");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-[#F8F7F3] h-full border-l border-[#DDD9D0] flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="p-6 border-b border-[#DDD9D0] flex items-center justify-between bg-[#F3F1EB]">
          <div>
            <h3 className="font-editorial text-2xl text-[#211E1A] font-normal">
              Responses ({comments.length})
            </h3>
            <p className="text-xs text-[#716D65] truncate max-w-xs mt-1">{storyTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#716D65] hover:text-[#211E1A] transition-colors cursor-pointer"
            aria-label="Close responses drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#F3F1EB] border-b border-[#DDD9D0]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full p-3.5 bg-[#F8F7F3] border border-[#DDD9D0] focus:border-[#211E1A] rounded-[8px] text-sm text-[#211E1A] outline-none resize-none transition-colors"
            />
            {error && (
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || !newComment.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#211E1A] hover:bg-stone-800 disabled:opacity-40 text-[#F8F7F3] text-xs font-medium rounded-full transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{isPending ? "Posting..." : "Respond"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#DDD9D0]">
          {comments.length === 0 ? (
            <div className="text-center py-16 text-[#8A867E]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No responses yet. Join the conversation.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="pt-4 first:pt-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-[#E5E1D8] border border-[#DDD9D0] flex items-center justify-center font-normal text-[11px] text-[#211E1A]">
                    {c.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[#211E1A]">{c.authorName}</h4>
                    <span className="text-[10px] text-[#8A867E]">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#2E2A25] leading-relaxed pl-9">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
