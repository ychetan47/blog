import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import type { FeedResponse } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import { PickedForYou } from '../components/PickedForYou.js';
import { useAuth } from '../context/AuthContext.js';

export function HomePage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
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
          pickedForYou: [],
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

  // 2. AUTHENTICATED VIEW: Strictly personalized feed + separate discovery sidebar
  const personalizedStories = feed?.stories || [];
  const interestList = feed?.userInterests || [];

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3]">
      <section className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14 pb-28 sm:pb-36">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-[#DDD9D0] pb-6 mb-8">
          <div>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#211E1A] font-normal tracking-tight">
              Stories for you
            </h1>
            <p className="text-sm sm:text-base text-[#716D65] mt-2 font-normal">
              {interestList.length > 0 ? (
                <span>
                  Personalized reading based on your interests in{' '}
                  <span className="text-[#211E1A] font-medium">
                    {interestList.slice(0, 3).join(', ')}
                    {interestList.length > 3 ? ` and ${interestList.length - 3} more` : ''}
                  </span>
                  .
                </span>
              ) : (
                <span>Personalized stories tailored to your reading preferences.</span>
              )}
            </p>
          </div>

          <Link
            to="/profile"
            className="text-xs text-[#716D65] hover:text-[#211E1A] transition-colors shrink-0 hover:underline underline-offset-4"
          >
            Manage interests →
          </Link>
        </div>

        {/* Main Content: Responsive 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Main Column: Personalized Stories ONLY */}
          <main className="lg:col-span-8 min-w-0" aria-label="Personalized story feed">
            {loading ? (
              <div className="py-24 text-center text-[#8A867E]">
                <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                  Opening the journal...
                </p>
              </div>
            ) : personalizedStories.length > 0 ? (
              <div>
                <div className="divide-y divide-[#DDD9D0]">
                  {personalizedStories.map((post) => (
                    <StoryCard key={post.id} story={post} />
                  ))}
                </div>

                {/* Natural End of Feed (Strictly NO unrelated stories appended) */}
                <div className="py-14 text-center">
                  <span className="inline-block w-8 h-[1px] bg-[#DDD9D0] mb-3" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8A867E]">
                    End of personalized stories
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center sm:text-left">
                <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                  No stories match your selected topics yet
                </p>
                <p className="text-sm text-[#716D65] max-w-lg mb-6">
                  Select topics in your profile to populate your reading feed with stories tailored to your interests, or browse the complete topic directory.
                </p>
                <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs uppercase tracking-[0.16em] font-medium hover:bg-stone-800 transition-colors"
                  >
                    Select interests
                  </Link>
                  <Link
                    to="/topics"
                    className="inline-flex items-center px-5 py-2.5 rounded-full border border-[#DDD9D0] text-[#211E1A] text-xs uppercase tracking-[0.16em] font-medium hover:border-[#211E1A] transition-colors"
                  >
                    Explore all topics
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* Right Rail: Picked for you Discovery Sidebar (Desktop sticky, Mobile below feed) */}
          <div className="lg:col-span-4 border-t border-[#DDD9D0] pt-10 lg:border-t-0 lg:pt-0">
            <div className="lg:sticky lg:top-24 pt-2 lg:border-l lg:border-[#DDD9D0]/60 lg:pl-8">
              <PickedForYou stories={feed?.pickedForYou || []} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
