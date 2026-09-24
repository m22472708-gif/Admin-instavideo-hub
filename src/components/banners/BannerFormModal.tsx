import React, { useState } from 'react';
import { Banner } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { useToast } from '../../context/ToastContext';
import { X, Image as ImageIcon, Sparkles, Link, Upload, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface BannerFormModalProps {
  bannerToEdit?: Banner | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (banner: Banner) => void;
}

const SAMPLE_BANNER_IMAGES = [
  { label: 'Cyber Tokyo', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Action Cinema', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Deep Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Coastal Cinema', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80' },
];

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  bannerToEdit,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(bannerToEdit);
  const { showSuccessToast, showErrorToast } = useToast();

  const [imageUrl, setImageUrl] = useState(bannerToEdit?.imageUrl || '');
  const [targetLink, setTargetLink] = useState(bannerToEdit?.targetLink || '');
  const [active, setActive] = useState<boolean>(bannerToEdit?.active ?? true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Banner Image URL is required';
    } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      newErrors.imageUrl = 'Image URL must begin with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const saved = await FirebaseService.saveBanner({
        id: bannerToEdit?.id,
        imageUrl: imageUrl.trim(),
        targetLink: targetLink.trim(),
        active,
      });

      if (isEditing) {
        showSuccessToast('Banner Updated', 'Picture-only banner updated successfully in Firestore.');
      } else {
        showSuccessToast('Banner Created', 'New picture-only banner added to Firestore slider.');
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving banner to Firestore:', err);
      showErrorToast('Save Error', err?.message || 'Failed to save banner to Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-start sm:items-center p-0 sm:p-4">
      <div className="relative w-full max-w-xl bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh] my-0 sm:my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Prominent Back Button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold mr-1 transition-colors"
              aria-label="Back to Banners"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Back</span>
            </button>

            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 shrink-0 hidden sm:block">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {isEditing ? 'Edit Picture Banner' : 'Add New Picture Banner'}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                Picture-only hero billboard with real-time Firestore sync.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Direct Image URL input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200">
                  Banner Image URL <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-400">Direct picture link (16:9 or 21:9)</span>
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageLoadFailed(false);
                  }}
                  placeholder="https://images.unsplash.com/... or CDN image URL"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                    errors.imageUrl ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-800'
                  }`}
                  required
                />
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
              {errors.imageUrl && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.imageUrl}
                </p>
              )}

              {/* Presets Quick Fill */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
                </span>
                {SAMPLE_BANNER_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => {
                      setImageUrl(img.url);
                      setImageLoadFailed(false);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {img.label}
                  </button>
                ))}
              </div>

              {/* Picture-Only Live Visual Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium">Live Visual Preview (Picture-Only)</span>
                  <span className="text-emerald-400 font-mono text-[10px]">No Text / No Buttons</span>
                </div>

                <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-inner">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Banner visual preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoadFailed(false)}
                      onError={() => setImageLoadFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-xs">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
                      <span>Enter direct image URL above to preview</span>
                    </div>
                  )}

                  {imageLoadFailed && (
                    <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center text-amber-400 text-xs">
                      <AlertCircle className="w-6 h-6 mb-1" />
                      <span>Unable to load image from this URL</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Please check direct link or CORS access</span>
                    </div>
                  )}

                  {/* Active indicator dot on preview corner */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                        active
                          ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
                          : 'bg-zinc-800/90 text-zinc-400 backdrop-blur-sm'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-zinc-500'}`} />
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Redirect URL (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200">
                  Target Redirect Destination URL <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  placeholder="https://... (Where viewer goes when clicking the picture banner)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <Link className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-zinc-500">
                If specified, clicking anywhere on the picture banner will navigate viewers to this video or destination link.
              </p>
            </div>

            {/* Active Toggle Switch */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-white">
                  Active Status on Live Site
                </span>
                <span className="text-[11px] text-zinc-400">
                  {active
                    ? 'Banner is visible in the frontend hero slider'
                    : 'Banner is hidden from regular viewers'}
                </span>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6.5 rounded-full transition-colors relative ${
                    active ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      active ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Action Buttons */}
          <div className="sticky bottom-0 z-30 px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setTargetLink('');
                setImageLoadFailed(false);
              }}
              className="text-xs text-zinc-400 hover:text-rose-400 underline decoration-zinc-700 transition-colors"
            >
              Clear Fields
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 shadow-lg shadow-rose-950/50 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                {isSubmitting ? 'Saving to Firestore...' : isEditing ? 'Update Picture Banner' : 'Create Picture Banner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
