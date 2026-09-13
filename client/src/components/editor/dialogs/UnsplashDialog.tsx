import { useState, useEffect } from 'react';
import { Search, X, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../../../services/api.js';
import type { UnsplashPhoto } from '../types.js';

interface UnsplashDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: UnsplashPhoto) => void;
}

export function UnsplashDialog({ isOpen, onClose, onSelect }: UnsplashDialogProps) {
  const [query, setQuery] = useState('minimalist editorial');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const searchPhotos = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.unsplash.search(term, 1, 12);
      setPhotos(res.results);
      if (res.message) {
        setNotice(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search Unsplash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchPhotos(query);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchPhotos(query.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#211E1A]/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[680px] max-h-[85vh] flex flex-col bg-[#F8F7F3] border border-[#DDD9D0] rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DDD9D0]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#716D65]" />
            <h2 className="font-editorial text-2xl text-[#211E1A]">Search Unsplash</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="my-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photography (e.g. vintage computer, architecture, quiet desk)..."
              autoFocus
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[#DDD9D0] bg-white text-sm text-[#211E1A] outline-none focus:border-[#211E1A] transition-colors shadow-2xs"
            />
            <Search className="w-4 h-4 text-[#8A867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#211E1A] text-[#F8F7F3] rounded-lg text-xs font-medium hover:bg-[#3D3833] transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {notice && (
          <p className="text-[11px] text-[#8A867E] italic mb-3">
            {notice}
          </p>
        )}

        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Photos Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#8A867E]">
              <Loader2 className="w-6 h-6 animate-spin text-[#211E1A]" />
              <p className="text-xs">Finding photography...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="py-16 text-center text-[#8A867E]">
              <p className="font-editorial text-xl text-[#211E1A] mb-1">No photographs found</p>
              <p className="text-xs">Try searching for different keywords like architecture, typography, or paper.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-lg overflow-hidden border border-[#DDD9D0] bg-stone-100 aspect-4/3 cursor-pointer"
                  onClick={() => {
                    onSelect(photo);
                    onClose();
                  }}
                >
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <p className="text-white text-xs font-medium truncate">
                      {photo.photographerName}
                    </p>
                    <a
                      href={photo.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-stone-300 hover:text-white flex items-center gap-1 mt-0.5"
                    >
                      <span>Unsplash</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="pt-3 border-t border-[#DDD9D0] mt-3 text-center text-[11px] text-[#8A867E]">
          Photos provided via Unsplash Community under the Unsplash License.
        </div>
      </div>
    </div>
  );
}
