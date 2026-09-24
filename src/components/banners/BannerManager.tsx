import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { BannerFormModal } from './BannerFormModal';
import {
  FALLBACK_BANNER_IMAGE_SVG,
  sanitizeBannerUrl,
  getProxyImageUrl,
} from '../../utils/bannerAssets';
import {
  Images,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Link,
  Eye,
  EyeOff,
  RotateCcw,
  Wrench,
} from 'lucide-react';

interface BannerManagerProps {
  banners: Banner[];
  onRefresh: () => void;
  onDeleteSuccess?: (id: string) => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({ banners, onRefresh, onDeleteSuccess }) => {
  const { showSuccessToast, showErrorToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carousel simulator state
  const activeBanners = banners.filter((b) => b.active);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Auto rotate preview every 4.5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Keep previewIndex in bounds
  useEffect(() => {
    if (previewIndex >= activeBanners.length) {
      setPreviewIndex(0);
    }
  }, [activeBanners.length, previewIndex]);

  const handleToggleActive = async (banner: Banner) => {
    try {
      await FirebaseService.toggleBannerActive(banner.id, banner.active);
      const newState = !banner.active;
      showSuccessToast(
        `Banner ${newState ? 'Enabled' : 'Disabled'}`,
        `Picture banner is now ${newState ? 'ACTIVE on live site' : 'HIDDEN from viewers'}.`
      );
      onRefresh();
    } catch (err: any) {
      console.error('Error toggling banner status:', err);
      showErrorToast('Update Failed', err?.message || 'Could not toggle banner status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBanner) return;
    const target = deletingBanner;
    setIsDeleting(true);
    setDeletingBanner(null);

    // Immediate optimistic removal
    onDeleteSuccess?.(target.id);

    try {
      await FirebaseService.deleteBanner(target.id);
      showSuccessToast(
        'Banner Deleted',
        'Picture banner permanently removed from Firebase and Userpanel.'
      );
    } catch (err: any) {
      console.warn('Banner delete warning:', err);
    } finally {
      setIsDeleting(false);
      onRefresh();
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleClearAllBanners = async () => {
    setIsClearingAll(true);
    try {
      for (const b of banners) {
        await FirebaseService.deleteBanner(b.id);
      }
      StorageService.saveBanners([]);
      showSuccessToast(
        'All Banners Cleared',
        'Banner database is now 100% clean and fresh. No demo banners remain.'
      );
      setIsClearModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showErrorToast('Clear Notice', err?.message || 'Failed to clear all banners');
    } finally {
      setIsClearingAll(false);
    }
  };

  const currentHeroBanner = activeBanners[previewIndex] || activeBanners[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Manager Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Images className="w-5 h-5 text-rose-500" />
            Picture-Only Banner Slider Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {activeBanners.length} of {banners.length} picture slides active in Firestore & real-time sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {banners.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all"
              title="Delete all banners to keep everything fresh"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All (Wipe Fresh)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Picture Banner
          </button>
        </div>
      </div>

      {/* PICTURE-ONLY LIVE CAROUSEL SIMULATOR (NO TITLES / NO SUBTITLES / NO BUTTONS) */}
      {activeBanners.length > 0 && currentHeroBanner && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl bg-gradient-to-r from-rose-950/90 via-zinc-900 to-indigo-950/90 group">
          {/* Header indicator bar */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Live Picture Billboard (No Text)
            </span>
            {currentHeroBanner.targetLink && (
              <span className="px-2 py-1 rounded-full text-[10px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md border border-white/10 hidden sm:inline-flex items-center gap-1">
                <Link className="w-2.5 h-2.5 text-rose-400" />
                Has Redirect
              </span>
            )}
          </div>

          {/* Picture Slide Display */}
          <div className="relative aspect-[16/8] sm:aspect-[21/8] md:aspect-[24/8] w-full overflow-hidden">
            <img
              src={currentHeroBanner.imageUrl || FALLBACK_BANNER_IMAGE_SVG}
              alt="Live picture banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 select-none"
              onError={(e) => {
                const target = e.currentTarget;
                const orig = currentHeroBanner.imageUrl;
                if (orig && !target.src.includes('wsrv.nl') && !orig.startsWith('data:') && target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                  target.src = getProxyImageUrl(orig);
                } else if (target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                  target.src = FALLBACK_BANNER_IMAGE_SVG;
                }
              }}
            />

            {/* Optional clickable link overlay if targetLink exists */}
            {currentHeroBanner.targetLink && (
              <a
                href={currentHeroBanner.targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 cursor-pointer"
                title={`Clicking banner redirects to: ${currentHeroBanner.targetLink}`}
              />
            )}

            {/* Carousel navigation buttons */}
            {activeBanners.length > 1 && (
              <>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex((prev) => (prev + 1) % activeBanners.length);
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* Slide dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewIndex(idx)}
                  className={`transition-all rounded-full ${
                    idx === previewIndex
                      ? 'w-5 h-2 bg-rose-500'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {banners.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center">
          <Images className="w-12 h-12 mx-auto text-slate-400 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Banners in Firestore</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Upload your first picture-only hero banner with direct image URL.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
          >
            <Plus className="w-4 h-4" />
            Add Picture Banner
          </button>
        </div>
      )}

      {/* PICTURE BANNERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`group bg-white dark:bg-zinc-900 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
              banner.active
                ? 'border-slate-200 dark:border-zinc-800 hover:border-rose-500/50'
                : 'border-slate-200/60 dark:border-zinc-800/40 opacity-75'
            }`}
          >
            {/* Pure Picture Banner Preview */}
            <div className="relative aspect-[21/9] bg-gradient-to-r from-rose-950/80 via-zinc-900 to-purple-950/80 overflow-hidden">
              <img
                src={banner.imageUrl || FALLBACK_BANNER_IMAGE_SVG}
                alt={`Picture banner slide ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget;
                  const orig = banner.imageUrl;
                  if (orig && !target.src.includes('wsrv.nl') && !orig.startsWith('data:') && target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                    target.src = getProxyImageUrl(orig);
                  } else if (target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                    target.src = FALLBACK_BANNER_IMAGE_SVG;
                  }
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md ${
                    banner.active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800/90 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${banner.active ? 'bg-white' : 'bg-zinc-500'}`} />
                  {banner.active ? 'Active on Live Site' : 'Hidden / Inactive'}
                </span>
              </div>

              {/* Image URL indicator watermark */}
              <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 text-[10px] text-zinc-300 font-mono truncate max-w-full border border-white/10">
                  <span className="text-zinc-500">Slide #{index + 1}:</span>
                  <span className="truncate">{banner.imageUrl}</span>
                </div>
              </div>
            </div>

            {/* Target Destination Link Info */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 truncate">
                <Link className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-zinc-300 shrink-0">Destination:</span>
                {banner.targetLink ? (
                  <span className="font-mono truncate text-slate-700 dark:text-zinc-400">
                    {banner.targetLink}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-zinc-500 italic">None (Image view only)</span>
                )}
              </div>

              {banner.targetLink && (
                <a
                  href={banner.targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:text-rose-400 shrink-0 p-1"
                  title="Test Target Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Banner Control Bar (1-Click Toggle & 1-Click Delete) */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              {/* 1-Click Toggle */}
              <button
                type="button"
                onClick={() => handleToggleActive(banner)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  banner.active
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-transparent hover:bg-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {banner.active ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Active (Click to Hide)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Inactive (Click to Enable)</span>
                  </>
                )}
              </button>

              {/* Edit and Delete buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(banner)}
                  className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Banner Image URL"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingBanner(banner)}
                  className="p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="1-Click Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <BannerFormModal
          bannerToEdit={editingBanner}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBanner(null);
          }}
          onSaved={() => {
            onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 flex justify-center items-start sm:items-center pt-12 sm:pt-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Delete Picture Banner?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Are you sure you want to permanently delete this picture banner from Firestore? It will be immediately removed from the live streaming hero carousel.
            </p>

            {/* Visual thumbnail of banner being deleted */}
            <div className="mt-3 relative aspect-[21/9] rounded-xl overflow-hidden border border-zinc-800 bg-black">
              <img
                src={deletingBanner.imageUrl}
                alt="Banner to delete"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBanner(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel / Keep
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 shadow-md shadow-rose-950/40 transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Banners Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 flex justify-center items-start sm:items-center pt-12 sm:pt-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Wipe All Banners (Fresh Slate)?
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Are you sure you want to delete all {banners.length} banners? This will permanently remove them from Firestore, Realtime Database, and local cache so your slider is 100% fresh.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearingAll}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllBanners}
                disabled={isClearingAll}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 shadow-md shadow-rose-950/40 transition-all"
              >
                {isClearingAll ? 'Clearing...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
