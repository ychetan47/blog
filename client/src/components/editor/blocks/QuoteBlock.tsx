import { useEffect, useRef } from 'react';
import type { Block } from '../types.js';

interface QuoteBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onFocus: () => void;
}

export function QuoteBlock({
  block,
  isFocused,
  onUpdate,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: QuoteBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== (block.content || '')) {
        contentRef.current.innerHTML = block.content || '';
      }
    }
  }, [block.content]);

  useEffect(() => {
    if (isFocused && contentRef.current && document.activeElement !== contentRef.current && document.activeElement !== authorRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFocused]);

  const handleInput = () => {
    if (!contentRef.current) return;
    onUpdate({ content: contentRef.current.innerHTML });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    if (e.key === 'Backspace') {
      const text = contentRef.current?.innerText.replace(/\n/g, '').trim() || '';
      if (!text) {
        e.preventDefault();
        onBackspaceEmpty();
        return;
      }
    }
  };

  const isEmpty = !block.content || block.content === '<br>' || block.content === '';

  return (
    <div className="relative group/block my-6 border-l-2 border-[#211E1A] pl-6 py-2 transition-colors">
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder="Enter quote..."
        className={`w-full font-editorial italic text-2xl sm:text-3xl leading-[1.4] text-[#211E1A] outline-none focus:outline-none transition-colors ${
          isEmpty ? 'before:content-[attr(data-placeholder)] before:text-[#716D65]/40 before:pointer-events-none before:font-normal' : ''
        }`}
      />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-[#716D65]/60">—</span>
        <input
          ref={authorRef}
          type="text"
          value={block.author || ''}
          onChange={(e) => onUpdate({ author: e.target.value })}
          onFocus={onFocus}
          placeholder="Attribution or author (optional)"
          className="w-full bg-transparent text-xs sm:text-sm font-sans text-[#716D65] placeholder-[#716D65]/40 outline-none focus:outline-none"
        />
      </div>
    </div>
  );
}
