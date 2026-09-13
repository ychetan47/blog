import { useState, useEffect, useRef } from 'react';
import {
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

interface SlashCommandItem {
  id: string;
  name: string;
  desc: string;
  type: BlockType;
  extra?: Record<string, any>;
  icon: any;
  keywords: string[];
}

const COMMAND_ITEMS: SlashCommandItem[] = [
  {
    id: 'text',
    name: 'Text',
    desc: 'Plain paragraph body text',
    type: 'paragraph',
    icon: Type,
    keywords: ['paragraph', 'text', 'p'],
  },
  {
    id: 'h1',
    name: 'Heading 1',
    desc: 'Large chapter heading',
    type: 'heading',
    extra: { level: 1 },
    icon: Heading1,
    keywords: ['heading1', 'h1', 'title', 'large'],
  },
  {
    id: 'h2',
    name: 'Heading 2',
    desc: 'Medium section title',
    type: 'heading',
    extra: { level: 2 },
    icon: Heading2,
    keywords: ['heading2', 'h2', 'section', 'medium'],
  },
  {
    id: 'h3',
    name: 'Heading 3',
    desc: 'Small subsection header',
    type: 'heading',
    extra: { level: 3 },
    icon: Heading3,
    keywords: ['heading3', 'h3', 'sub', 'small'],
  },
  {
    id: 'image',
    name: 'Image',
    desc: 'Upload an image from device',
    type: 'image',
    icon: ImageIcon,
    keywords: ['image', 'photo', 'picture', 'upload'],
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    desc: 'Search editorial photography',
    type: 'image',
    extra: { source: 'unsplash' },
    icon: Sparkles,
    keywords: ['unsplash', 'photo', 'stock', 'camera'],
  },
  {
    id: 'code',
    name: 'Code block',
    desc: 'Syntax-highlighted code',
    type: 'code',
    icon: Code2,
    keywords: ['code', 'programming', 'snippet', 'java', 'python', 'js'],
  },
  {
    id: 'quote',
    name: 'Quote',
    desc: 'Editorial blockquote',
    type: 'quote',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'citation'],
  },
  {
    id: 'video',
    name: 'Video',
    desc: 'Embed YouTube or Vimeo video',
    type: 'video',
    icon: Play,
    keywords: ['video', 'youtube', 'vimeo', 'media'],
  },
  {
    id: 'embed',
    name: 'Embed URL',
    desc: 'Interactive embed from URL',
    type: 'embed',
    icon: Share2,
    keywords: ['embed', 'iframe', 'figma', 'codepen'],
  },
  {
    id: 'divider',
    name: 'Divider',
    desc: 'Horizontal section separator',
    type: 'divider',
    icon: Minus,
    keywords: ['divider', 'line', 'separator', 'hr'],
  },
  {
    id: 'bullet-list',
    name: 'Bulleted list',
    desc: 'Create an unnumbered list',
    type: 'list',
    extra: { listType: 'bullet' },
    icon: List,
    keywords: ['bullet', 'list', 'ul'],
  },
  {
    id: 'numbered-list',
    name: 'Numbered list',
    desc: 'Create an ordered sequence',
    type: 'list',
    extra: { listType: 'numbered' },
    icon: ListOrdered,
    keywords: ['numbered', 'list', 'ol', 'order'],
  },
  {
    id: 'callout',
    name: 'Callout',
    desc: 'Editorial note, tip or reflection',
    type: 'callout',
    icon: AlertCircle,
    keywords: ['callout', 'note', 'tip', 'box'],
  },
  {
    id: 'part',
    name: 'New Part',
    desc: 'Part II article section break',
    type: 'section',
    icon: BookmarkPlus,
    keywords: ['part', 'section', 'chapter', 'break'],
  },
];

interface SlashCommandMenuProps {
  query: string;
  onSelect: (type: BlockType, extra?: Record<string, any>) => void;
  onClose: () => void;
}

export function SlashCommandMenu({ query, onSelect, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanQuery = query.toLowerCase().replace(/^\//, '').trim();

  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.name.toLowerCase().includes(cleanQuery) ||
      item.keywords.some((k) => k.includes(cleanQuery))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          onSelect(selected.type, selected.extra);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  if (filteredItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute left-0 top-full mt-1 w-[300px] max-h-[360px] overflow-y-auto bg-[#F8F7F3] border border-[#DDD9D0] rounded-xl shadow-lg shadow-black/5 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8A867E] font-medium border-b border-[#DDD9D0]/60 mb-1">
        Add block
      </div>

      <div className="space-y-0.5">
        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => onSelect(item.type, item.extra)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected ? 'bg-[#EFECE6]' : 'hover:bg-[#EFECE6]/60'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-[#F3F1EB] border border-[#DDD9D0]/60 flex items-center justify-center text-[#716D65] shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#211E1A] leading-tight">
                  {item.name}
                </p>
                <p className="text-[10px] text-[#8A867E] truncate leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
