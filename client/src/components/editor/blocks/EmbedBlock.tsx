import { ExternalLink, Trash2, Edit3, Globe } from 'lucide-react';
import type { Block } from '../types.js';

interface EmbedBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onRemove: () => void;
  onEditUrl?: () => void;
  onFocus: () => void;
}

export function EmbedBlock({
  block,
  isFocused: _isFocused,
  onUpdate,
  onRemove,
  onEditUrl,
  onFocus,
}: EmbedBlockProps) {
  const url = block.url || '';

  const getEmbedSource = (raw: string): string => {
    if (!raw) return '';

    // Spotify
    if (raw.includes('open.spotify.com') && !raw.includes('/embed/')) {
      return raw.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }

    // CodePen
    if (raw.includes('codepen.io') && raw.includes('/pen/')) {
      return raw.replace('/pen/', '/embed/');
    }

    // Loom
    if (raw.includes('loom.com/share/')) {
      return raw.replace('loom.com/share/', 'loom.com/embed/');
    }

    return raw;
  };

  const embedSrc = getEmbedSource(url);

  return (
    <div
      onClick={onFocus}
      className="relative group/embed my-8 w-full max-w-[760px] mx-auto transition-all"
    >
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-[#211E1A]/85 backdrop-blur-md rounded-lg shadow-lg opacity-0 group-hover/embed:opacity-100 transition-opacity">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          className="p-1.5 rounded text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {onEditUrl && (
          <button
            type="button"
            onClick={onEditUrl}
            title="Edit embed URL"
            className="p-1.5 rounded text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          title="Remove embed"
          className="p-1.5 rounded text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embed frame */}
      <div className="w-full h-[380px] sm:h-[450px] rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#DDD9D0] shadow-sm">
        {embedSrc ? (
          <iframe
            src={embedSrc}
            title={block.caption || 'Interactive embed'}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            loading="lazy"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#716D65] p-6 text-center">
            <Globe className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Empty Embed</p>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-2.5">
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Add an optional embed caption..."
          className="w-full text-center text-xs sm:text-sm italic text-[#716D65] placeholder-[#716D65]/40 bg-transparent outline-none focus:outline-none"
        />
      </div>
    </div>
  );
}
