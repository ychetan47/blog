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
      <div className="py-6">
        <h3 className="text-xs uppercase tracking-[0.18em] text-[#716D65] font-medium mb-4">
          Recommended Topics
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-[#EFECE6]/70 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <aside aria-label="Recommended topics" className="py-2">
      <h3 className="text-xs uppercase tracking-[0.18em] text-[#716D65] font-medium mb-4">
        Recommended Topics
      </h3>

      <div className="space-y-3.5">
        {topics.map((topic) => {
          const isBusy = togglingId === topic.id;
          const following = Boolean(topic.isFollowing);

          return (
            <div
              key={topic.id}
              className="flex items-center justify-between gap-3 group py-0.5"
            >
              <Link
                to={`/topics/${topic.slug}`}
                className="text-[14px] sm:text-[15px] text-[#211E1A] hover:text-[#716D65] transition-colors font-normal leading-snug flex-1 truncate"
              >
                {topic.name}
              </Link>

              <button
                type="button"
                onClick={() => handleToggleFollow(topic)}
                disabled={isBusy}
                aria-label={following ? `Unfollow ${topic.name}` : `Follow ${topic.name}`}
                title={following ? 'Following' : 'Follow topic'}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  following
                    ? 'border-stone-800 bg-[#211E1A] text-[#F8F7F3]'
                    : 'border-[#DDD9D0] text-[#716D65] hover:border-[#211E1A] hover:text-[#211E1A] bg-transparent'
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

      <div className="mt-5 pt-3 border-t border-[#DDD9D0]/60">
        <Link
          to="/topics"
          className="inline-flex items-center gap-1 text-xs text-[#716D65] hover:text-[#211E1A] hover:underline underline-offset-4 tracking-wide transition-colors"
        >
          See more topics →
        </Link>
      </div>
    </aside>
  );
}
