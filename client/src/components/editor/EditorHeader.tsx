import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Edit3 } from 'lucide-react';

interface EditorHeaderProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  isPreview: boolean;
  onTogglePreview: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isPending: boolean;
  wordCount: number;
  readingTime: number;
}

export function EditorHeader({
  onSaveDraft,
  onPublish,
  isPreview,
  onTogglePreview,
  saveStatus,
  isPending,
  wordCount,
  readingTime,
}: EditorHeaderProps) {
  return (
    <div className="w-full bg-[#F8F7F3] border-b border-[#DDD9D0]/60 py-4 px-6 sm:px-10 sticky top-[80px] sm:top-[96px] z-30 transition-colors backdrop-blur-xs">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4">
        {/* Left: ← STORIES */}
        <Link
          to="/stories"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#716D65] hover:text-[#211E1A] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Stories</span>
        </Link>

        {/* Center / Right: Stats + Autosave indicator + Action buttons */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Word count & Reading time */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#8A867E]">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>

          {/* Autosave Status Indicator */}
          <div className="text-xs text-[#8A867E] min-w-[70px] text-right">
            {saveStatus === 'saving' && <span className="italic">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[#716D65]">Saved</span>}
            {saveStatus === 'error' && <span className="text-rose-600">Save failed</span>}
            {saveStatus === 'idle' && <span>Draft</span>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Preview toggle */}
            <button
              type="button"
              onClick={onTogglePreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-xs font-medium text-[#211E1A] bg-transparent hover:bg-[#F3F1EB] transition-colors cursor-pointer"
              title={isPreview ? 'Back to editing' : 'Preview reading experience'}
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-[#716D65]" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#716D65]" />
                  <span>Preview</span>
                </>
              )}
            </button>

            {/* Save draft */}
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isPending}
              className="px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-xs font-medium text-[#211E1A] bg-transparent hover:bg-[#F3F1EB] transition-colors cursor-pointer disabled:opacity-50"
            >
              Save draft
            </button>

            {/* Publish */}
            <button
              type="button"
              onClick={onPublish}
              disabled={isPending}
              className="px-5 py-1.5 rounded-full bg-[#211E1A] hover:bg-[#3D3833] text-[#F8F7F3] text-xs font-medium transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
