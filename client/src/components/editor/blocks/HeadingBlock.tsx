import { useEffect, useRef } from 'react';
import type { Block } from '../types.js';

interface HeadingBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onFocus: () => void;
}

export function HeadingBlock({
  block,
  isFocused,
  onUpdate,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: HeadingBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const level = block.level || 2;

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== (block.content || '')) {
        ref.current.innerHTML = block.content || '';
      }
    }
  }, [block.content]);

  useEffect(() => {
    if (isFocused && ref.current && document.activeElement !== ref.current) {
      ref.current.focus();
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
    onUpdate({ content: ref.current.innerHTML });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
      return;
    }

    if (e.key === 'Backspace') {
      const text = ref.current?.innerText.replace(/\n/g, '').trim() || '';
      if (!text) {
        e.preventDefault();
        onBackspaceEmpty();
        return;
      }
    }
  };

  const placeholder =
    level === 1 ? 'Heading 1' : level === 2 ? 'Heading 2' : 'Subheading';

  const sizeClasses =
    level === 1
      ? 'text-3xl sm:text-4xl mt-7 mb-2'
      : level === 2
      ? 'text-2xl sm:text-3xl mt-5 mb-2'
      : 'text-xl sm:text-2xl mt-4 mb-1.5';

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
        className={`w-full font-editorial font-normal text-[#211E1A] tracking-[-0.015em] outline-none focus:outline-none transition-colors ${sizeClasses} ${
          isEmpty ? 'before:content-[attr(data-placeholder)] before:text-[#716D65]/40 before:pointer-events-none' : ''
        }`}
      />
    </div>
  );
}
