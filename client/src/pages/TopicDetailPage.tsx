import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import type { TopicItem, Post } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import { useAuth } from '../context/AuthContext.js';

export function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, openAuthModal } = useAuth();

  const [topic, setTopic] = useState<TopicItem | null>(null);
  const [stories, setStories] = useState<Post[]>([]);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setLoading(true);

    api.topics
      .getStories(slug, sort)
      .then((res) => {
        if (!isMounted) return;
        setTopic(res.topic);
        setStories(res.stories || []);
        setIsFollowing(Boolean(res.topic.isFollowing));
        setFollowerCount(res.topic.followerCount || 0);
      })
      .catch((err) => {
        console.error('Failed to load topic stories:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, sort, user]);

  const handleToggleFollow = async () => {
    if (!topic) return;

    if (!user) {
      openAuthModal('signin');
      return;
    }

    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));
    setIsTogglingFollow(true);

    try {
      if (wasFollowing) {
        await api.topics.unfollow(topic.id);
      } else {
        await api.topics.follow(topic.id);
      }
    } catch (err) {
      console.error('Failed to toggle follow topic:', err);
      // Revert optimistic update
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsTogglingFollow(false);
    }
  };

  if (loading && !topic) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F7F3]">
        <Loader2 className="w-6 h-6 animate-spin text-[#716D65] mb-3" />
        <p className="font-editorial text-xl text-[#211E1A]">Loading topic...</p>
      </div>
    );
  }

  if (!topic && !loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F7F3] px-6 text-center">
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#211E1A] mb-3">Topic not found</h1>
        <p className="text-[#716D65] text-base mb-6">The topic you are looking for may have been renamed or removed.</p>
        <Link
          to="/topics"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-[#211E1A] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore all topics</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/topics"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[#716D65] hover:text-[#211E1A] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>All topics</span>
          </Link>
        </div>

        {/* Editorial Topic Header */}
        <header className="pb-10 border-b border-[#DDD9D0]">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="max-w-2xl">
              {topic?.categoryName && (
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#716D65] font-medium block mb-2">
                  {topic.categoryName}
                </span>
              )}
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#211E1A] font-normal tracking-tight uppercase">
                {topic?.name}
              </h1>

              {topic?.description ? (
                <p className="text-base sm:text-lg text-[#716D65] mt-3 font-normal leading-relaxed">
                  {topic.description}
                </p>
              ) : (
                <p className="text-base sm:text-lg text-[#716D65] mt-3 font-normal">
                  Curated editorial stories exploring {topic?.name?.toLowerCase()}.
                </p>
              )}

              {/* Metadata counters */}
              <div className="flex items-center gap-4 mt-5 text-xs sm:text-sm text-[#8A867E]">
                <span>
                  <strong className="font-medium text-[#211E1A]">{stories.length}</strong>{' '}
                  {stories.length === 1 ? 'Story' : 'Stories'}
                </span>
                <span className="text-[#DDD9D0]">·</span>
                <span>
                  <strong className="font-medium text-[#211E1A]">{followerCount}</strong>{' '}
                  {followerCount === 1 ? 'Follower' : 'Followers'}
                </span>
              </div>
            </div>

            {/* Follow Action */}
            <div className="pt-2 md:pt-4 shrink-0">
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={isTogglingFollow}
                aria-label={isFollowing ? `Unfollow ${topic?.name}` : `Follow ${topic?.name}`}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 cursor-pointer ${
                  isFollowing
                    ? 'bg-transparent border border-[#211E1A] text-[#211E1A] hover:border-[#716D65] hover:text-[#716D65]'
                    : 'bg-[#211E1A] border border-[#211E1A] text-[#F8F7F3] hover:bg-[#3D3830]'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center gap-6 mt-10 -mb-[1px] pt-4 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={() => setSort('latest')}
              className={`pb-2 text-xs sm:text-sm uppercase tracking-[0.16em] transition-colors relative cursor-pointer ${
                sort === 'latest'
                  ? 'text-[#211E1A] font-medium'
                  : 'text-[#716D65] hover:text-[#211E1A] font-normal'
              }`}
            >
              Latest
              {sort === 'latest' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#211E1A]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setSort('popular')}
              className={`pb-2 text-xs sm:text-sm uppercase tracking-[0.16em] transition-colors relative cursor-pointer ${
                sort === 'popular'
                  ? 'text-[#211E1A] font-medium'
                  : 'text-[#716D65] hover:text-[#211E1A] font-normal'
              }`}
            >
              Popular
              {sort === 'popular' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#211E1A]" />
              )}
            </button>
          </div>
        </header>

        {/* Stories List */}
        <section className="mt-4">
          {loading ? (
            <div className="py-20 text-center text-[#716D65]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#716D65]" />
              <p className="text-xs uppercase tracking-[0.16em]">Loading stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="py-20 sm:py-28 text-center max-w-md mx-auto">
              <p className="font-editorial text-2xl sm:text-3xl text-[#211E1A] font-normal mb-3">
                No stories published in this topic yet.
              </p>
              <p className="text-[#716D65] text-sm leading-relaxed mb-6">
                Be the first to write about {topic?.name}, or explore other topics across The Margin.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/write"
                  className="inline-flex items-center px-5 py-2.5 bg-[#211E1A] text-[#F8F7F3] rounded-full text-xs uppercase tracking-[0.16em] hover:bg-[#3D3830] transition-colors"
                >
                  Write a story
                </Link>
                <Link
                  to="/topics"
                  className="inline-flex items-center px-5 py-2.5 border border-[#DDD9D0] text-[#211E1A] rounded-full text-xs uppercase tracking-[0.16em] hover:border-[#211E1A] transition-colors"
                >
                  Explore topics
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TopicDetailPage;
