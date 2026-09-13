import { useEffect, useRef } from 'react';
import type { Block } from '../types.js';

interface ParagraphBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onSlashTrigger: (rect: DOMRect) => void;
  onFocus: () => void;
  placeholder?: string;
}

export function ParagraphBlock({
  block,
  isFocused,
  onUpdate,
  onEnter,
  onBackspaceEmpty,
  onSlashTrigger,
  onFocus,
  placeholder = "Tell your story, or type '/' for commands...",
}: ParagraphBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync internal innerHTML if external content changes while not active
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== (block.content || '')) {
        ref.current.innerHTML = block.content || '';
      }
    }
  }, [block.content]);

  // Focus management
  useEffect(() => {
    if (isFocused && ref.current && document.activeElement !== ref.current) {
      ref.current.focus();
      // Place cursor at the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFocused]);

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    const text = ref.current.innerText.trim();

    onUpdate({ content: html });

    // Check for slash command trigger
    if (text === '/') {
      const rect = ref.current.getBoundingClientRect();
      onSlashTrigger(rect);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter (creates a new block)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    // Handle Backspace on empty block
    if (e.key === 'Backspace') {
      const text = ref.current?.innerText.replace(/\n/g, '').trim() || '';
      if (!text) {
        e.preventDefault();
        onBackspaceEmpty();
        return;
      }
    }
  };

  const isEmpty = !block.content || block.content === '<br>' || block.content === '';

  return (
    <div className="relative group/block py-1">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        data-placeholder={placeholder}
        className={`w-full min-h-[1.75rem] text-[18px] md:text-[19px] leading-[1.8] text-[#211E1A] font-sans font-normal tracking-[-0.01em] outline-none focus:outline-none transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-[#716D65]/40 empty:before:pointer-events-none ${
          isEmpty ? 'before:content-[attr(data-placeholder)] before:text-[#716D65]/40 before:pointer-events-none' : ''
        }`}
      />
    </div>
  );
}
