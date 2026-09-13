import { useState, useRef, useEffect } from 'react';
import { Check, Copy, Code, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, highlightCode } from '../../../lib/syntaxHighlight.js';
import type { Block } from '../types.js';

interface CodeBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onFocus: () => void;
}

export function CodeBlock({ block, isFocused: _isFocused, onUpdate, onFocus }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lang = block.language || 'javascript';
  const code = block.content || '';

  // Auto-resize textarea to fit content
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 80)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [code, isEditing]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onUpdate({ content: newValue });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const highlightedHtml = highlightCode(code, lang);

  return (
    <div
      onClick={onFocus}
      className="my-6 rounded-xl overflow-hidden border border-[#38332E] bg-[#1E1D1B] shadow-md transition-all group/code"
    >
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171614] border-b border-[#2C2925]">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-[#9E9B95]" />
          <div className="relative inline-flex items-center">
            <select
              value={lang}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className="appearance-none bg-transparent pr-6 text-xs font-mono text-[#DDD9D0] cursor-pointer outline-none focus:text-white"
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id} className="bg-[#1E1D1B] text-[#DDD9D0]">
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#716D65] pointer-events-none absolute right-0" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-2.5 py-1 text-[11px] font-sans font-medium text-[#9E9B95] hover:text-[#F8F7F3] rounded bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-[#9E9B95] hover:text-[#F8F7F3] rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        {isEditing || !code ? (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              onUpdate({ content: e.target.value });
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (code) setIsEditing(false);
            }}
            placeholder="// Paste or write your code here..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full bg-transparent text-[#DDD9D0] placeholder-[#716D65]/50 outline-none resize-none overflow-hidden font-mono text-xs sm:text-sm leading-relaxed"
          />
        ) : (
          <pre
            onClick={() => setIsEditing(true)}
            className="cursor-text group-hover/code:opacity-95"
            title="Click to edit code"
          >
            <code
              className={`language-${lang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span class="text-[#716D65]/40">// Empty code block</span>' }}
            />
          </pre>
        )}
      </div>
    </div>
  );
}
