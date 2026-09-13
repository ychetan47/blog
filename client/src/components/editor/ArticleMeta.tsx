import { useState, useRef } from 'react';
import { ImagePlus, X, Sparkles, Plus, Check } from 'lucide-react';
import type { Category, Subcategory } from '../../types/index.js';

interface ArticleMetaProps {
  title: string;
  onChangeTitle: (title: string) => void;
  excerpt: string;
  onChangeExcerpt: (excerpt: string) => void;
  categoryId: string;
  onChangeCategory: (categoryId: string) => void;
  categories: Category[];
  availableSubcategories: Subcategory[];
  selectedSubcategoryIds: string[];
  onChangeSubcategories: (ids: string[]) => void;
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  coverImage?: string | null;
  onChangeCoverImage: (url: string | null) => void;
  onOpenUnsplashForCover: () => void;
}

export function ArticleMeta({
  title,
  onChangeTitle,
  excerpt,
  onChangeExcerpt,
  categoryId,
  onChangeCategory,
  categories,
  availableSubcategories,
  selectedSubcategoryIds,
  onChangeSubcategories,
  tags,
  onChangeTags,
  coverImage,
  onChangeCoverImage,
  onOpenUnsplashForCover,
}: ArticleMetaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subSearch, setSubSearch] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToggleSubcategory = (id: string) => {
    if (selectedSubcategoryIds.includes(id)) {
      onChangeSubcategories(selectedSubcategoryIds.filter((item) => item !== id));
    } else {
      onChangeSubcategories([...selectedSubcategoryIds, id]);
    }
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (!clean) return;

    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      onChangeTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChangeTags(tags.filter((t) => t !== tagToRemove));
  };

  // Filter subcategories: prioritizes current category
  const filteredSubcategories = availableSubcategories.filter((sub) => {
    if (subSearch) {
      return sub.name.toLowerCase().includes(subSearch.toLowerCase());
    }
    // If no search, show subcategories belonging to current category + any already selected
    return (
      (categoryId && sub.categoryId === categoryId) ||
      selectedSubcategoryIds.includes(sub.id)
    );
  });

  return (
    <div className="space-y-6 pt-6 sm:pt-10">
      {/* Optional Cover Image */}
      {coverImage ? (
        <div className="relative group rounded-md overflow-hidden border border-[#DDD9D0] mb-8">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-[280px] sm:h-[380px] object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onOpenUnsplashForCover}
              className="px-3 py-1.5 rounded-full bg-[#211E1A]/80 text-[#F8F7F3] text-xs font-medium hover:bg-[#211E1A] transition-colors cursor-pointer backdrop-blur-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeCoverImage(null)}
              className="p-1.5 rounded-full bg-[#211E1A]/80 text-[#F8F7F3] hover:bg-[#211E1A] transition-colors cursor-pointer backdrop-blur-xs"
              title="Remove cover"
              aria-label="Remove cover image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs text-[#8A867E] hover:text-[#211E1A] transition-colors cursor-pointer py-1"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Add cover image</span>
          </button>
          <span className="text-[#DDD9D0]">·</span>
          <button
            type="button"
            onClick={onOpenUnsplashForCover}
            className="inline-flex items-center gap-1.5 text-xs text-[#8A867E] hover:text-[#211E1A] transition-colors cursor-pointer py-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unsplash</span>
          </button>
        </div>
      )}

      {/* Large Editorial Serif Title (No input borders) */}
      <div>
        <textarea
          rows={1}
          placeholder="Title..."
          value={title}
          onChange={(e) => {
            onChangeTitle(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className="w-full font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#211E1A] font-normal leading-[1.1] tracking-[-0.025em] bg-transparent outline-none border-none p-0 resize-none placeholder:text-[#A09D96]"
        />
      </div>

      {/* Short Excerpt / Subtitle */}
      <div>
        <textarea
          rows={1}
          placeholder="Short excerpt or subtitle..."
          value={excerpt}
          onChange={(e) => {
            onChangeExcerpt(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className="w-full text-lg sm:text-xl text-[#716D65] font-normal leading-relaxed bg-transparent outline-none border-none p-0 resize-none placeholder:text-[#B5B2AA]"
        />
      </div>

      {/* Story Taxonomy: Primary Category + Subcategories + Tags */}
      <div className="pt-6 pb-6 border-y border-[#DDD9D0] space-y-5">
        {/* 1. Primary Category */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-xs uppercase tracking-[0.16em] text-[#8A867E] font-medium min-w-[120px]">
            Primary Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => onChangeCategory(e.target.value)}
            aria-label="Article category"
            className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg text-xs font-medium text-[#211E1A] outline-none hover:border-[#8A867E] transition-colors cursor-pointer w-full sm:w-auto"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-[#8A867E]">
            High-level publication section
          </span>
        </div>

        {/* 2. Subcategories (Multiple selection) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-[0.16em] text-[#8A867E] font-medium">
                Subcategories
              </label>
              <span className="text-[11px] text-[#8A867E]">
                ({selectedSubcategoryIds.length} selected — drives reader recommendations)
              </span>
            </div>
            <input
              type="text"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              placeholder="Filter subcategories..."
              className="px-2.5 py-1 bg-[#FFFFFF] border border-[#DDD9D0] rounded-md text-xs text-[#211E1A] placeholder-[#8A867E]/60 outline-none w-44"
            />
          </div>

          {/* Subcategory Pills */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#F3F1EB]/50 rounded-lg border border-[#DDD9D0]">
            {filteredSubcategories.map((sub) => {
              const isSelected = selectedSubcategoryIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleToggleSubcategory(sub.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#211E1A] text-[#F8F7F3]'
                      : 'bg-[#FFFFFF] border border-[#DDD9D0] text-[#716D65] hover:text-[#211E1A] hover:border-[#8A867E]'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3 h-3 text-[#F8F7F3]" />
                  ) : (
                    <Plus className="w-3 h-3 text-[#8A867E]" />
                  )}
                  <span>{sub.name}</span>
                </button>
              );
            })}
            {filteredSubcategories.length === 0 && (
              <p className="text-xs text-[#8A867E] italic py-1 px-1">
                No matching subcategories found.
              </p>
            )}
          </div>
        </div>

        {/* 3. Optional Granular Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-[0.16em] text-[#8A867E] font-medium">
              Internal Tags (Optional)
            </label>
            <span className="text-[11px] text-[#8A867E]">
              Specific tools, libraries, or APIs
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EBE8E0] text-xs text-[#211E1A]"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[#716D65] hover:text-[#211E1A] cursor-pointer"
                  title="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag();
              }}
              className="inline-flex items-center gap-1"
            >
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag & press Enter..."
                className="px-2.5 py-1 bg-[#FFFFFF] border border-[#DDD9D0] rounded-md text-xs text-[#211E1A] placeholder-[#8A867E]/60 outline-none w-48"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-md bg-[#211E1A] text-[#F8F7F3] text-xs hover:bg-[#38332E] transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
