import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import type { TopicItem, TopicCategoryGroup } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export function TopicDiscoveryPage() {
  const [categories, setCategories] = useState<TopicCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    let isMounted = true;
    api.topics
      .list()
      .then((res) => {
        if (isMounted) {
          setCategories(res.categories || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load topics:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFollow = async (e: React.MouseEvent, topic: TopicItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal('signin');
      return;
    }

    const wasFollowing = Boolean(topic.isFollowing);

    // Optimistic UI updates
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        topics: cat.topics.map((t) =>
          t.id === topic.id ? { ...t, isFollowing: !wasFollowing } : t
        ),
      }))
    );

    setTogglingId(topic.id);

    try {
      if (wasFollowing) {
        await api.topics.unfollow(topic.id);
      } else {
        await api.topics.follow(topic.id);
      }
    } catch (err) {
      console.error('Failed to toggle follow topic:', err);
      // Revert optimistic update
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          topics: cat.topics.map((t) =>
            t.id === topic.id ? { ...t, isFollowing: wasFollowing } : t
          ),
        }))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered topics if user is searching
  const query = searchQuery.trim().toLowerCase();
  const isFiltering = query.length > 0;

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      topics: cat.topics.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          cat.name.toLowerCase().includes(query)
      ),
    }))
    .filter((cat) => cat.topics.length > 0);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14">
        {/* Top Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[#716D65] hover:text-[#211E1A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All stories</span>
          </Link>
        </div>

        {/* Masthead Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#DDD9D0]">
          <div>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#211E1A] font-normal tracking-tight">
              Explore topics
            </h1>
            <p className="text-base sm:text-lg text-[#716D65] mt-2 font-normal">
              Find something new to read.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8A867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#DDD9D0] rounded-full text-xs sm:text-sm text-[#211E1A] placeholder-[#8A867E]/70 outline-none focus:border-[#211E1A] transition-colors"
            />
          </div>
        </div>

        {/* Topics Listing */}
        {loading ? (
          <div className="py-24 text-center text-[#8A867E]">
            <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
              Loading topics catalogue...
            </p>
          </div>
        ) : isFiltering && filteredCategories.length === 0 ? (
          <div className="py-20 text-center text-[#8A867E]">
            <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
              No matching topics found
            </p>
            <p className="text-sm text-[#716D65]">
              Try searching with another keyword, or clear the search.
            </p>
          </div>
        ) : (
          <div className="space-y-14 pt-10">
            {filteredCategories.map((cat) => (
              <section key={cat.id || cat.slug} aria-labelledby={`cat-${cat.slug}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2
                    id={`cat-${cat.slug}`}
                    className="text-xs uppercase tracking-[0.2em] text-[#716D65] font-semibold"
                  >
                    {cat.name}
                  </h2>
                  <span className="text-xs text-[#8A867E]">
                    {cat.topics.length} topics
                  </span>
                </div>

                {/* Topic Pills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.topics.map((topic) => {
                    const following = Boolean(topic.isFollowing);
                    const isBusy = togglingId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className="group relative flex items-center justify-between px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#DDD9D0] hover:border-[#211E1A] hover:shadow-xs transition-all"
                      >
                        <Link
                          to={`/topics/${topic.slug}`}
                          className="flex-1 min-w-0 pr-2"
                        >
                          <span className="block text-[14px] sm:text-[15px] font-normal text-[#211E1A] group-hover:text-[#716D65] transition-colors truncate">
                            {topic.name}
                          </span>
                          <span className="block text-[11px] text-[#8A867E] mt-0.5">
                            {topic.storyCount || 0} {topic.storyCount === 1 ? 'story' : 'stories'}
                          </span>
                        </Link>

                        {/* Follow / Unfollow Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(e, topic)}
                          disabled={isBusy}
                          aria-label={following ? `Unfollow ${topic.name}` : `Follow ${topic.name}`}
                          title={following ? 'Following' : 'Follow topic'}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                            following
                              ? 'border-stone-800 bg-[#211E1A] text-[#F8F7F3]'
                              : 'border-[#DDD9D0] text-[#716D65] hover:border-[#211E1A] hover:text-[#211E1A] bg-[#F8F7F3]'
                          }`}
                        >
                          {isBusy ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : following ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
