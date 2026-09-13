import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import type { Category, Subcategory } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import type { Block, UnsplashPhoto } from '../components/editor/types.js';
import { EditorHeader } from '../components/editor/EditorHeader.js';
import { ArticleMeta } from '../components/editor/ArticleMeta.js';
import { BlockEditor } from '../components/editor/BlockEditor.js';
import { ArticleRenderer } from '../components/ArticleRenderer.js';
import { UnsplashDialog } from '../components/editor/dialogs/UnsplashDialog.js';
import { Edit3 } from 'lucide-react';

export function WritePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const draftIdParam = searchParams.get('id');

  const [draftId, setDraftId] = useState<string | null>(draftIdParam);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b-init', type: 'paragraph', content: '' },
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUnsplashOpen, setCoverUnsplashOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Track initial load completion to avoid triggering autosave immediately
  const [isLoaded, setIsLoaded] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Fetch categories and subcategories
  useEffect(() => {
    Promise.all([
      api.categories.list().catch(() => ({ categories: [] })),
      api.subcategories.list().catch(() => ({ subcategories: [] })),
    ]).then(([catRes, subRes]) => {
      setCategories(catRes.categories || []);
      setAvailableSubcategories(subRes.subcategories || []);
      if (catRes.categories && catRes.categories.length > 0 && !categoryId) {
        setCategoryId(catRes.categories[0].id);
      }
    });
  }, []);

  // 2. Load existing draft if ?id= is present
  useEffect(() => {
    if (!draftIdParam) {
      setIsLoaded(true);
      return;
    }

    setDraftId(draftIdParam);
    api.posts
      .getDraft(draftIdParam)
      .then((res) => {
        const post = res.post;
        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setCategoryId(post.categoryId || '');
        setCoverImage(post.coverImage || null);

        if (post.subcategories && Array.isArray(post.subcategories)) {
          setSelectedSubcategoryIds(
            post.subcategories.map((s: any) => s.id || s)
          );
        }

        if (post.tags && Array.isArray(post.tags)) {
          setTags(
            post.tags.map((t: any) =>
              typeof t === 'string' ? t : t.name || t.tag?.name || ''
            ).filter(Boolean)
          );
        }

        if (post.content) {
          try {
            const parsed = JSON.parse(post.content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlocks(parsed);
            } else {
              setBlocks([{ id: 'b-1', type: 'paragraph', content: post.content }]);
            }
          } catch {
            setBlocks([{ id: 'b-1', type: 'paragraph', content: post.content }]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load draft:', err);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [draftIdParam]);

  // 3. Word count & Reading time calculations
  const { wordCount, readingTime } = useMemo(() => {
    let totalText = `${title} ${excerpt} `;
    for (const b of blocks) {
      if (b.content) {
        totalText += ' ' + b.content.replace(/<[^>]+>/g, ' ');
      }
      if (b.items) {
        totalText += ' ' + b.items.join(' ').replace(/<[^>]+>/g, ' ');
      }
      if (b.sectionTitle) {
        totalText += ' ' + b.sectionTitle.replace(/<[^>]+>/g, ' ');
      }
    }
    const words = totalText.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    const time = Math.max(1, Math.ceil(count / 200));
    return { wordCount: count, readingTime: time };
  }, [title, excerpt, blocks]);

  // 4. Save logic (Draft or Publish)
  const saveArticle = async (publish = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const payload = {
      title: title.trim() || 'Untitled Story',
      excerpt: excerpt.trim(),
      content: JSON.stringify(blocks),
      categoryId: categoryId || undefined,
      subcategoryIds: selectedSubcategoryIds,
      tagNames: tags,
      coverImage: coverImage || undefined,
      published: publish,
    };

    setIsPending(true);
    setSaveStatus('saving');

    try {
      if (draftId) {
        await api.posts.update(draftId, payload);
      } else {
        const res = await api.posts.create(payload);
        const newId = res.post.id;
        setDraftId(newId);
        setSearchParams({ id: newId }, { replace: true });
      }
      setSaveStatus('saved');
      setError(null);

      if (publish) {
        navigate('/stories');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setError(err.message || 'Failed to save essay');
    } finally {
      setIsPending(false);
    }
  };

  // 5. Debounced Autosave (1500ms)
  useEffect(() => {
    if (!isLoaded || !user) return;
    // Only autosave if there is at least something typed
    const hasContent = title.trim() || blocks.some((b) => b.content && b.content.trim());
    if (!hasContent) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus('idle');

    autoSaveTimerRef.current = setTimeout(() => {
      saveArticle(false);
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    title,
    excerpt,
    categoryId,
    selectedSubcategoryIds,
    tags,
    coverImage,
    blocks,
    isLoaded,
    user,
  ]);

  const handlePublish = () => {
    if (!title.trim()) {
      setError('Please provide a title before publishing.');
      return;
    }
    saveArticle(true);
  };

  const selectedSubs = availableSubcategories.filter((s) =>
    selectedSubcategoryIds.includes(s.id)
  );

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36 transition-colors">
      {/* Editorial Header */}
      <EditorHeader
        onSaveDraft={() => saveArticle(false)}
        onPublish={handlePublish}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(!isPreview)}
        saveStatus={saveStatus}
        isPending={isPending}
        wordCount={wordCount}
        readingTime={readingTime}
      />

      {error && (
        <div className="max-w-[760px] mx-auto px-6 mt-4">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* Main Canvas */}
      {isPreview ? (
        /* Preview Mode */
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 pt-10 sm:pt-16 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#DDD9D0]">
            <span className="text-xs uppercase tracking-[0.16em] text-[#716D65]">
              Article Preview
            </span>
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-[#38332E] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>
          </div>

          {/* Meta Hierarchy: CATEGORY · SUBCATEGORIES · READING TIME */}
          <div className="flex flex-wrap items-center gap-y-1 text-[12px] uppercase tracking-[0.18em] text-[#716D65] mb-4">
            <span className="font-medium text-[#211E1A]">
              {categories.find((c) => c.id === categoryId)?.name || 'Editorial'}
            </span>
            {selectedSubs.length > 0 && (
              <>
                <span className="mx-2">·</span>
                <span>{selectedSubs.map((s) => s.name).join(' · ')}</span>
              </>
            )}
            <span className="mx-2">·</span>
            <span>{readingTime} min read</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#211E1A] font-normal leading-[1.08] tracking-tight">
            {title || 'Untitled Essay'}
          </h1>

          {excerpt && (
            <p className="text-[#716D65] text-lg sm:text-xl leading-relaxed mt-5 font-normal">
              {excerpt}
            </p>
          )}

          {coverImage && (
            <div className="my-10 overflow-hidden rounded-xl border border-[#DDD9D0]">
              <img src={coverImage} alt="Cover" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#DDD9D0]">
            <ArticleRenderer content={blocks} />
          </div>

          {/* Preview Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-[#DDD9D0]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A867E] mb-3">
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#EBE8E0] text-xs text-[#211E1A] rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="max-w-[760px] mx-auto px-6 sm:px-8">
          {/* Article Meta: Title, Subtitle, Category, Subcategories, Tags, Cover */}
          <ArticleMeta
            title={title}
            onChangeTitle={setTitle}
            excerpt={excerpt}
            onChangeExcerpt={setExcerpt}
            categoryId={categoryId}
            onChangeCategory={setCategoryId}
            categories={categories}
            availableSubcategories={availableSubcategories}
            selectedSubcategoryIds={selectedSubcategoryIds}
            onChangeSubcategories={setSelectedSubcategoryIds}
            tags={tags}
            onChangeTags={setTags}
            coverImage={coverImage}
            onChangeCoverImage={setCoverImage}
            onOpenUnsplashForCover={() => setCoverUnsplashOpen(true)}
          />

          {/* Divider between metadata and canvas */}
          <div className="my-8 border-b border-[#DDD9D0]/50" />

          {/* Block-based Canvas */}
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>
      )}

      {/* Unsplash Dialog for Cover Photo */}
      <UnsplashDialog
        isOpen={coverUnsplashOpen}
        onClose={() => setCoverUnsplashOpen(false)}
        onSelect={(photo: UnsplashPhoto) => {
          setCoverImage(photo.url);
          setCoverUnsplashOpen(false);
        }}
      />
    </div>
  );
}
