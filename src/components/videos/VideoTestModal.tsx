import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Video, GeneralSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { AdsterraInjector } from '../../utils/adsterraInjector';
import { getProxyImageUrl, FALLBACK_BANNER_IMAGE_SVG } from '../../utils/bannerAssets';
import { AdsterraBannerSlot } from '../adsterra/AdsterraBannerSlot';
import {
  X,
  ExternalLink,
  Film,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  RotateCcw,
  Play,
  ShieldCheck,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface VideoTestModalProps {
  video: Video | null;
  onClose: () => void;
  settings?: GeneralSettings;
  isAdminPreview?: boolean;
}

export const VideoTestModal: React.FC<VideoTestModalProps> = ({
  video,
  onClose,
  settings: propSettings,
  isAdminPreview = false,
}) => {
  const settings = propSettings || StorageService.getSettings();

  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminBypass, setAdminBypass] = useState(isAdminPreview);
  const [imgError, setImgError] = useState(false);

  // Video Unlock & Ad System state
  const isUnlockSystemEnabled = Boolean(settings.unlockAdEnabled);
  const requiredClicks = Math.max(1, Number(settings.unlockAdRequiredClicks) || 3);
  const waitSeconds = Math.max(1, Number(settings.unlockAdWaitSeconds) || 10);
  const adUrl = settings.unlockAdUrl || 'https://example.com/ads';
  const buttonLabel = settings.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)';

  // If unlock system is turned OFF or admin has bypass enabled, video is unlocked!
  const [isUnlocked, setIsUnlocked] = useState(!isUnlockSystemEnabled || adminBypass);
  const [completedClicks, setCompletedClicks] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(waitSeconds);
  const [showUnlockedToast, setShowUnlockedToast] = useState(false);
  const [isHighlightingUnlock, setIsHighlightingUnlock] = useState(false);

  const videoPlayerContainerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const unlockSectionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Adsterra ads for video page
  const [adsterraNonce, setAdsterraNonce] = useState(0);
  const activeVideoAds = useMemo(() => {
    return AdsterraInjector.getActiveAdsForPlacement(settings.adsterraAds, 'video_page');
  }, [settings.adsterraAds, adsterraNonce]);

  // Handle interaction click inside video modal to fire popunders continuously with multi-script power
  const handleModalInteraction = () => {
    activeVideoAds.forEach((ad) => {
      AdsterraInjector.triggerPopunder(ad);
      setAdsterraNonce((n) => n + 1);
    });
  };

  // Inject scripts for video page
  useEffect(() => {
    if (settings.adsterraAds && settings.adsterraAds.length > 0) {
      AdsterraInjector.injectAdWidgets(settings.adsterraAds, 'video_page');
    }
  }, [settings.adsterraAds]);

  // Effective unlocked state
  const effectiveUnlocked = !isUnlockSystemEnabled || adminBypass || isUnlocked;

  // Reset unlock state when video or settings change
  useEffect(() => {
    setIsUnlocked(!isUnlockSystemEnabled || adminBypass);
    setCompletedClicks(0);
    setIsWaiting(false);
    setIsPlaying(false);
    setLoadError(false);
    setImgError(false);
    setRemainingSeconds(waitSeconds);
    setShowUnlockedToast(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [video?.id, isUnlockSystemEnabled, adminBypass, waitSeconds]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!video) return null;

  const scrollToUnlockSection = () => {
    setIsHighlightingUnlock(true);
    unlockSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      setIsHighlightingUnlock(false);
    }, 2000);
  };

  // Handle clicking "Unlock Video"
  const handleStartUnlockAd = () => {
    if (effectiveUnlocked || isWaiting) return;

    // 1. Open ad URL in a new tab
    if (adUrl) {
      window.open(adUrl, '_blank');
    }

    // 2. Start countdown timer
    setIsWaiting(true);
    setRemainingSeconds(waitSeconds);

    let current = waitSeconds;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      current -= 1;
      setRemainingSeconds(current);

      if (current <= 0) {
        clearInterval(timerRef.current);
        setIsWaiting(false);
        setCompletedClicks((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= requiredClicks) {
            // All required clicks completed! Unlock video
            setIsUnlocked(true);
            setShowUnlockedToast(true);
            setIsPlaying(true);

            // Automatically scroll smoothly to the video player
            setTimeout(() => {
              videoPlayerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Trigger play
              if (videoElementRef.current) {
                videoElementRef.current.play().catch(() => {
                  // Autoplay might require interaction in some browsers
                });
              }
            }, 350);

            setTimeout(() => {
              setShowUnlockedToast(false);
            }, 5000);
          }
          return nextCount;
        });
      }
    }, 1000);
  };

  const handleResetLock = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsUnlocked(false);
    setCompletedClicks(0);
    setIsWaiting(false);
    setIsPlaying(false);
    setRemainingSeconds(waitSeconds);
    setShowUnlockedToast(false);
    if (videoElementRef.current) {
      videoElementRef.current.pause();
    }
  };

  const handleStartPlayback = () => {
    if (!effectiveUnlocked) {
      scrollToUnlockSection();
      return;
    }
    setIsPlaying(true);
    setTimeout(() => {
      if (videoElementRef.current) {
        videoElementRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const posterImageSrc = !imgError && video.thumbnailUrl
    ? getProxyImageUrl(video.thumbnailUrl)
    : FALLBACK_BANNER_IMAGE_SVG;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-0 sm:p-4">
      <div 
        onClick={handleModalInteraction}
        className="relative w-full max-w-2xl bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh] my-0 sm:my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Prominent Back Button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold mr-1 transition-colors"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Back</span>
            </button>

            <div className="p-1.5 rounded-lg bg-rose-600/20 text-rose-500 border border-rose-500/30 shrink-0 hidden sm:block">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">{video.title}</h3>
                {isUnlockSystemEnabled ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      effectiveUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {effectiveUnlocked ? 'Unlocked' : 'Locked (Ad-Wall)'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Direct Stream (No Lock)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">Category: {video.category} • {video.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Admin Bypass Toggle if opened in Admin mode */}
            {isAdminPreview && isUnlockSystemEnabled && (
              <button
                type="button"
                onClick={() => setAdminBypass((prev) => !prev)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  adminBypass
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
                title="Toggle between direct admin playback and viewer locked simulation"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{adminBypass ? 'Admin Direct Play' : 'Simulate Viewer Lock'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Adsterra Video Page Active Triggers Banner */}
          {activeVideoAds.length > 0 && (
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-400">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                <span className="font-bold">Adsterra (Video Page):</span>
                {activeVideoAds.map((ad) => {
                  const multiplier = ad.multiplier || ad.maxTriggers || 5;
                  const count = AdsterraInjector.getTriggerCount(ad.id);
                  return (
                    <span key={ad.id} className="px-2 py-0.5 rounded bg-emerald-500/20 font-mono font-bold text-[10px]">
                      {ad.name}: {multiplier}x Parallel (Fired: {count}x, Non-Stop)
                    </span>
                  );
                })}
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                ৫টি স্ক্রিপ্টের সমান সমান্তরাল পাওয়ারে অবিরাম চালু আছে
              </span>
            </div>
          )}

          {/* Unlocked Toast Banner */}
          {showUnlockedToast && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-md animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>🎉 Video Unlocked! Playback stream is active.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowUnlockedToast(false)}
                className="text-white/80 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Video Player Container - NEVER a blank black screen */}
          <div
            ref={videoPlayerContainerRef}
            className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden select-none border-b border-zinc-800/80"
          >
            {/* 1. Actual Video Element when Playing */}
            {isPlaying && video.directLink ? (
              <video
                ref={videoElementRef}
                src={video.directLink}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                onError={() => setLoadError(true)}
              />
            ) : (
              /* 2. Visual Thumbnail Poster & Interactive Overlays (Prevents Black Screen) */
              <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                {/* Background Poster Image */}
                <img
                  src={posterImageSrc}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />

                {/* Subtle scrim overlay so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />

                {/* Center Action Button */}
                {effectiveUnlocked ? (
                  /* Unlocked: Ready to Play */
                  <button
                    type="button"
                    onClick={handleStartPlayback}
                    className="relative z-10 group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/90 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-950/60 ring-4 ring-rose-500/30 group-hover:ring-rose-500/50 transition-all">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs border border-white/10 shadow-md">
                      Play Stream (ভিডিও চালান)
                    </span>
                  </button>
                ) : (
                  /* Locked: Ad-wall prompt */
                  <div
                    onClick={scrollToUnlockSection}
                    className="relative z-10 group flex flex-col items-center gap-2 cursor-pointer p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-amber-500/40 hover:border-amber-400 transition-all shadow-2xl max-w-xs text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:scale-105 transition-transform">
                      <Lock className="w-7 h-7 animate-pulse text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Video Locked — Unlock to Play
                      </h4>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">
                        ভিডিও দেখতে নিচে Unlock Video বাটনে ক্লিক করুন
                      </p>
                    </div>
                    <span className="mt-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30">
                      Step: {completedClicks} of {requiredClicks} Ads
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message when Stream is CORS blocked */}
            {loadError && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-zinc-300">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-white">Stream restricted or CORS protected</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  This CDN prevents inline playback inside this frame. You can open and stream it directly in a new browser tab.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <a
                    href={video.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
                  >
                    Open in External Tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadError(false);
                      setIsPlaying(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Reset Player
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Unlock Video Action Section (Under the Video Player) */}
          {isUnlockSystemEnabled && !adminBypass && (
            <div
              ref={unlockSectionRef}
              className={`p-4 sm:p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 transition-all duration-300 ${
                isHighlightingUnlock ? 'ring-2 ring-amber-500 bg-amber-500/10' : ''
              }`}
            >
              <div className="rounded-2xl bg-zinc-900/90 border border-amber-500/30 p-4 sm:p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {effectiveUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{buttonLabel}</span>
                        {effectiveUnlocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ready to Play
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {effectiveUnlocked
                          ? 'All required ads verified. Video is unlocked for streaming.'
                          : `Click to visit sponsored link. Wait ${waitSeconds} seconds per visit (${completedClicks}/${requiredClicks} completed).`}
                      </p>
                    </div>
                  </div>

                  {/* Progress Counter Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 font-mono text-white">
                      {completedClicks} / {requiredClicks} Ads
                    </span>
                    {effectiveUnlocked && (
                      <button
                        type="button"
                        onClick={handleResetLock}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 transition-colors"
                        title="Relock to test unlock flow again"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Test Again</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="py-3">
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        effectiveUnlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, (completedClicks / requiredClicks) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Unlock Action Button */}
                {!effectiveUnlocked ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleStartUnlockAd}
                      disabled={isWaiting}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isWaiting
                          ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 cursor-wait'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-amber-950/40 cursor-pointer active:scale-[0.99]'
                      }`}
                    >
                      {isWaiting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-amber-400" />
                          <span>
                            Please wait {remainingSeconds}s... (Viewing Ad {completedClicks + 1} of {requiredClicks})
                          </span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          <span>
                            Click to Visit Ad ({completedClicks + 1} of {requiredClicks}) & Unlock Video
                          </span>
                        </>
                      )}
                    </button>

                    {isWaiting && (
                      <div className="text-center text-xs text-amber-400/90 font-medium animate-pulse">
                        ⏳ Please stay on the page for {remainingSeconds} seconds until the countdown completes!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">Video Unlocked! Enjoy watching your stream.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartPlayback}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Video Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adsterra Sponsored Banner for Video Page (if native banner is configured) */}
          {activeVideoAds.some((a) => a.type === 'native_banner') && (
            <div className="px-4 sm:px-5 pt-2">
              <AdsterraBannerSlot
                ad={activeVideoAds.find((a) => a.type === 'native_banner')}
                placementName="Video Stream Sponsor Ad"
              />
            </div>
          )}

          {/* Stream Link Details */}
          <div className="p-4 sm:p-5 space-y-3 bg-zinc-900">
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Destination Direct Link
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                <span className="truncate flex-1">{video.directLink}</span>
                <a
                  href={video.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                  title="Open Direct Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Category</span>
                <span className="font-medium text-white">{video.category}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Duration Corner Badge</span>
                <span className="font-medium text-white font-mono">{video.duration}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 col-span-2 sm:col-span-1">
                <span className="text-zinc-500 block text-[10px]">Live Metrics</span>
                <span className="font-medium text-emerald-400 font-mono">
                  {video.views.toLocaleString()} views · {video.likes.toLocaleString()} likes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 z-30 px-4 sm:px-5 py-3 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Close Player</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
