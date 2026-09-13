import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import type { TopicItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export function RecommendedTopics() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    let isMounted = true;
    api.topics
      .recommended()
      .then((res) => {
        if (isMounted) {
          setTopics(res.topics || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load recommended topics:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFollow = async (topic: TopicItem) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const wasFollowing = Boolean(topic.isFollowing);
    // Optimistic UI update
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id ? { ...t, isFollowing: !wasFollowing } : t
      )
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
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, isFollowing: wasFollowing } : t
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <section aria-label="Recommended topics" className="pt-1">
        <h3 className="text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#716D65] font-medium mb-3">
          Recommended Topics
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-[#EFECE6]/60 rounded animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  // 5-7 topics
  const displayTopics = topics.slice(0, 6);

  return (
    <section aria-label="Recommended topics" className="pt-1">
      <h3 className="text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#716D65] font-medium mb-3">
        Recommended Topics
      </h3>

      <div className="space-y-2">
        {displayTopics.map((topic) => {
          const isBusy = togglingId === topic.id;
          const following = Boolean(topic.isFollowing);

          return (
            <div
              key={topic.id}
              className="flex items-center justify-between gap-2.5 group py-0.5"
            >
              <Link
                to={`/topics/${topic.slug}`}
                className="text-[13.5px] sm:text-[14px] text-[#211E1A] hover:text-[#716D65] transition-colors font-normal leading-snug flex-1 truncate"
              >
                {topic.name}
              </Link>

              <button
                type="button"
                onClick={() => handleToggleFollow(topic)}
                disabled={isBusy}
                aria-label={following ? `Unfollow ${topic.name}` : `Follow ${topic.name}`}
                title={following ? 'Following' : 'Follow topic'}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  following
                    ? 'border-stone-800 bg-[#211E1A] text-[#F8F7F3]'
                    : 'border-[#DDD9D0] text-[#716D65] hover:border-[#211E1A] hover:text-[#211E1A] bg-transparent'
                }`}
              >
                {isBusy ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : following ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#DDD9D0]/60">
        <Link
          to="/topics"
          className="inline-flex items-center gap-1 text-xs text-[#716D65] hover:text-[#211E1A] hover:underline underline-offset-4 tracking-wide transition-colors font-medium"
        >
          <span>See more topics →</span>
        </Link>
      </div>
    </section>
  );
}

export default RecommendedTopics;
