import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api, type OnboardingCategory } from '../services/api.js';
import { LogOut, Bookmark, BookOpen, Plus, X, Check, Sparkles, Loader2 } from 'lucide-react';

export function ProfilePage() {
  const { user, logout, updateInterests } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number>(0);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    api.onboarding
      .getCategories()
      .then((res) => {
        setCategories(res.categories || []);
      })
      .catch((err) => {
        console.error('Failed to load topic categories:', err);
      });
  }, []);

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-editorial text-3xl text-[#211E1A] mb-3">Sign in to view your profile</h1>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const showSaveNotice = (msg = 'Saved') => {
    setSaveNotice(msg);
    setTimeout(() => {
      setSaveNotice(null);
    }, 2000);
  };

  const currentTopics = user.topics || [];

  const handleAddTopic = async (topicToAdd: string) => {
    const trimmed = topicToAdd.trim();
    if (!trimmed) return;

    // Case-insensitive duplicate check
    const exists = currentTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setNewTopicInput('');
      return;
    }

    const updated = [...currentTopics, trimmed];
    setIsUpdating(true);
    try {
      await updateInterests(updated);
      showSaveNotice('Interest added');
      setNewTopicInput('');
    } catch (err) {
      console.error('Failed to add interest:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTopic = async (topicToRemove: string) => {
    const updated = currentTopics.filter(
      (t) => t.toLowerCase() !== topicToRemove.toLowerCase()
    );
    setIsUpdating(true);
    try {
      await updateInterests(updated);
      showSaveNotice('Interest removed');
    } catch (err) {
      console.error('Failed to remove interest:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleTopic = (topicName: string) => {
    const isSelected = currentTopics.some(
      (t) => t.toLowerCase() === topicName.toLowerCase()
    );
    if (isSelected) {
      handleRemoveTopic(topicName);
    } else {
      handleAddTopic(topicName);
    }
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicInput.trim()) {
      handleAddTopic(newTopicInput);
    }
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const currentCategory = categories[selectedCategoryTab];

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[760px] mx-auto px-6 sm:px-8 pt-12 sm:pt-20">
        {/* User Identity Header */}
        <div className="border-b border-[#DDD9D0] pb-10 mb-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-[#DDD9D0]"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E5E1D8] border border-[#DDD9D0] flex items-center justify-center font-editorial text-2xl sm:text-3xl text-[#211E1A]">
                  {initials}
                </div>
              )}

              <div>
                <h1 className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#716D65] mt-1">{user.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#F3F1EB] border border-[#DDD9D0] text-[11px] uppercase tracking-wider text-[#716D65]">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-xs text-[#716D65] hover:text-[#211E1A] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Manageable Reading Interests Section */}
        <div className="bg-[#F8F7F3] border border-[#DDD9D0] rounded-2xl p-6 sm:p-8 mb-10 shadow-xs">
          {/* Section Header with Live Save Notice */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DDD9D0]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#716D65]" />
              <h2 className="text-xs uppercase tracking-[0.16em] text-[#716D65] font-semibold">
                Reading Interests
              </h2>
              <span className="text-xs text-[#8A867E]">
                ({currentTopics.length} selected)
              </span>
            </div>

            <div className="flex items-center gap-2 min-h-[20px]">
              {isUpdating && (
                <div className="flex items-center gap-1.5 text-xs text-[#716D65]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {saveNotice && !isUpdating && (
                <div className="flex items-center gap-1 text-xs text-emerald-700 animate-in fade-in duration-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Interests List */}
          <div className="pt-5 pb-6">
            <p className="text-xs text-[#716D65] mb-3">
              Your personalized feed highlights essays matching these topics.
            </p>

            {currentTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium group transition-all"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      title={`Remove ${topic}`}
                      className="p-0.5 rounded-full hover:bg-white/20 text-[#DDD9D0] hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#716D65]/80 italic py-1">
                No topics selected yet. Add custom topics or choose from the suggestions below to tailor your feed.
              </p>
            )}
          </div>

          {/* Add Custom Topic Input */}
          <form onSubmit={handleCustomTopicSubmit} className="pt-4 border-t border-[#DDD9D0]/60 pb-6">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#716D65] mb-2">
              Add Custom Topic
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                placeholder="e.g. Minimalist Design, Distributed Systems, Typography..."
                className="flex-1 px-4 py-2 bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl text-xs sm:text-sm text-[#211E1A] placeholder-[#716D65]/50 outline-none focus:border-[#211E1A] transition-colors"
              />
              <button
                type="submit"
                disabled={!newTopicInput.trim() || isUpdating}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#211E1A] text-[#F8F7F3] rounded-xl text-xs font-medium hover:bg-[#38332E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Explore & Add Curated Topics */}
          {categories.length > 0 && (
            <div className="pt-4 border-t border-[#DDD9D0]/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#716D65]">
                  Suggested Topics
                </span>
                <span className="text-[11px] text-[#8A867E]">
                  Click to add or remove
                </span>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
                {categories.map((cat, idx) => {
                  const isActive = selectedCategoryTab === idx;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategoryTab(idx)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#211E1A] text-[#F8F7F3]'
                          : 'bg-[#F3F1EB] text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] border border-[#DDD9D0]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Topic chips for the selected category */}
              {currentCategory && (
                <div className="flex flex-wrap gap-2">
                  {currentCategory.topics.map((t) => {
                    const isSelected = currentTopics.some(
                      (item) => item.toLowerCase() === t.name.toLowerCase()
                    );
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => handleToggleTopic(t.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#211E1A] text-[#F8F7F3] border border-[#211E1A]'
                            : 'bg-[#FFFFFF] border border-[#DDD9D0] text-[#716D65] hover:text-[#211E1A] hover:border-[#211E1A]/40'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <Plus className="w-3 h-3 text-[#716D65]" />
                        )}
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links / Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/library"
            className="p-6 bg-[#F8F7F3] border border-[#DDD9D0] hover:border-[#8A867E] rounded-xl flex items-center gap-4 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F3F1EB] border border-[#DDD9D0] flex items-center justify-center text-[#211E1A]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg text-[#211E1A] group-hover:text-[#716D65] transition-colors">
                Saved Stories
              </h3>
              <p className="text-xs text-[#8A867E]">
                {user.savedCount || 0} stories saved
              </p>
            </div>
          </Link>

          <Link
            to="/stories"
            className="p-6 bg-[#F8F7F3] border border-[#DDD9D0] hover:border-[#8A867E] rounded-xl flex items-center gap-4 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F3F1EB] border border-[#DDD9D0] flex items-center justify-center text-[#211E1A]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg text-[#211E1A] group-hover:text-[#716D65] transition-colors">
                Your Stories
              </h3>
              <p className="text-xs text-[#8A867E]">
                {user.storiesCount || 0} essays published
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
