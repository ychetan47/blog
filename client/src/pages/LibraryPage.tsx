import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import type { Post } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import { useAuth } from '../context/AuthContext.js';
import { Bookmark } from 'lucide-react';

export function LibraryPage() {
  const [savedStories, setSavedStories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.library
      .getSaved()
      .then((res) => setSavedStories(res.savedStories))
      .catch(() => setSavedStories([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center px-6 text-center">
        <Bookmark className="w-10 h-10 text-[#8A867E] mb-4 stroke-1" />
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#211E1A] mb-3">
          Your Reading Library
        </h1>
        <p className="text-sm text-[#716D65] max-w-sm mb-6">
          Sign in to save stories and access your personal reading collection anytime.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors"
        >
          Sign in to view library
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-12 sm:pt-20">
        <div className="border-b border-[#DDD9D0] pb-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#716D65] mb-2">
            Personal Collection
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#211E1A] font-normal tracking-tight">
            Saved Stories
          </h1>
          <p className="text-[#716D65] text-base mt-2 font-normal">
            Essays you have marked for quiet, undisturbed reading.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#8A867E]">
            <p className="font-editorial text-2xl text-[#211E1A]">
              Loading your saved essays...
            </p>
          </div>
        ) : savedStories.length === 0 ? (
          <div className="py-20 text-center">
            <Bookmark className="w-8 h-8 text-[#8A867E] mx-auto mb-3 stroke-1" />
            <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
              Your library is empty
            </p>
            <p className="text-sm text-[#716D65] max-w-sm mx-auto mb-6">
              When you encounter essays worth returning to, click the bookmark icon to save them here.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Explore stories
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#DDD9D0]">
            {savedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
