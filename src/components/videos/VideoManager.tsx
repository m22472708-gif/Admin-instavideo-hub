import React, { useState, useMemo, useEffect } from 'react';
import { Video, VideoCategory, DEFAULT_CATEGORIES } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { VideoFormModal } from './VideoFormModal';
import { VideoTestModal } from './VideoTestModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import {
  Film,
  Search,
  Plus,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Tag,
} from 'lucide-react';

interface VideoManagerProps {
  videos: Video[];
  onRefresh: () => void;
  onDeleteSuccess?: (id: string) => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({ videos, onRefresh, onDeleteSuccess }) => {
  const { showSuccessToast, showErrorToast } = useToast();

  // Dynamic Categories state
  const [categories, setCategories] = useState<string[]>(() => StorageService.getCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    const unsub = FirebaseService.subscribeToCategories((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
      }
    });
    return () => unsub();
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'likes' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [testingVideo, setTestingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);

  // Filtered & Sorted list
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchesCategory =
          selectedCategory === 'All' || v.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'likes') return b.likes - a.likes;
        return a.title.localeCompare(b.title);
      });
  }, [videos, searchQuery, selectedCategory, sortBy]);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    const target = deletingVideo;
    setDeletingVideo(null);

    // Optimistic instant UI removal
    onDeleteSuccess?.(target.id);

    try {
      await FirebaseService.deleteVideo(target.id);
      showSuccessToast(
        'Video Deleted',
        `"${target.title}" permanently removed from Firebase and Userpanel.`
      );
    } catch (err: any) {
      console.warn('Delete warning:', err);
    } finally {
      onRefresh();
    }
  };

  const handleIncrementViews = async (video: Video, amount: number) => {
    try {
      const updated = await FirebaseService.saveVideo({
        ...video,
        views: Math.max(0, (video.views || 0) + amount),
      });
      showSuccessToast(
        'Metrics Synchronized',
        `Views updated to ${updated.views.toLocaleString()} for "${video.title}"`
      );
      onRefresh();
    } catch (err: any) {
      console.error('Error updating views:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, synopsis, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
        </div>

        {/* View Toggle, Sort & Add Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Sort selector */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-zinc-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-zinc-900 text-white">Newest First</option>
              <option value="views" className="bg-zinc-900 text-white">Most Viewed</option>
              <option value="likes" className="bg-zinc-900 text-white">Most Liked</option>
              <option value="title" className="bg-zinc-900 text-white">Title A-Z</option>
            </select>
          </div>

          {/* Grid / Table Mode Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
              title="Cinematic Poster Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Manage Categories Button */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-700 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-rose-500" />
            <span>Categories ({categories.length})</span>
          </button>

          {/* Upload / Add Video Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-rose-950/40 transition-all ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Upload Video
          </button>
        </div>
      </div>

      {/* Category Filter Horizontal Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/30'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80'
          }`}
        >
          All ({videos.length})
        </button>
        {categories.map((cat) => {
          const count = videos.filter(
            (v) => v.category?.toLowerCase() === cat.toLowerCase()
          ).length;
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/30'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80'
              }`}
            >
              {cat} {count > 0 && <span className="opacity-70 ml-1 font-mono">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <Film className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-zinc-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No videos found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No videos matched the search "${searchQuery}". Try clearing filters.`
              : 'No videos currently available in this category.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-xl text-xs bg-rose-600 text-white font-medium hover:bg-rose-500"
            >
              Add Video Now
            </button>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredVideos.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/70 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Title & Media</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Audience Metrics</th>
                  <th className="py-3.5 px-3">Stream Verification</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filteredVideos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Media & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {video.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                            {video.description || 'No synopsis provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {video.category}
                      </span>
                    </td>

                    {/* Duration Badge */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-zinc-300 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                        {video.duration}
                      </span>
                    </td>

                    {/* Views & Likes with quick bump */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-mono">
                            <Eye className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                            {video.views.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrementViews(video, 500)}
                            className="text-[10px] text-zinc-500 hover:text-emerald-400"
                            title="Simulate +500 views"
                          >
                            +500
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-rose-500 font-mono">
                          <Heart className="w-3 h-3 fill-rose-500/20" />
                          {video.likes.toLocaleString()}
                        </div>
                      </div>
                    </td>

                    {/* Test Stream Link */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => setTestingVideo(video)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 transition-all text-xs"
                      >
                        <Play className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span>Test Stream Link</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(video)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit Video Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingVideo(video)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CINEMATIC POSTER GRID VIEW */}
      {viewMode === 'grid' && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col transition-all hover:border-rose-500/50 hover:shadow-xl"
            >
              {/* Poster Frame */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Corner Time Badge (Requirement: Corner time badge e.g. "18:45" or "2:10:00") */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-white/10 shadow-md">
                  {video.duration}
                </div>

                {/* Category kicker */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-900/90 backdrop-blur-md text-zinc-300 text-[10px] font-semibold border border-zinc-700">
                  {video.category}
                </div>

                {/* Play hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button
                    type="button"
                    onClick={() => setTestingVideo(video)}
                    className="p-3 rounded-full bg-rose-600 text-white shadow-lg hover:scale-110 transition-transform"
                    title="Test Stream Link"
                  >
                    <Play className="w-5 h-5 fill-white" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-rose-500 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {video.description || 'No synopsis provided for this stream.'}
                  </p>
                </div>

                {/* Metrics & Test Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {(video.views / 1000).toFixed(1)}k
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                      {video.likes.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTestingVideo(video)}
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      title="Test Stream Link"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(video)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingVideo(video)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Add / Edit Modal */}
      {isFormOpen && (
        <VideoFormModal
          videoToEdit={editingVideo}
          isOpen={isFormOpen}
          availableCategories={categories}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVideo(null);
          }}
          onSaved={() => {
            onRefresh();
          }}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          videos={videos}
          onCategoriesUpdated={(updated) => {
            setCategories(updated);
          }}
        />
      )}

      {/* Video Stream Tester Modal */}
      {testingVideo && (
        <VideoTestModal video={testingVideo} onClose={() => setTestingVideo(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 flex justify-center items-start sm:items-center pt-12 sm:pt-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Delete Video from Catalog?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">"{deletingVideo.title}"</span>? This action
              will immediately remove it from all viewer frontends and Firestore sync.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingVideo(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel / Keep
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/40 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
