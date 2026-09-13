import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { SaveToListModal } from './SaveToListModal.js';

/**
 * Custom BookmarkPlusIcon matching the user's requested specification:
 * An editorial bookmark outline with a plus (+) symbol at the top right.
 */
export function BookmarkPlusIcon({ className = 'w-[18px] h-[18px]', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Bookmark body outline */}
      <path d="M12 5H7a2 2 0 0 0-2 2v14l6.5-4.5L18 21v-8" />
      {/* Plus symbol at top right corner */}
      <path d="M18 2.5v5" />
      <path d="M15.5 5h5" />
    </svg>
  );
}

/**
 * Custom BookmarkCheckIcon for the saved state:
 * An editorial bookmark outline with a checkmark (✓) at the top right.
 */
export function BookmarkCheckIcon({ className = 'w-[18px] h-[18px]', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Bookmark body outline */}
      <path d="M12 5H7a2 2 0 0 0-2 2v14l6.5-4.5L18 21v-8" />
      {/* Checkmark symbol at top right corner */}
      <path d="M15 5.5l2 2 4.5-4.5" />
    </svg>
  );
}

interface SaveButtonProps {
  postId: string;
  initialIsSaved?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

export function SaveButton({
  postId,
  initialIsSaved = false,
  className = '',
  size = 'md',
  showText = false,
  onToggle,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setModalOpen(true);
  };

  const iconClass =
    size === 'sm'
      ? 'w-[16px] h-[16px]'
      : size === 'lg'
      ? 'w-[20px] h-[20px]'
      : 'w-[18px] h-[18px]';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={isSaved ? 'Story saved in your lists' : 'Save story to list'}
        aria-label={isSaved ? 'Story saved in your lists' : 'Save story to list'}
        className={`inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none active:scale-90 ${
          isSaved
            ? 'text-[#211E1A]'
            : 'text-[#8A867E] hover:text-[#211E1A]'
        } ${className}`}
      >
        {isSaved ? (
          <BookmarkCheckIcon className={iconClass} />
        ) : (
          <BookmarkPlusIcon className={iconClass} />
        )}
        {showText && (
          <span className="text-xs font-normal">
            {isSaved ? 'Saved' : 'Save'}
          </span>
        )}
      </button>

      <SaveToListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        postId={postId}
        onSaveStatusChange={(saved) => {
          setIsSaved(saved);
          onToggle?.(saved);
        }}
      />
    </>
  );
}

export default SaveButton;
