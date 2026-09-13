import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import type { Post } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';

export function PickOfTheWeekPage() {
  const [stories, setStories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.posts
      .pickOfTheWeek()
      .then((res) => {
        if (isMounted) setStories(res.stories || []);
      })
      .catch((err) => {
        console.error('Failed to load pick of the week stories:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[#716D65] hover:text-[#211E1A] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Stories for you</span>
          </Link>
        </div>

        {/* Masthead Header */}
        <header className="pb-10 border-b border-[#DDD9D0]">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#716D65] font-medium block mb-2">
            Editorial Selection
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#211E1A] font-normal tracking-tight">
            Pick of the Week
          </h1>
          <p className="text-base sm:text-lg text-[#716D65] mt-3 font-normal max-w-2xl leading-relaxed">
            Curated essays, technical deep-dives, and distinguished ideas handpicked by The Margin editorial desk.
          </p>
        </header>

        {/* Stories Listing */}
        <main className="mt-4">
          {loading ? (
            <div className="py-24 text-center text-[#8A867E]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#716D65]" />
              <p className="font-editorial text-2xl text-[#211E1A] font-normal">
                Opening the weekly curation...
              </p>
            </div>
          ) : stories.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <p className="font-editorial text-2xl text-[#211E1A] mb-3">No stories selected this week</p>
              <p className="text-sm text-[#716D65] mb-6">Check back soon for freshly curated editorial picks.</p>
              <Link
                to="/"
                className="inline-flex items-center px-5 py-2.5 bg-[#211E1A] text-[#F8F7F3] rounded-full text-xs uppercase tracking-[0.16em] font-medium hover:bg-stone-800 transition-colors"
              >
                Back to stories
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#DDD9D0]">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PickOfTheWeekPage;
