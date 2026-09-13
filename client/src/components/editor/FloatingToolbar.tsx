import { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Code,
  Heading1,
  Heading2,
  Quote,
} from 'lucide-react';

interface FloatingToolbarProps {
  onFormat: (action: string, value?: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingToolbar({ onFormat, containerRef }: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        if (!isLinkPromptOpen) {
          setVisible(false);
        }
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        if (!isLinkPromptOpen) setVisible(false);
        return;
      }

      // Ensure selection is inside the container
      if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
        setVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position toolbar directly above selection
      const top = rect.top - 52;
      const left = rect.left + rect.width / 2;

      setPosition({ top: Math.max(10, top), left });
      setVisible(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef, isLinkPromptOpen]);

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      onFormat('link', linkUrl);
      setLinkUrl('');
    }
    setIsLinkPromptOpen(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text formatting"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="fixed z-50 flex items-center bg-[#211E1A] text-[#F8F7F3] rounded-lg shadow-xl shadow-black/25 px-1 py-1 border border-white/10 animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
    >
      {isLinkPromptOpen ? (
        <form onSubmit={handleApplyLink} className="flex items-center gap-1.5 px-2 py-0.5">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste link https://..."
            autoFocus
            className="w-44 px-2 py-1 bg-[#322F2A] rounded text-[#F8F7F3] text-xs outline-none"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-white text-[#211E1A] rounded text-[11px] font-medium hover:bg-stone-200"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setIsLinkPromptOpen(false)}
            className="px-1.5 py-1 text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </form>
      ) : (
        <div className="flex items-center divide-x divide-white/15">
          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 px-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('bold');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Bold (Cmd+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('italic');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Italic (Cmd+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('underline');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Underline (Cmd+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('strike');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsLinkPromptOpen(true);
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Link (Cmd+K)"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('code');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Inline code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Block Level Transform */}
          <div className="flex items-center gap-0.5 px-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('h1');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors font-serif font-bold text-xs"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('h2');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors font-serif font-bold text-xs"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onFormat('quote');
              }}
              className="p-1.5 rounded hover:bg-white/15 transition-colors"
              title="Quote block"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Downward pointer triangle */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#211E1A]" />
    </div>
  );
}
