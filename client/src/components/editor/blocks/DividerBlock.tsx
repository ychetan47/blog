import { Trash2 } from 'lucide-react';
import type { Block } from '../types.js';

interface DividerBlockProps {
  block: Block;
  isFocused: boolean;
  onRemove: () => void;
  onFocus: () => void;
}

export function DividerBlock({ isFocused: _isFocused, onRemove, onFocus }: DividerBlockProps) {
  return (
    <div
      onClick={onFocus}
      className="relative group/divider py-6 my-4 flex items-center justify-center cursor-pointer"
    >
      <div className="w-full flex items-center justify-center">
        <div className="flex items-center gap-6 text-[#716D65]/50 tracking-[1em] text-lg select-none">
          ···
        </div>
      </div>

      {/* Remove button on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove divider"
        className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#716D65] hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/divider:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
