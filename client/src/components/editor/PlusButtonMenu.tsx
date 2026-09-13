import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  Sparkles,
  Code2,
  Play,
  Share2,
  Minus,
  List,
  ListOrdered,
  AlertCircle,
  BookmarkPlus,
} from 'lucide-react';
import type { BlockType } from './types.js';

interface PlusButtonMenuProps {
  onInsertBlock: (type: BlockType, extra?: Record<string, any>) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function PlusButtonMenu({
  onInsertBlock,
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
}: PlusButtonMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const close = () => {
    if (onToggle && isOpen) {
      onToggle();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const menuGroups = [
    {
      label: 'Text & Headings',
      items: [
        {
          type: 'paragraph' as BlockType,
          name: 'Text',
          desc: 'Start writing with plain body text',
          icon: Type,
        },
        {
          type: 'heading' as BlockType,
          extra: { level: 1 },
          name: 'Heading 1',
          desc: 'Large editorial chapter heading',
          icon: Heading1,
        },
        {
          type: 'heading' as BlockType,
          extra: { level: 2 },
          name: 'Heading 2',
          desc: 'Medium section title',
          icon: Heading2,
        },
        {
          type: 'heading' as BlockType,
          extra: { level: 3 },
          name: 'Heading 3',
          desc: 'Small subsection header',
          icon: Heading3,
        },
      ],
    },
    {
      label: 'Media & Code',
      items: [
        {
          type: 'image' as BlockType,
          name: 'Image',
          desc: 'Upload an image from your device',
          icon: ImageIcon,
        },
        {
          type: 'image' as BlockType,
          extra: { source: 'unsplash' },
          name: 'Unsplash',
          desc: 'Search editorial photography',
          icon: Sparkles,
        },
        {
          type: 'code' as BlockType,
          name: 'Code',
          desc: 'Syntax-highlighted code block',
          icon: Code2,
        },
        {
          type: 'video' as BlockType,
          name: 'Video',
          desc: 'Embed YouTube or Vimeo video',
          icon: Play,
        },
        {
          type: 'embed' as BlockType,
          name: 'Embed',
          desc: 'Embed an interactive external URL',
          icon: Share2,
        },
      ],
    },
    {
      label: 'Structure & Quotes',
      items: [
        {
          type: 'quote' as BlockType,
          name: 'Quote',
          desc: 'Editorial quote with optional author',
          icon: Quote,
        },
        {
          type: 'divider' as BlockType,
          name: 'Divider',
          desc: 'Horizontal section separator',
          icon: Minus,
        },
        {
          type: 'list' as BlockType,
          extra: { listType: 'bullet' },
          name: 'Bulleted list',
          desc: 'Create an unnumbered list',
          icon: List,
        },
        {
          type: 'list' as BlockType,
          extra: { listType: 'numbered' },
          name: 'Numbered list',
          desc: 'Create an ordered sequence',
          icon: ListOrdered,
        },
        {
          type: 'callout' as BlockType,
          name: 'Callout',
          desc: 'Editorial note, tip or reflection',
          icon: AlertCircle,
        },
        {
          type: 'section' as BlockType,
          name: 'New Part',
          desc: 'Part II article section break',
          icon: BookmarkPlus,
        },
      ],
    },
  ];

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Plus (+) Button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Add block to your story"
        className={`w-7 h-7 rounded-full border border-[#DDD9D0] flex items-center justify-center text-[#716D65] hover:text-[#211E1A] hover:border-[#8A867E] bg-[#F8F7F3] transition-all cursor-pointer ${
          isOpen ? 'rotate-45 text-[#211E1A] border-[#211E1A]' : ''
        }`}
      >
        <Plus className="w-4 h-4 transition-transform" />
      </button>

      {/* Block Insertion Popup Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Add to your story"
          className="absolute left-9 top-0 w-[320px] sm:w-[340px] max-h-[460px] overflow-y-auto bg-[#F8F7F3] border border-[#DDD9D0] rounded-xl shadow-lg shadow-black/5 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#8A867E] font-medium border-b border-[#DDD9D0]/60 mb-1.5">
            Add to your story
          </div>

          <div className="space-y-3">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-[#A09D96]">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onInsertBlock(item.type, item.extra);
                          close();
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left hover:bg-[#EFECE6] transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#F3F1EB] group-hover:bg-white border border-[#DDD9D0]/60 flex items-center justify-center text-[#716D65] group-hover:text-[#211E1A] shrink-0 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#211E1A] leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#8A867E] truncate leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
