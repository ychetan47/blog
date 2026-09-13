import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api, type OnboardingCategory } from '../services/api.js';
import type { Post, RepostItem } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import {
  LogOut,
  Plus,
  X,
  Check,
  Sparkles,
  Loader2,
  Repeat2,
  BookOpen,
  Mail,
  Shield,
  Calendar,
} from 'lucide-react';

type ProfileTab = 'home' | 'repost' | 'about';

export function ProfilePage() {
  const { user, logout, updateInterests } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>('home');

  // Tab 1 (Home): User's authored stories
  const [myStories, setMyStories] = useState<Post[]>([]);
  const [loadingMyStories, setLoadingMyStories] = useState(false);

  // Tab 2 (Repost): User's reposted stories
  const [reposts, setReposts] = useState<RepostItem[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(false);

  // Tab 3 (About): Reading interests & onboarding categories
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number>(0);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Load initial categories
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

  // Fetch authored stories for "Home"
  useEffect(() => {
    if (!user) return;
    setLoadingMyStories(true);
    api.posts
      .myStories()
      .then((res) => {
        setMyStories(res.posts || []);
      })
      .catch((err) => {
        console.error('Failed to load my stories:', err);
        setMyStories([]);
      })
      .finally(() => setLoadingMyStories(false));
  }, [user]);

  // Fetch reposts for "Repost"
  useEffect(() => {
    if (!user) return;
    setLoadingReposts(true);
    api.users
      .getReposts()
      .then((res) => {
        setReposts(res.reposts || []);
      })
      .catch((err) => {
        console.error('Failed to load reposts:', err);
        setReposts([]);
      })
      .finally(() => setLoadingReposts(false));
  }, [user]);

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
      <div className="max-w-[780px] mx-auto px-6 sm:px-8 pt-12 sm:pt-20">
        {/* User Identity Header */}
        <div className="border-b border-[#DDD9D0] pb-8 mb-8">
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
                <p className="text-xs sm:text-sm text-[#716D65] mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3F1EB] border border-[#DDD9D0] text-[11px] uppercase tracking-wider text-[#716D65]">
                    {user.role}
                  </span>
                  <span className="text-xs text-[#8A867E]">
                    · {myStories.length} {myStories.length === 1 ? 'story' : 'stories'}
                  </span>
                  <span className="text-xs text-[#8A867E]">
                    · {reposts.length} {reposts.length === 1 ? 'repost' : 'reposts'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-xs text-[#716D65] hover:text-[#211E1A] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs: Strictly Home, Repost, About */}
        <nav className="flex items-center gap-8 border-b border-[#DDD9D0] mb-8" aria-label="Profile tabs">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`pb-3 text-sm tracking-wide transition-colors relative cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#211E1A] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#211E1A]'
                : 'text-[#716D65] hover:text-[#211E1A]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repost')}
            className={`pb-3 text-sm tracking-wide transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'repost'
                ? 'text-[#211E1A] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#211E1A]'
                : 'text-[#716D65] hover:text-[#211E1A]'
            }`}
          >
            <span>Repost</span>
            {reposts.length > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200/80 text-stone-700">
                {reposts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm tracking-wide transition-colors relative cursor-pointer ${
              activeTab === 'about'
                ? 'text-[#211E1A] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#211E1A]'
                : 'text-[#716D65] hover:text-[#211E1A]'
            }`}
          >
            About
          </button>
        </nav>

        {/* Tab 1: Home (Authored stories) */}
        {activeTab === 'home' && (
          <div>
            {loadingMyStories ? (
              <div className="py-16 text-center text-[#716D65] text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading your stories...</span>
              </div>
            ) : myStories.length > 0 ? (
              <div className="space-y-0">
                {myStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 border border-dashed border-[#DDD9D0] rounded-xl">
                <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                <p className="font-editorial text-xl text-[#211E1A] mb-2">
                  No stories published yet
                </p>
                <p className="text-xs text-[#716D65] mb-5 max-w-sm mx-auto">
                  Share your ideas, research, or essays with readers on The Margin.
                </p>
                <Link
                  to="/write"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  Write a story
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Repost (Reposted stories) */}
        {activeTab === 'repost' && (
          <div>
            {loadingReposts ? (
              <div className="py-16 text-center text-[#716D65] text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading your reposts...</span>
              </div>
            ) : reposts.length > 0 ? (
              <div className="space-y-0">
                {reposts.map((item) => (
                  <StoryCard
                    key={item.repostId}
                    story={item.post}
                    repostBadge={{
                      repostedBy: item.repostedBy || 'You',
                      repostedAt: item.repostedAt,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 border border-dashed border-[#DDD9D0] rounded-xl">
                <Repeat2 className="w-8 h-8 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                <p className="font-editorial text-xl text-[#211E1A] mb-2">
                  No reposts yet
                </p>
                <p className="text-xs text-[#716D65] mb-5 max-w-sm mx-auto">
                  Click the Repost button on any story to share it with your readers. Reposted stories will appear here.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  Explore stories
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: About (Bio + Reading Interests Manager) */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* User Bio & Meta Details Card */}
            <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-xs uppercase tracking-[0.16em] text-[#716D65] font-semibold mb-4">
                User Details
              </h2>
              <div className="space-y-3.5 text-sm text-[#211E1A]">
                {user.bio ? (
                  <p className="text-stone-700 leading-relaxed italic">{user.bio}</p>
                ) : (
                  <p className="text-xs text-stone-500 italic">No bio added yet.</p>
                )}

                <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-stone-400" />
                    <span className="capitalize">{user.role} member</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        Member since{' '}
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Manageable Reading Interests Section */}
            <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-2xl p-6 sm:p-8 shadow-xs">
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
                  Your personalized feed on the homepage highlights essays matching these topics.
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
                    className="flex-1 px-4 py-2 bg-[#F8F7F3] border border-[#DDD9D0] rounded-xl text-xs sm:text-sm text-[#211E1A] placeholder-[#716D65]/50 outline-none focus:border-[#211E1A] transition-colors"
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
                                : 'bg-[#F8F7F3] border border-[#DDD9D0] text-[#716D65] hover:text-[#211E1A] hover:border-[#211E1A]/40'
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
          </div>
        )}
      </div>
    </div>
  );
}
