import React, { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

interface RepostButtonProps {
  postId: string;
  initialReposted?: boolean;
  initialCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onToggle?: (reposted: boolean, count: number) => void;
}

export function RepostButton({
  postId,
  initialReposted = false,
  initialCount = 0,
  className = '',
  size = 'md',
  showCount = true,
  onToggle,
}: RepostButtonProps) {
  const [isReposted, setIsReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
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

    if (isPending) return;

    const prevReposted = isReposted;
    const prevCount = count;
    const nextReposted = !prevReposted;
    const nextCount = nextReposted ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsReposted(nextReposted);
    setCount(nextCount);
    setIsPending(true);

    try {
      const res = await api.posts.repost(postId);
      setIsReposted(res.reposted);
      setCount(res.count);
      onToggle?.(res.reposted, res.count);
    } catch (err) {
      console.error('Failed to toggle repost:', err);
      setIsReposted(prevReposted);
      setCount(prevCount);
    } finally {
      setIsPending(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-xs gap-1.5',
    lg: 'p-2 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isReposted ? 'Undo repost' : 'Repost story'}
      aria-label={isReposted ? 'Undo repost' : 'Repost story'}
      className={`group inline-flex items-center rounded-full transition-all duration-150 select-none ${
        isReposted
          ? 'text-emerald-700 hover:text-emerald-800'
          : 'text-stone-500 hover:text-stone-900'
      } ${sizeClasses[size]} ${className}`}
    >
      <Repeat2
        className={`${iconSizes[size]} transition-transform duration-200 group-hover:rotate-12 ${
          isReposted ? 'stroke-[2.2]' : 'stroke-[1.75]'
        }`}
      />
      {showCount && count > 0 && (
        <span className="font-mono text-[11px] tabular-nums leading-none">
          {count}
        </span>
      )}
    </button>
  );
}
