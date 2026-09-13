import { useState, useRef } from 'react';
import { Upload, Maximize2, Minimize2, MoveHorizontal, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import type { Block } from '../types.js';

interface ImageBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onRemove: () => void;
  onFocus: () => void;
}

export function ImageBlock({
  block,
  isFocused: _isFocused,
  onUpdate,
  onRemove,
  onFocus,
}: ImageBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const width = block.width || 'normal';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({
        url: dataUrl,
        photographerName: undefined,
        photographerUrl: undefined,
        unsplashUrl: undefined,
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const widthContainerClasses = {
    normal: 'max-w-full mx-auto',
    wide: 'max-w-[850px] -mx-4 sm:-mx-8 lg:-mx-12',
    full: 'w-full -mx-4 sm:-mx-12 lg:-mx-20',
  }[width];

  return (
    <div
      onClick={onFocus}
      className={`relative group/image my-8 transition-all ${widthContainerClasses}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {block.url ? (
        <div className="relative">
          {/* Floating Controls Bar (shown on hover or focus) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-[#211E1A]/85 backdrop-blur-md rounded-lg shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity">
            {/* Width Toggles */}
            <button
              type="button"
              onClick={() => onUpdate({ width: 'normal' })}
              title="Standard width"
              className={`p-1.5 rounded text-xs transition-colors ${
                width === 'normal'
                  ? 'bg-white/20 text-[#F8F7F3]'
                  : 'text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10'
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ width: 'wide' })}
              title="Wide width"
              className={`p-1.5 rounded text-xs transition-colors ${
                width === 'wide'
                  ? 'bg-white/20 text-[#F8F7F3]'
                  : 'text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10'
              }`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ width: 'full' })}
              title="Full container width"
              className={`p-1.5 rounded text-xs transition-colors ${
                width === 'full'
                  ? 'bg-white/20 text-[#F8F7F3]'
                  : 'text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

            {/* Replace image */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace image"
              className="p-1.5 rounded text-[#DDD9D0] hover:text-[#F8F7F3] hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Remove */}
            <button
              type="button"
              onClick={onRemove}
              title="Remove image"
              className="p-1.5 rounded text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Image */}
          <div className="overflow-hidden rounded-xl bg-[#EFECE6]">
            <img
              src={block.url}
              alt={block.caption || 'Article illustration'}
              className="w-full h-auto object-cover max-h-[700px] transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Caption & Attribution */}
          <div className="mt-2.5 flex flex-col items-center justify-center gap-1">
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Type an optional caption..."
              className="w-full text-center text-xs sm:text-sm italic text-[#716D65] placeholder-[#716D65]/40 bg-transparent outline-none focus:outline-none"
            />

            {block.photographerName && (
              <div className="flex items-center gap-1 text-[11px] text-[#716D65]/70">
                <span>Photo by</span>
                {block.photographerUrl ? (
                  <a
                    href={block.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#211E1A] transition-colors"
                  >
                    {block.photographerName}
                  </a>
                ) : (
                  <span>{block.photographerName}</span>
                )}
                <span>on</span>
                <a
                  href={block.unsplashUrl || 'https://unsplash.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#211E1A] transition-colors flex items-center gap-0.5"
                >
                  Unsplash
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-10 border-2 border-dashed border-[#DDD9D0] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#211E1A]/40 hover:bg-[#F3F0E8]/50 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#716D65] mb-3 group-hover/image:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#211E1A]">
            {isUploading ? 'Uploading image...' : 'Click to upload an image'}
          </p>
          <p className="text-xs text-[#716D65] mt-1">PNG, JPG, WEBP, or GIF</p>
        </div>
      )}
    </div>
  );
}
