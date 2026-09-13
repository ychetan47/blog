import { useRef, useEffect } from 'react';
import type { Block } from '../types.js';

interface SectionBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onFocus: () => void;
}

export function SectionBlock({
  block,
  isFocused: _isFocused,
  onUpdate,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: SectionBlockProps) {
  const numberRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current && document.activeElement !== titleRef.current) {
      if (titleRef.current.innerHTML !== (block.sectionTitle || '')) {
        titleRef.current.innerHTML = block.sectionTitle || '';
      }
    }
  }, [block.sectionTitle]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
      return;
    }

    if (e.key === 'Backspace') {
      const text = titleRef.current?.innerText.replace(/\n/g, '').trim() || '';
      if (!text && !block.sectionNumber) {
        e.preventDefault();
        onBackspaceEmpty();
        return;
      }
    }
  };

  return (
    <div
      onClick={onFocus}
      className="my-12 py-8 border-y border-[#DDD9D0]/70 text-center flex flex-col items-center justify-center space-y-3"
    >
      <input
        ref={numberRef}
        type="text"
        value={block.sectionNumber || ''}
        onChange={(e) => onUpdate({ sectionNumber: e.target.value })}
        placeholder="PART II"
        className="text-xs font-mono uppercase tracking-[0.25em] text-[#716D65] placeholder-[#716D65]/40 text-center bg-transparent outline-none focus:text-[#211E1A] transition-colors"
      />

      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onUpdate({ sectionTitle: e.currentTarget.innerHTML })}
        onKeyDown={handleTitleKeyDown}
        data-placeholder="Section or Chapter Title..."
        className="w-full font-editorial text-3xl sm:text-4xl text-[#211E1A] outline-none focus:outline-none leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-[#716D65]/40"
      />
    </div>
  );
}
