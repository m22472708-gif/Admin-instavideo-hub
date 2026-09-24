import React, { useState } from 'react';
import { Banner } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { useToast } from '../../context/ToastContext';
import { FALLBACK_BANNER_IMAGE_SVG, sanitizeBannerUrl, getProxyImageUrl } from '../../utils/bannerAssets';
import { X, Image as ImageIcon, Sparkles, Link, Upload, ArrowLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface BannerFormModalProps {
  bannerToEdit?: Banner | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (banner: Banner) => void;
}

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
  const [triedProxy, setTriedProxy] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Invalid file', 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('File too large', 'Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setImageLoadFailed(false);
        setTriedProxy(false);
        setErrors((prev) => ({ ...prev, imageUrl: '' }));
        showSuccessToast('Image Loaded', 'Local image file loaded successfully.');
      }
    };
    reader.onerror = () => {
      showErrorToast('Upload Error', 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const trimmed = sanitizeBannerUrl(imageUrl);
    if (!trimmed) {
      newErrors.imageUrl = 'Banner image link (URL) is required';
    } else if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('data:image/')
    ) {
      newErrors.imageUrl = 'Please enter a valid image link (e.g. https://.../image.jpg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let cleanImageUrl = sanitizeBannerUrl(imageUrl.trim());
      // If the direct link failed but proxy succeeded, save proxied URL for guaranteed live rendering
      if (triedProxy && !cleanImageUrl.startsWith('data:') && !cleanImageUrl.includes('wsrv.nl')) {
        cleanImageUrl = getProxyImageUrl(cleanImageUrl);
      }

      const saved = await FirebaseService.saveBanner({
        id: bannerToEdit?.id,
        imageUrl: cleanImageUrl,
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
            {/* Direct Image URL & Device Upload */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-zinc-200">
                  Banner Image URL (ছবির লিঙ্ক) <span className="text-rose-400">*</span>
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer border border-zinc-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  <span>ডিভাইস থেকে ফাইল নির্বাচন (ঐচ্ছিক)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = sanitizeBannerUrl(raw);
                    setImageUrl(sanitized || raw);
                    setImageLoadFailed(false);
                    setTriedProxy(false);
                    if (errors.imageUrl) {
                      setErrors((prev) => ({ ...prev, imageUrl: '' }));
                    }
                  }}
                  placeholder="https://... (ছবির ডিরেক্ট লিঙ্ক পেস্ট করুন, যেমন: .jpg, .png, .webp)"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                    errors.imageUrl ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-800'
                  }`}
                />
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
              
              {/* Helpful Tips for Links */}
              <div className="text-[11px] text-zinc-400 flex items-start gap-1.5 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                <span className="shrink-0 text-amber-400">💡</span>
                <span>
                  <b>পরামর্শ:</b> যেকোনো ওয়েবসাইটের ছবির ওপর রাইট-ক্লিক করে <b>&quot;Copy Image Address&quot;</b> (বা মোবাইল ব্রাউজারে ছবির ওপর চাপ দিয়ে ধরে রেখে &quot;Copy Image Link&quot;) কপি করে এখানে পেস্ট করুন।
                </span>
              </div>

              {errors.imageUrl && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.imageUrl}
                </p>
              )}

              {/* Picture-Only Live Visual Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium">Live Visual Preview (ব্যানার প্রিভিউ)</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Picture-Only</span>
                </div>

                <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Banner visual preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoadFailed(false)}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const clean = sanitizeBannerUrl(imageUrl);
                        if (!triedProxy && clean && !clean.startsWith('data:') && !clean.includes('wsrv.nl')) {
                          setTriedProxy(true);
                          target.src = getProxyImageUrl(clean);
                        } else {
                          setImageLoadFailed(true);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                      <ImageIcon className="w-8 h-8 mb-1 text-zinc-600 opacity-60" />
                      <span>উপরে ছবির লিঙ্ক (URL) পেস্ট করলেই প্রিভিউ ভেসে উঠবে</span>
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

                {imageLoadFailed && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <p className="font-semibold text-rose-200">লিঙ্ক থেকে ছবি সরাসরি আসছে না (CORS / Hotlink Protection)</p>
                        <p className="text-[11px] text-zinc-300 mt-0.5">
                          এই ওয়েবসাইটটি ছবির ডিরেক্ট ভিউ আটকে রেখেছে। নিচের বাটনে চাপ দিন, ক্লাউড প্রক্সি দিয়ে তৎক্ষণাৎ আনব্লক হয়ে যাবে:
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const clean = sanitizeBannerUrl(imageUrl);
                        const proxied = getProxyImageUrl(clean);
                        setImageUrl(proxied);
                        setTriedProxy(true);
                        setImageLoadFailed(false);
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>প্রক্সি দিয়ে ছবি আনলক করুন</span>
                    </button>
                  </div>
                )}
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
