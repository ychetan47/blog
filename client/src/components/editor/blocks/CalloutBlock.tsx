import { useRef, useEffect } from 'react';
import { Info, Lightbulb, AlertTriangle, Bookmark, ChevronDown } from 'lucide-react';
import type { Block } from '../types.js';

interface CalloutBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onFocus: () => void;
}

export function CalloutBlock({
  block,
  isFocused,
  onUpdate,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: CalloutBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const variant = block.variant || 'note';

  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== (block.content || '')) {
        contentRef.current.innerHTML = block.content || '';
      }
    }
  }, [block.content]);

  useEffect(() => {
    if (isFocused && contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.focus();
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

  const variantConfigs = {
    note: {
      bg: 'bg-[#F4F1EA]',
      border: 'border-[#DDD9D0]',
      icon: Bookmark,
      label: 'Note',
      iconColor: 'text-[#716D65]',
    },
    tip: {
      bg: 'bg-[#F0F4EE]',
      border: 'border-[#D0DDD0]',
      icon: Lightbulb,
      label: 'Tip',
      iconColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-[#FAF4E8]',
      border: 'border-[#EADBB8]',
      icon: AlertTriangle,
      label: 'Warning',
      iconColor: 'text-amber-700',
    },
    info: {
      bg: 'bg-[#EEF2F5]',
      border: 'border-[#CED8E0]',
      icon: Info,
      label: 'Info',
      iconColor: 'text-sky-700',
    },
  };

  const currentConfig = variantConfigs[variant] || variantConfigs.note;
  const Icon = currentConfig.icon;

  return (
    <div
      onClick={onFocus}
      className={`my-6 p-5 sm:p-6 rounded-2xl border ${currentConfig.border} ${currentConfig.bg} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${currentConfig.iconColor}`} />
          <div className="relative inline-flex items-center">
            <select
              value={variant}
              onChange={(e) => onUpdate({ variant: e.target.value as any })}
              className="appearance-none bg-transparent pr-5 text-xs font-semibold uppercase tracking-wider text-[#716D65] cursor-pointer outline-none"
            >
              <option value="note">Note</option>
              <option value="tip">Tip</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#716D65] pointer-events-none absolute right-0" />
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Write your note or callout here..."
        className="w-full text-base sm:text-[17px] leading-relaxed text-[#211E1A] outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#716D65]/40"
      />
    </div>
  );
}
