import { useState, useRef, useEffect } from 'react';
import { Lock, MoreHorizontal, Edit2, Trash2, BookOpen } from 'lucide-react';
import type { ReadingList } from '../types/index.js';

interface ReadingListCardProps {
  list: ReadingList;
  authorName?: string;
  authorAvatar?: string | null;
  onClick?: () => void;
  onEdit?: (list: ReadingList) => void;
  onDelete?: (listId: string) => void;
}

export function ReadingListCard({
  list,
  authorName = 'Reader',
  authorAvatar,
  onClick,
  onEdit,
  onDelete,
}: ReadingListCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const initials = authorName
    ? authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'R';

  // Smooth placeholder background tones matching Medium list collage
  const placeholderBgs = ['bg-[#EFECE6]', 'bg-[#E7E3DB]', 'bg-[#DFDAD2]'];

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#FBF9F5] hover:bg-[#F6F3EC] border border-[#E2DDD4] hover:border-[#D5CFBF] rounded-xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs"
    >
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        {/* Left Section: Author info, Title, Count, Lock & Options */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Author Byline */}
          <div className="flex items-center gap-2 mb-2.5 text-xs text-[#716D65]">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-5 h-5 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                {initials}
              </div>
            )}
            <span className="font-medium text-[#211E1A] truncate">{authorName}</span>
          </div>

          {/* List Title */}
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#211E1A] group-hover:text-stone-700 transition-colors leading-snug truncate">
            {list.name}
          </h3>

          {/* Optional description */}
          {list.description && (
            <p className="text-xs text-[#716D65] line-clamp-1 mt-1 font-normal">
              {list.description}
            </p>
          )}

          {/* Metadata & Actions Row */}
          <div className="mt-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#8A867E]">
              <span>
                {list.storyCount === 0
                  ? 'No stories'
                  : list.storyCount === 1
                  ? '1 story'
                  : `${list.storyCount} stories`}
              </span>
              {list.isPrivate && (
                <span title="Private list">
                  <Lock className="w-3 h-3 text-[#8A867E]" />
                </span>
              )}
            </div>

            {/* Options Menu (Three dots) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                title="List options"
                aria-label="List options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-lg shadow-md border border-stone-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(list);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>Edit list</span>
                    </button>
                  )}
                  {onDelete && list.name !== 'Reading list' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(list.id);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete list</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: 3-slot smooth image preview collage */}
        <div className="w-[125px] sm:w-[170px] md:w-[190px] h-[85px] sm:h-[105px] rounded-lg overflow-hidden border border-[#DDD9D0] grid grid-cols-3 shrink-0 shadow-xs bg-[#EFECE6]">
          {[0, 1, 2].map((slotIdx) => {
            const coverUrl = list.previewCovers?.[slotIdx];
            const isLast = slotIdx === 2;

            if (coverUrl) {
              return (
                <div
                  key={slotIdx}
                  className={`relative w-full h-full overflow-hidden ${
                    !isLast ? 'border-r border-stone-300/60' : ''
                  }`}
                >
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
              );
            }

            return (
              <div
                key={slotIdx}
                className={`w-full h-full flex items-center justify-center ${placeholderBgs[slotIdx]} ${
                  !isLast ? 'border-r border-stone-300/40' : ''
                }`}
              >
                {slotIdx === 0 && list.storyCount === 0 && (
                  <BookOpen className="w-4 h-4 text-stone-300/80 stroke-[1.2]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ReadingListCard;
