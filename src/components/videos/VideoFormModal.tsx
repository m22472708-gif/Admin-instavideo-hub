import React, { useState, useEffect } from 'react';
import { Video, VideoCategory, DEFAULT_CATEGORIES } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Clock,
  Film,
  Link,
  Eye,
  Heart,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Plus,
  Tag,
  Check,
} from 'lucide-react';

interface VideoFormModalProps {
  videoToEdit?: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedVideo: Video) => void;
  availableCategories?: string[];
}

const SAMPLE_POSTERS = [
  { label: 'Sci-Fi Cyber', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
  { label: 'Action Blockbuster', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bangla / Coastal', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dark Thriller', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Anime Style', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Desert Epic', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
];

const SAMPLE_STREAMS = [
  { label: 'Big Buck Bunny (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { label: 'Tears of Steel (Sci-Fi)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
  { label: 'Sintel (Fantasy)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
];

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  videoToEdit,
  isOpen,
  onClose,
  onSaved,
  availableCategories,
}) => {
  const isEditing = Boolean(videoToEdit);
  const { showSuccessToast, showErrorToast } = useToast();

  const [categoriesList, setCategoriesList] = useState<string[]>(() =>
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : StorageService.getCategories()
  );

  const [title, setTitle] = useState(videoToEdit?.title || '');
  const [duration, setDuration] = useState(videoToEdit?.duration || '');
  const [category, setCategory] = useState<VideoCategory>(
    videoToEdit?.category || (categoriesList[0] || 'Movies')
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(videoToEdit?.thumbnailUrl || '');
  const [directLink, setDirectLink] = useState(videoToEdit?.directLink || '');
  const [description, setDescription] = useState(videoToEdit?.description || '');
  const [views, setViews] = useState<number>(videoToEdit?.views ?? 0);
  const [likes, setLikes] = useState<number>(videoToEdit?.likes ?? 0);

  // New Category inline adder
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (availableCategories && availableCategories.length > 0) {
      setCategoriesList(availableCategories);
    }
  }, [availableCategories]);

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    await handleAddNewCategoryDirect(trimmed);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategoryDirect = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    try {
      const updated = await FirebaseService.addCategory(trimmed);
      setCategoriesList(updated);
      setCategory(trimmed);
      showSuccessToast('Category Added', `"${trimmed}" category added and selected.`);
    } catch {
      const updated = StorageService.addCategory(trimmed);
      setCategoriesList(updated);
      setCategory(trimmed);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Video title is required';
    if (!duration.trim()) newErrors.duration = 'Duration is required (e.g. 18:45 or 24:10)';
    if (!thumbnailUrl.trim()) newErrors.thumbnailUrl = 'Thumbnail URL is required';
    if (!directLink.trim()) newErrors.directLink = 'Direct stream link is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const saved = await FirebaseService.saveVideo({
        id: videoToEdit?.id,
        title: title.trim(),
        duration: duration.trim(),
        category,
        thumbnailUrl: thumbnailUrl.trim(),
        directLink: directLink.trim(),
        views: Number(views) || 0,
        likes: Number(likes) || 0,
        description: description.trim(),
      });

      if (isEditing) {
        showSuccessToast('Video Updated', `"${saved.title}" updated successfully in Firestore.`);
      } else {
        showSuccessToast('Video Uploaded', `"${saved.title}" saved to Firestore "videos" collection.`);
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving video to Firestore:', err);
      showErrorToast('Save Failed', err?.message || 'Failed to save video to Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start sm:items-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh] my-0 sm:my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Top Modal Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Back Button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold mr-1 transition-colors"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Back</span>
            </button>

            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 shrink-0 hidden sm:block">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {isEditing ? 'Edit Video Details' : 'Upload / Add New Video'}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                {isEditing
                  ? 'Update metadata, stream links, and metrics.'
                  : 'Add a new movie or web series to the catalog.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="space-y-4">
            {/* Row 1: Title & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Video Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Shadow Strike: Crimson Protocol (4K)"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                    errors.title ? 'border-rose-500' : 'border-zinc-800'
                  }`}
                />
                {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Duration Badge <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 18:45 or 24:10"
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-950 border font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                      errors.duration ? 'border-rose-500' : 'border-zinc-800'
                    }`}
                  />
                  <Clock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                </div>
                {errors.duration && <p className="text-[11px] text-rose-400">{errors.duration}</p>}
              </div>
            </div>

            {/* Row 2: Category Selector with Dynamic Adder */}
            <div className="space-y-1.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  Category
                </label>
                {!isAddingNewCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(true)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    + Add New Category
                  </button>
                )}
              </div>

              {isAddingNewCategory || categoriesList.length === 0 ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={isAddingNewCategory ? newCategoryInput : category}
                    onChange={(e) => {
                      if (isAddingNewCategory) {
                        setNewCategoryInput(e.target.value);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    placeholder="Enter category name (e.g. Movies, Drama, Action)"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-rose-500/50 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    autoFocus={isAddingNewCategory}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isAddingNewCategory) {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                  />
                  {isAddingNewCategory ? (
                    <>
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCategory(false)}
                        className="px-2.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (category.trim()) {
                          handleAddNewCategoryDirect(category.trim());
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                >
                  <option value="" disabled className="text-zinc-500">
                    -- Select Category --
                  </option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Row 3: Thumbnail URL with Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">
                  Thumbnail Image URL <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-zinc-500">Live preview enabled</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="relative">
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://..."
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono ${
                        errors.thumbnailUrl ? 'border-rose-500' : 'border-zinc-800'
                      }`}
                    />
                    <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  </div>

                  {/* Quick Poster Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
                    </span>
                    {SAMPLE_POSTERS.slice(0, 4).map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setThumbnailUrl(p.url)}
                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Thumbnail Box with Duration Badge */}
                <div className="w-full sm:w-28 h-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 relative group shrink-0">
                  {thumbnailUrl ? (
                    <>
                      <img
                        src={thumbnailUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-white tracking-wider border border-white/10">
                        {duration || '18:45'}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
              {errors.thumbnailUrl && (
                <p className="text-[11px] text-rose-400">{errors.thumbnailUrl}</p>
              )}
            </div>

            {/* Row 4: Direct Stream Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Direct Stream Link (MP4 / HLS / Redirect) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={directLink}
                  onChange={(e) => setDirectLink(e.target.value)}
                  placeholder="https://your-streaming-server.com/video.mp4"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono ${
                    errors.directLink ? 'border-rose-500' : 'border-zinc-800'
                  }`}
                />
                <Link className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>

              {/* Stream URL Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
                  <Film className="w-3 h-3 text-cyan-400" /> Test streams:
                </span>
                {SAMPLE_STREAMS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setDirectLink(s.url)}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-mono"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.directLink && (
                <p className="text-[11px] text-rose-400">{errors.directLink}</p>
              )}
            </div>

            {/* Row 5: Views & Likes Initial Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Initial Views
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={views}
                    onChange={(e) => setViews(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <Eye className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Initial Likes
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={likes}
                    onChange={(e) => setLikes(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <Heart className="w-3.5 h-3.5 text-rose-500/70 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Row 6: Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Synopsis / Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter movie plot, release info, cast, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Sticky Bottom Form Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setDuration('');
                setThumbnailUrl('');
                setDirectLink('');
                setDescription('');
                setViews(0);
                setLikes(0);
              }}
              className="text-xs text-zinc-400 hover:text-rose-400 underline decoration-zinc-700 transition-colors"
            >
              Clear All (Fresh Form)
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Database...' : isEditing ? 'Save Changes' : 'Upload Video'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
