import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api, type OnboardingCategory } from '../services/api.js';
import type { RepostItem, ReadingList, ReadingListDetail } from '../types/index.js';
import { StoryCard } from '../components/StoryCard.js';
import { ReadingListCard } from '../components/ReadingListCard.js';
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
  ArrowLeft,
  Lock,
  Trash2,
} from 'lucide-react';

type ProfileTab = 'home' | 'repost' | 'about';

export function ProfilePage() {
  const { user, logout, updateInterests } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>('home');

  // Tab 1 (Home): Reading Lists (Saved Collections)
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListDetail, setSelectedListDetail] = useState<ReadingListDetail | null>(null);
  const [loadingListDetail, setLoadingListDetail] = useState(false);

  // Create List Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPrivate, setNewListPrivate] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Edit List Modal State
  const [editingList, setEditingList] = useState<ReadingList | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivate, setEditPrivate] = useState(true);
  const [isUpdatingList, setIsUpdatingList] = useState(false);

  // Tab 2 (Repost): User's reposted stories
  const [reposts, setReposts] = useState<RepostItem[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(false);

  // Tab 3 (About): Reading interests & onboarding categories
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number>(0);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Fetch Reading Lists
  const fetchLists = useCallback(() => {
    if (!user) return;
    setLoadingLists(true);
    api.lists
      .list()
      .then((res) => {
        setLists(res.lists || []);
      })
      .catch((err) => {
        console.error('Failed to load reading lists:', err);
      })
      .finally(() => setLoadingLists(false));
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Fetch specific list detail when selected
  useEffect(() => {
    if (!selectedListId) {
      setSelectedListDetail(null);
      return;
    }

    setLoadingListDetail(true);
    api.lists
      .get(selectedListId)
      .then((res) => {
        setSelectedListDetail(res.list);
      })
      .catch((err) => {
        console.error('Failed to load list details:', err);
        setSelectedListDetail(null);
      })
      .finally(() => setLoadingListDetail(false));
  }, [selectedListId]);

  // Load initial categories for About tab
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

  // Fetch reposts for "Repost" tab
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

  // Create List Handler
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;

    setIsCreatingList(true);
    try {
      const res = await api.lists.create({
        name: trimmed,
        description: newListDescription.trim() || undefined,
        isPrivate: newListPrivate,
      });

      setLists((prev) => [...prev, res.list]);
      setIsCreateModalOpen(false);
      setNewListName('');
      setNewListDescription('');
      setNewListPrivate(true);
    } catch (err) {
      console.error('Failed to create list:', err);
    } finally {
      setIsCreatingList(false);
    }
  };

  // Edit List Handler
  const handleStartEdit = (list: ReadingList) => {
    setEditingList(list);
    setEditName(list.name);
    setEditDescription(list.description || '');
    setEditPrivate(list.isPrivate);
  };

  const handleUpdateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList || !editName.trim()) return;

    setIsUpdatingList(true);
    try {
      const res = await api.lists.update(editingList.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isPrivate: editPrivate,
      });

      setLists((prev) =>
        prev.map((l) => (l.id === editingList.id ? { ...l, ...res.list } : l))
      );
      if (selectedListDetail && selectedListDetail.id === editingList.id) {
        setSelectedListDetail((prev) => (prev ? { ...prev, ...res.list } : null));
      }
      setEditingList(null);
    } catch (err) {
      console.error('Failed to update list:', err);
    } finally {
      setIsUpdatingList(false);
    }
  };

  // Delete List Handler
  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.lists.delete(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (selectedListId === listId) {
        setSelectedListId(null);
        setSelectedListDetail(null);
      }
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  // Remove Story from Current List
  const handleRemoveStoryFromList = async (postId: string) => {
    if (!selectedListId) return;
    try {
      await api.lists.removeStory(selectedListId, postId);
      setSelectedListDetail((prev) =>
        prev
          ? {
              ...prev,
              stories: prev.stories.filter((s) => s.id !== postId),
              storyCount: Math.max(0, prev.storyCount - 1),
            }
          : null
      );
      fetchLists();
    } catch (err) {
      console.error('Failed to remove story from list:', err);
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
                    · {lists.length} {lists.length === 1 ? 'list' : 'lists'}
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
            onClick={() => {
              setActiveTab('home');
              setSelectedListId(null);
            }}
            className={`pb-3 text-sm tracking-wide transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'text-[#211E1A] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#211E1A]'
                : 'text-[#716D65] hover:text-[#211E1A]'
            }`}
          >
            <span>Home</span>
            {lists.length > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200/80 text-stone-700">
                {lists.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('repost');
              setSelectedListId(null);
            }}
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
            onClick={() => {
              setActiveTab('about');
              setSelectedListId(null);
            }}
            className={`pb-3 text-sm tracking-wide transition-colors relative cursor-pointer ${
              activeTab === 'about'
                ? 'text-[#211E1A] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#211E1A]'
                : 'text-[#716D65] hover:text-[#211E1A]'
            }`}
          >
            About
          </button>
        </nav>

        {/* Tab 1: Home (Reading Lists / Saved Collections) */}
        {activeTab === 'home' && (
          <div>
            {!selectedListId ? (
              // Overview of all Reading Lists
              <div>
                {/* Lists Subheader with "+ New list" button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.16em] text-[#716D65] font-semibold">
                      Your Lists
                    </h2>
                    <p className="text-xs text-[#8A867E] mt-0.5">
                      Curate stories into dedicated collections like technical, spiritual, or data science.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New list</span>
                  </button>
                </div>

                {loadingLists ? (
                  <div className="py-16 text-center text-[#716D65] text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading your lists...</span>
                  </div>
                ) : lists.length > 0 ? (
                  <div className="space-y-4">
                    {lists.map((l) => (
                      <ReadingListCard
                        key={l.id}
                        list={l}
                        authorName={user.name}
                        authorAvatar={user.avatarUrl}
                        onClick={() => setSelectedListId(l.id)}
                        onEdit={(listToEdit) => handleStartEdit(listToEdit)}
                        onDelete={(idToDelete) => handleDeleteList(idToDelete)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 border border-dashed border-[#DDD9D0] rounded-xl">
                    <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                    <p className="font-editorial text-xl text-[#211E1A] mb-2">
                      No reading lists yet
                    </p>
                    <p className="text-xs text-[#716D65] mb-5 max-w-sm mx-auto">
                      Create collections to organize essays you want to read, reference, or revisit later.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create your first list</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Selected List Detail View
              <div>
                {/* Back to lists button */}
                <button
                  type="button"
                  onClick={() => setSelectedListId(null)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#716D65] hover:text-[#211E1A] transition-colors mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All lists</span>
                </button>

                {loadingListDetail ? (
                  <div className="py-16 text-center text-[#716D65] text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading collection...</span>
                  </div>
                ) : selectedListDetail ? (
                  <div>
                    {/* List Header */}
                    <div className="border-b border-[#DDD9D0] pb-6 mb-8">
                      <div className="flex items-center gap-2 text-xs text-[#716D65] mb-2">
                        <span>Curated by</span>
                        <span className="font-medium text-[#211E1A]">{user.name}</span>
                        {selectedListDetail.isPrivate && (
                          <>
                            <span className="text-[#DDD9D0]">·</span>
                            <span className="inline-flex items-center gap-1 text-[#8A867E]">
                              <Lock className="w-3 h-3" /> Private list
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#211E1A]">
                        {selectedListDetail.name}
                      </h2>

                      {selectedListDetail.description && (
                        <p className="text-sm text-[#716D65] mt-2 font-normal">
                          {selectedListDetail.description}
                        </p>
                      )}

                      <div className="mt-3 text-xs text-[#8A867E]">
                        {selectedListDetail.storyCount}{' '}
                        {selectedListDetail.storyCount === 1 ? 'story' : 'stories'} saved
                      </div>
                    </div>

                    {/* Stories in this List */}
                    {selectedListDetail.stories && selectedListDetail.stories.length > 0 ? (
                      <div className="space-y-6">
                        {selectedListDetail.stories.map((story) => (
                          <div key={story.id} className="relative group/item">
                            <StoryCard story={story} />
                            <button
                              type="button"
                              onClick={() => handleRemoveStoryFromList(story.id)}
                              className="absolute top-2 right-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-stone-400 hover:text-rose-600 rounded-full hover:bg-stone-100 cursor-pointer"
                              title="Remove from this list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-4 border border-dashed border-[#DDD9D0] rounded-xl">
                        <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                        <p className="font-editorial text-xl text-[#211E1A] mb-2">
                          No stories in this list yet
                        </p>
                        <p className="text-xs text-[#716D65] mb-5 max-w-sm mx-auto">
                          Click the Save icon on any story to add it directly to this collection.
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
                ) : (
                  <div className="text-center py-12 text-[#716D65] text-sm">
                    List not found or removed.
                  </div>
                )}
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

      {/* Create List Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Create new list
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Give it a name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. technical, spiritual, data science"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-stone-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Description <span className="font-normal text-stone-400 lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="A short note about what this collection is for..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-stone-800 transition-colors resize-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newListPrivate}
                    onChange={(e) => setNewListPrivate(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-0"
                  />
                  <span>Make it private (only you can see this list)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim() || isCreatingList}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingList && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create list</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {editingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Edit list
              </h2>
              <button
                type="button"
                onClick={() => setEditingList(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateList} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  List name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-stone-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-stone-800 transition-colors resize-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editPrivate}
                    onChange={(e) => setEditPrivate(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-0"
                  />
                  <span>Make it private</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingList(null)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim() || isUpdatingList}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdatingList && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
