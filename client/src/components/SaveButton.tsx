import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

interface SaveButtonProps {
  postId: string;
  initialIsSaved?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  onToggle?: (isSaved: boolean) => void;
}

export function SaveButton({
  postId,
  initialIsSaved = false,
  className = '',
  size = 'md',
  onToggle,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, setIsPending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    const previous = isSaved;
    setIsSaved(!previous);
    setIsPending(true);

    try {
      const res = await api.posts.save(postId);
      setIsSaved(res.saved);
      onToggle?.(res.saved);
    } catch {
      setIsSaved(previous);
    } finally {
      setIsPending(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isSaved ? 'Remove from saved stories' : 'Save story to library'}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
        isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
      } ${
        isSaved
          ? 'bg-[#211E1A] text-[#F8F7F3] border border-[#211E1A]'
          : 'bg-transparent text-[#716D65] border border-[#DDD9D0] hover:text-[#211E1A] hover:border-[#8A867E]'
      } ${className}`}
    >
      <Bookmark
        className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${
          isSaved ? 'fill-current text-[#F8F7F3]' : 'text-current'
        }`}
      />
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
