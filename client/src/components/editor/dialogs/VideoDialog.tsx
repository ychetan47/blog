import { useState, useEffect } from 'react';
import { Video, X, AlertCircle } from 'lucide-react';

interface VideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, caption?: string) => void;
  initialUrl?: string;
  initialCaption?: string;
}

export function VideoDialog({
  isOpen,
  onClose,
  onInsert,
  initialUrl = '',
  initialCaption = '',
}: VideoDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [caption, setCaption] = useState(initialCaption);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setCaption(initialCaption);
      setError(null);
    }
  }, [isOpen, initialUrl, initialCaption]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please provide a video URL');
      return;
    }

    // Validate video source
    const isYouTube = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(trimmed);
    const isVimeo = /(?:vimeo\.com\/(?:video\/)?)/i.test(trimmed);
    const isDirect = /\.(mp4|webm|ogg)$/i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:');

    if (!isYouTube && !isVimeo && !isDirect) {
      setError('Supported sources: YouTube, Vimeo, or direct MP4/WebM video links.');
      return;
    }

    onInsert(trimmed, caption.trim() || undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#211E1A]/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[540px] flex flex-col bg-[#F8F7F3] border border-[#DDD9D0] rounded-2xl shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDD9D0]">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#716D65]" />
            <h2 className="font-editorial text-2xl text-[#211E1A]">Embed Video</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#716D65] mb-1.5">
              Video URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://www.youtube.com/watch?v=... or Vimeo"
              autoFocus
              className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl text-[#211E1A] placeholder-[#716D65]/60 text-sm focus:outline-none focus:border-[#211E1A] transition-colors"
            />
            <p className="text-xs text-[#716D65] mt-1.5">
              Paste a YouTube, Vimeo, or direct MP4 video link.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#716D65] mb-1.5">
              Caption <span className="font-normal text-[#716D65]/70">(optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Director's cut documentary excerpt"
              className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl text-[#211E1A] placeholder-[#716D65]/60 text-sm focus:outline-none focus:border-[#211E1A] transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD9D0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DDD9D0] text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#211E1A] text-[#F8F7F3] rounded-full text-xs font-medium hover:bg-[#38332E] transition-colors cursor-pointer"
            >
              Add Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
