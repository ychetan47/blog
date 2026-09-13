import { Trash2, Edit3, Video as VideoIcon } from 'lucide-react';
import type { Block } from '../types.js';

interface VideoBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onRemove: () => void;
  onEditUrl?: () => void;
  onFocus: () => void;
}

export function VideoBlock({
  block,
  isFocused: _isFocused,
  onUpdate,
  onRemove,
  onEditUrl,
  onFocus,
}: VideoBlockProps) {
  const url = block.url || '';

  const getEmbedUrl = (rawUrl: string): { type: 'youtube' | 'vimeo' | 'direct' | 'unknown'; embedSrc: string } => {
    if (!rawUrl) return { type: 'unknown', embedSrc: '' };

    // YouTube
    const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return { type: 'youtube', embedSrc: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return { type: 'vimeo', embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // Direct
    if (/\.(mp4|webm|ogg)$/i.test(rawUrl) || rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      return { type: 'direct', embedSrc: rawUrl };
    }

    return { type: 'unknown', embedSrc: rawUrl };
  };

  const { type, embedSrc } = getEmbedUrl(url);

  return (
    <div
      onClick={onFocus}
      className="relative group/video my-8 w-full max-w-[760px] mx-auto transition-all"
    >
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-[#211E1A]/85 backdrop-blur-md rounded-lg shadow-lg opacity-0 group-hover/video:opacity-100 transition-opacity">
        {onEditUrl && (
          <button
            type="button"
            onClick={onEditUrl}
            title="Change video URL"
            className="p-1.5 rounded text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          title="Remove video"
          className="p-1.5 rounded text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Video Content */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#1E1D1B] shadow-md border border-[#DDD9D0]/50">
        {type === 'youtube' || type === 'vimeo' ? (
          <iframe
            src={embedSrc}
            title={block.caption || 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : type === 'direct' ? (
          <video src={embedSrc} controls className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#716D65] p-6 text-center">
            <VideoIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Unable to preview video URL</p>
            <p className="text-xs mt-1 truncate max-w-md opacity-70">{url}</p>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-2.5">
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Add an optional video caption..."
          className="w-full text-center text-xs sm:text-sm italic text-[#716D65] placeholder-[#716D65]/40 bg-transparent outline-none focus:outline-none"
        />
      </div>
    </div>
  );
}
