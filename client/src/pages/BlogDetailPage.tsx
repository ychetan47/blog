import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import type { Post } from '../types/index.js';
import { SaveButton } from '../components/SaveButton.js';
import { AuthorCard } from '../components/AuthorCard.js';
import { KeepReading } from '../components/KeepReading.js';
import { ArticleRenderer } from '../components/ArticleRenderer.js';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<
    Array<{ id: string; title: string; slug: string; readingTime: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    api.posts
      .getBySlug(slug)
      .then((res) => {
        setPost(res.post);
        // Fetch related posts
        api.posts
          .list()
          .then((listRes) => {
            const others = listRes.posts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                readingTime: p.readingTime,
              }));
            setRelatedPosts(others);
          })
          .catch(() => {});
      })
      .catch((err) => setError(err.message || 'Story not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F3] flex items-center justify-center">
        <p className="font-editorial text-2xl text-[#211E1A]">Loading essay...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#211E1A] mb-4">
          Story not found
        </h1>
        <p className="text-sm text-[#716D65] mb-6">
          The essay you are looking for may have been moved or unpublished.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium"
        >
          Return to all stories
        </Link>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'September 2, 2026';

  const categoryName = post.category?.name || 'Design';

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      {/* Editorial Reading Container: 680–760px */}
      <div className="max-w-[720px] mx-auto px-6 sm:px-8 pt-10 sm:pt-16">
        {/* At top: ← All stories */}
        <div className="mb-10 sm:mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#716D65] hover:text-[#211E1A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All stories</span>
          </Link>
        </div>

        {/* Story Metadata & Taxonomy Hierarchy */}
        <div className="flex flex-wrap items-center gap-y-1 text-[12px] uppercase tracking-[0.18em] text-[#716D65] mb-4">
          <span className="font-medium text-[#211E1A]">{categoryName}</span>
          {post.subcategories && post.subcategories.length > 0 && (
            <>
              <span className="mx-2 text-[#DDD9D0]">·</span>
              <span className="text-[#8B5E34]">
                {post.subcategories.map((s) => s.name).join(' · ')}
              </span>
            </>
          )}
          <span className="mx-2 text-[#DDD9D0]">·</span>
          <span>{formattedDate}</span>
          <span className="mx-2 text-[#DDD9D0]">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        {/* Story Title: font-weight 400 unbolded */}
        <h1 className="font-editorial text-[36px] sm:text-[48px] lg:text-[56px] text-[#211E1A] font-normal leading-[1.08] tracking-tight">
          {post.title}
        </h1>

        {/* Story Excerpt / Subtitle */}
        {post.excerpt && (
          <p className="text-[#716D65] text-lg sm:text-xl lg:text-[22px] leading-relaxed mt-5 sm:mt-6 font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Byline + Save Action */}
        <div className="mt-8 pt-5 border-t border-b border-[#DDD9D0] pb-5 flex items-center justify-between">
          <div className="text-sm sm:text-base text-[#716D65]">
            By <span className="text-[#211E1A] font-normal">{post.author?.name || 'Editorial Staff'}</span>
          </div>
          <SaveButton postId={post.id} initialIsSaved={post.isSaved} size="sm" />
        </div>

        {/* Hero Image */}
        {post.coverImage && (
          <div className="my-10 sm:my-12 overflow-hidden rounded-[3px] border border-[#DDD9D0]/80">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto aspect-3/2 sm:aspect-16/10 object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="prose-editorial text-[#2E2A25] pb-12 sm:pb-16 border-b border-[#DDD9D0]">
          <ArticleRenderer content={post.content} />
        </article>

        {/* Granular Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 pb-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A867E] mb-3">
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t, idx) => {
                const tagName = typeof t === 'string' ? t : (t as any).tag?.name || (t as any).name;
                if (!tagName) return null;
                return (
                  <span
                    key={`${tagName}-${idx}`}
                    className="px-3 py-1 bg-[#F3F1EB] border border-[#DDD9D0] text-xs text-[#211E1A] rounded-full hover:border-[#8A867E] transition-colors"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Author Card */}
        <div className="mt-10 sm:mt-12">
          <AuthorCard
            name={post.author?.name || 'The Margin Staff'}
            role="Contributing writer"
            bio={post.author?.bio || 'Observing software craft, interface tranquility, and distributed systems.'}
            avatarUrl={post.author?.avatarUrl}
          />
        </div>

        {/* Keep Reading List */}
        <KeepReading stories={relatedPosts} />
      </div>
    </div>
  );
}
