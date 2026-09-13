import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Link2, ExternalLink, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StoryMoreMenuProps {
  slug: string;
  authorId?: string;
  authorName?: string;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StoryMoreMenu({
  slug,
  authorId,
  authorName,
  title,
  className = '',
  size = 'md',
}: StoryMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const storyUrl = `${window.location.origin}/stories/${slug}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(storyUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1200);
    } catch {
      // Fallback
      setIsOpen(false);
    }
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/stories/${slug}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleShareX = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tweetText = title ? `${title} — The Margin` : 'The Margin';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(storyUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setIsOpen(false);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorId) {
      navigate(`/author/${authorId}`);
    }
    setIsOpen(false);
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More options"
        aria-label="More options"
        aria-expanded={isOpen}
        className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
      >
        <MoreHorizontal className={`${iconSizes[size]} stroke-[1.75]`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg border border-stone-200 py-1 z-30 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 text-left transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                <span className="text-emerald-700 font-medium">Link copied</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-stone-500 stroke-[1.75]" />
                <span>Copy story link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 text-left transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-500 stroke-[1.75]" />
            <span>Open in new tab</span>
          </button>

          <button
            type="button"
            onClick={handleShareX}
            className="w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 text-left transition-colors"
          >
            <span className="w-3.5 h-3.5 text-stone-500 flex items-center justify-center font-bold text-[11px] leading-none">
              𝕏
            </span>
            <span>Share on 𝕏 (Twitter)</span>
          </button>

          {authorName && (
            <button
              type="button"
              onClick={handleAuthorClick}
              className="w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 text-left transition-colors border-t border-stone-100"
            >
              <User className="w-3.5 h-3.5 text-stone-500 stroke-[1.75]" />
              <span className="truncate">More from {authorName}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
