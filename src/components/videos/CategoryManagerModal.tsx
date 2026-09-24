import React, { useState } from 'react';
import { Tag, Plus, Trash2, X, Check, Edit2, AlertCircle } from 'lucide-react';
import { Video } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  videos: Video[];
  onCategoriesUpdated: (updated: string[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  videos,
  onCategoriesUpdated,
}) => {
  const { showSuccessToast, showErrorToast } = useToast();
  const [newCatInput, setNewCatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCat, setDeletingCat] = useState<string | null>(null);

  // Rename / Edit State
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');

  if (!isOpen) return null;

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showErrorToast('Duplicate Category', `"${trimmed}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await FirebaseService.addCategory(trimmed);
      onCategoriesUpdated(updated);
      setNewCatInput('');
      showSuccessToast('Category Added', `"${trimmed}" is now active.`);
    } catch {
      const updated = StorageService.addCategory(trimmed);
      onCategoriesUpdated(updated);
      setNewCatInput('');
      showSuccessToast('Category Added', `"${trimmed}" saved.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (catName: string) => {
    setEditingCat(catName);
    setEditInput(catName);
  };

  const handleSaveEdit = async (oldName: string) => {
    const trimmedNew = editInput.trim();
    if (!trimmedNew || trimmedNew.toLowerCase() === oldName.toLowerCase()) {
      setEditingCat(null);
      return;
    }

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmedNew.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
      )
    ) {
      showErrorToast('Duplicate Name', `"${trimmedNew}" category already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await FirebaseService.updateCategory(oldName, trimmedNew);
      onCategoriesUpdated(updated);
      showSuccessToast('Category Renamed', `"${oldName}" updated to "${trimmedNew}".`);
    } catch {
      const updated = StorageService.updateCategory(oldName, trimmedNew);
      onCategoriesUpdated(updated);
      showSuccessToast('Category Renamed', `"${oldName}" updated to "${trimmedNew}".`);
    } finally {
      setEditingCat(null);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catName: string) => {
    setIsSubmitting(true);
    try {
      const updated = await FirebaseService.deleteCategory(catName);
      onCategoriesUpdated(updated);
      showSuccessToast('Category Deleted', `"${catName}" removed.`);
    } catch {
      const updated = StorageService.deleteCategory(catName);
      onCategoriesUpdated(updated);
      showSuccessToast('Category Deleted', `"${catName}" removed.`);
    } finally {
      setDeletingCat(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Manage Video Categories
              </h2>
              <p className="text-xs text-zinc-400">
                Add, rename (edit), or delete categories dynamically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="e.g. Hindi Dubbed, Bangla Natok, Hollywood, Thriller"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newCatInput.trim() || isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-lg shadow-rose-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Active Categories ({categories.length})
              </span>
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const updated = await FirebaseService.saveCategories([]);
                    onCategoriesUpdated(updated);
                    showSuccessToast('Categories Cleared', 'All categories cleared to fresh state.');
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <Tag className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">No Categories Added Yet</p>
                <p className="text-[11px] text-zinc-500">
                  Type a name above and click &quot;Add&quot; to create your first category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = videos.filter(
                    (v) => v.category?.toLowerCase() === cat.toLowerCase()
                  ).length;
                  const isEditingThis = editingCat === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-rose-500 text-xs text-white focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(cat);
                              } else if (e.key === 'Escape') {
                                setEditingCat(null);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCat(null)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span className="text-sm font-semibold text-white truncate">
                            {cat}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono text-[10px] shrink-0">
                            {count} {count === 1 ? 'video' : 'videos'}
                          </span>
                        </div>
                      )}

                      {!isEditingThis && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            disabled={isSubmitting}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title={`Rename / Edit "${cat}"`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingCat(cat)}
                            disabled={isSubmitting}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={`Delete "${cat}" category`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {deletingCat && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-in fade-in">
            <div className="bg-zinc-900 border border-rose-500/40 rounded-2xl p-5 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Category?</h3>
                <p className="text-xs text-zinc-300">
                  Are you sure you want to remove &quot;<strong>{deletingCat}</strong>&quot;?
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingCat)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/95 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
