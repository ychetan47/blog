import { useState, useRef, useEffect } from 'react';
import { GripVertical, MoreHorizontal, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import type { BlockType } from './types.js';

interface BlockControlsMenuProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConvertType?: (type: BlockType) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockControlsMenu({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onConvertType,
  canMoveUp,
  canMoveDown,
}: BlockControlsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative flex items-center gap-0.5 select-none">
      {/* Drag handle */}
      <button
        type="button"
        title="Drag or click for block options"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded text-[#716D65]/50 hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* 3-dot menu toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Block options"
        className="p-1 rounded text-[#716D65]/50 hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-full top-0 ml-1 z-30 w-44 py-1.5 bg-[#211E1A] text-[#F8F7F3] rounded-xl shadow-xl border border-[#38332E] text-xs animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => {
              onMoveUp();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Move Up</span>
          </button>

          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => {
              onMoveDown();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Move Down</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDuplicate();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/10 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          {onConvertType && (
            <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-[#9E9B95]">
              Turn into
            </div>
          )}
          {onConvertType && (
            <>
              <button
                type="button"
                onClick={() => {
                  onConvertType('paragraph');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1 text-left text-[11px] text-[#DDD9D0] hover:bg-white/10 transition-colors"
              >
                <span>Paragraph</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onConvertType('heading');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1 text-left text-[11px] text-[#DDD9D0] hover:bg-white/10 transition-colors"
              >
                <span>Heading</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onConvertType('quote');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1 text-left text-[11px] text-[#DDD9D0] hover:bg-white/10 transition-colors"
              >
                <span>Quote</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onConvertType('callout');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1 text-left text-[11px] text-[#DDD9D0] hover:bg-white/10 transition-colors"
              >
                <span>Callout</span>
              </button>
              <div className="my-1 border-t border-white/10" />
            </>
          )}

          <button
            type="button"
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-300 hover:text-red-200 hover:bg-red-500/20 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
