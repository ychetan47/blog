import { useState, useEffect } from 'react';
import { X, Plus, Lock, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import type { StoryListStatus } from '../types/index.js';

interface SaveToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSaveStatusChange?: (isSaved: boolean) => void;
}

export function SaveToListModal({
  isOpen,
  onClose,
  postId,
  onSaveStatusChange,
}: SaveToListModalProps) {
  const [lists, setLists] = useState<StoryListStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListPrivate, setNewListPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId) return;
    setLoading(true);
    api.lists
      .getStoryLists(postId)
      .then((res) => {
        setLists(res.lists || []);
      })
      .catch((err) => {
        console.error('Failed to load story lists:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleToggleList = async (listId: string) => {
    const target = lists.find((l) => l.listId === listId);
    if (!target) return;

    const nextIsInList = !target.isInList;
    const updatedLists = lists.map((l) =>
      l.listId === listId ? { ...l, isInList: nextIsInList } : l
    );
    setLists(updatedLists);

    const activeListIds = updatedLists.filter((l) => l.isInList).map((l) => l.listId);
    setIsSyncing(true);

    try {
      const res = await api.lists.syncStoryLists(postId, activeListIds);
      onSaveStatusChange?.(res.saved);
    } catch (err) {
      console.error('Failed to sync story lists:', err);
      // Revert on error
      setLists(lists);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      const res = await api.lists.create({
        name: trimmed,
        isPrivate: newListPrivate,
      });

      const newListStatus: StoryListStatus = {
        listId: res.list.id,
        listName: res.list.name,
        isPrivate: res.list.isPrivate,
        isInList: true, // Automatically check this new list
      };

      const updated = [...lists, newListStatus];
      setLists(updated);
      setNewListName('');
      setShowCreateInput(false);

      // Sync active lists including this new one
      const activeListIds = updated.filter((l) => l.isInList).map((l) => l.listId);
      const syncRes = await api.lists.syncStoryLists(postId, activeListIds);
      onSaveStatusChange?.(syncRes.saved);
    } catch (err) {
      console.error('Failed to create new list:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-editorial text-xl font-bold text-stone-900">
            Save story to...
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[320px] overflow-y-auto">
          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs text-stone-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading your lists...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((l) => (
                <div
                  key={l.listId}
                  onClick={() => handleToggleList(l.listId)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        l.isInList
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {l.isInList && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    <span className="text-sm font-medium text-stone-800">
                      {l.listName}
                    </span>
                  </div>
                  {l.isPrivate && (
                    <span title="Private list">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create new list section */}
          {!showCreateInput ? (
            <button
              type="button"
              onClick={() => setShowCreateInput(true)}
              className="mt-3 w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create new list</span>
            </button>
          ) : (
            <form onSubmit={handleCreateList} className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <input
                type="text"
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g. technical, spiritual...)"
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 outline-none focus:border-stone-800 mb-2"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newListPrivate}
                    onChange={(e) => setNewListPrivate(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-0"
                  />
                  <span>Private</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateInput(false);
                      setNewListName('');
                    }}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newListName.trim() || isCreating}
                    className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    {isCreating && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Create</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            {isSyncing ? 'Saving changes...' : 'Saved to your profile'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveToListModal;
