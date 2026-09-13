import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import type { Post, FeedResponse } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import { RecommendedTopics } from '../components/RecommendedTopics.js';
import { useAuth } from '../context/AuthContext.js';

export function HomePage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'for-you' | 'explore'>('for-you');
  const [loading, setLoading] = useState(false);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (!user) {
      setFeed(null);
      return;
    }

    setLoading(true);
    api.stories
      .getFeed()
      .then((res) => setFeed(res))
      .catch(() =>
        setFeed({
          stories: [],
          moreToExplore: [],
          personalized: false,
          userInterests: [],
        })
      )
      .finally(() => setLoading(false));
  }, [user]);

  // 1. UNLOGGED / VISITOR VIEW: Show landing hero
  if (!user) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-[#F8F7F3] flex items-center">
        <section className="w-full py-12 lg:py-0">
          <div className="max-w-[1240px] w-full mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Typography & Start reading CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="font-editorial text-6xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[106px] text-[#211E1A] font-normal tracking-[-0.03em] leading-[0.95]">
                Human<br />stories &amp; ideas
              </h1>
              <p className="text-[#211E1A] text-xl sm:text-2xl font-normal leading-snug mt-7 sm:mt-9 mb-8 sm:mb-11 max-w-md">
                A place to read, write, and deepen your understanding
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="bg-[#211E1A] text-[#F8F7F3] rounded-full px-9 sm:px-11 py-3.5 sm:py-4 text-base sm:text-lg font-medium hover:bg-[#3D3833] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs inline-block"
                >
                  Start reading
                </button>
              </div>
            </div>

            {/* Right Column: Custom Editorial Art for The Margin */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px] lg:max-w-[500px]">
                <img
                  src="/the-margin-hero.jpg"
                  alt="The Margin — Journal of reading, craft, and ideas"
                  className="w-full h-auto object-contain mix-blend-multiply select-none"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 2. AUTHENTICATED VIEW: Personalized feed with subcategory recommendations
  const matchedStories = feed?.stories || [];
  const moreToExplore = feed?.moreToExplore || [];
  const allStories: Post[] = [...matchedStories, ...moreToExplore].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );

  const interestList = feed?.userInterests || [];

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3]">
      <section className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14 pb-28 sm:pb-36">
        {/* Editorial Header */}
        <div className="mb-8">
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#211E1A] font-normal tracking-tight">
            Stories for you
          </h1>
          <p className="text-sm sm:text-base text-[#716D65] mt-2 max-w-2xl font-normal">
            {feed?.personalized && interestList.length > 0 ? (
              <span>
                Personalized reading based on your interests in{' '}
                <span className="text-[#211E1A] font-medium">
                  {interestList.slice(0, 3).join(', ')}
                  {interestList.length > 3 ? ` and ${interestList.length - 3} more` : ''}
                </span>
                .
              </span>
            ) : (
              <span>Slow reading for a fast internet. Curated perspectives on typography, design, and craft.</span>
            )}
          </p>
        </div>

        {/* Tab Navigation: For You vs. Explore All */}
        <div className="flex items-center justify-between border-b border-[#DDD9D0] mb-8">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setActiveTab('for-you')}
              className={`text-sm tracking-wide transition-colors pb-3 -mb-[1px] cursor-pointer ${
                activeTab === 'for-you'
                  ? 'border-b-2 border-[#211E1A] text-[#211E1A] font-medium'
                  : 'text-[#716D65] hover:text-[#211E1A]'
              }`}
            >
              For You
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`text-sm tracking-wide transition-colors pb-3 -mb-[1px] cursor-pointer ${
                activeTab === 'explore'
                  ? 'border-b-2 border-[#211E1A] text-[#211E1A] font-medium'
                  : 'text-[#716D65] hover:text-[#211E1A]'
              }`}
            >
              Explore All
            </button>
          </div>

          <Link
            to="/profile"
            className="text-xs text-[#716D65] hover:text-[#211E1A] transition-colors pb-3"
          >
            Manage interests →
          </Link>
        </div>

        {/* Main Content: Responsive 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Main Column: Stories Listing */}
          <div className="lg:col-span-8 min-w-0">
            {loading ? (
              <div className="py-24 text-center text-[#8A867E]">
                <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                  Opening the journal...
                </p>
              </div>
            ) : activeTab === 'for-you' ? (
              <div>
                {matchedStories.length > 0 ? (
                  <div className="divide-y divide-[#DDD9D0]">
                    {matchedStories.map((post) => (
                      <StoryCard key={post.id} story={post} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border-b border-[#DDD9D0] text-center sm:text-left">
                    <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                      No direct matches for your followed interests yet
                    </p>
                    <p className="text-sm text-[#716D65] max-w-lg">
                      Explore fresh essays below or update your reading subcategories in your{' '}
                      <Link to="/profile" className="text-[#211E1A] underline underline-offset-4">
                        profile settings
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {/* Graceful Fallback: More To Explore */}
                {moreToExplore.length > 0 && (
                  <div className="mt-14 pt-10 border-t border-[#DDD9D0]">
                    <div className="mb-6">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#716D65] block mb-1">
                        Extended Library
                      </span>
                      <h2 className="font-editorial text-3xl text-[#211E1A] font-normal tracking-tight">
                        More to explore
                      </h2>
                      <p className="text-sm text-[#716D65] mt-1">
                        Notable stories across the publication outside your primary interests.
                      </p>
                    </div>

                    <div className="divide-y divide-[#DDD9D0]">
                      {moreToExplore.map((post) => (
                        <StoryCard key={post.id} story={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Explore All Tab */
              <div>
                {allStories.length === 0 ? (
                  <div className="py-24 text-center text-[#8A867E]">
                    <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                      No essays found
                    </p>
                    <p className="text-sm text-[#716D65]">
                      Check back soon for new essays.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#DDD9D0]">
                    {allStories.map((post) => (
                      <StoryCard key={post.id} story={post} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Rail: Discovery & Recommended Topics */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 pt-2 lg:border-l lg:border-[#DDD9D0]/60 lg:pl-8">
              <RecommendedTopics />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
