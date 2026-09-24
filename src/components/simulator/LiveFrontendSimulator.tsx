import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Video, Banner, GeneralSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { AdsterraInjector } from '../../utils/adsterraInjector';
import {
  MonitorPlay,
  Smartphone,
  Tablet,
  Laptop,
  Play,
  RotateCcw,
  Send,
  X,
  Search,
  Clock,
  Eye,
  Heart,
  ExternalLink,
  Sparkles,
  Info,
  ArrowLeft,
  Zap,
  TrendingUp,
  DollarSign,
  Radio,
  Layers,
} from 'lucide-react';
import { VideoTestModal } from '../videos/VideoTestModal';
import { FALLBACK_BANNER_IMAGE_SVG, getProxyImageUrl } from '../../utils/bannerAssets';
import { AdsterraBannerSlot } from '../adsterra/AdsterraBannerSlot';

interface LiveFrontendSimulatorProps {
  videos: Video[];
  banners: Banner[];
  settings: GeneralSettings;
  onBack?: () => void;
}

export const LiveFrontendSimulator: React.FC<LiveFrontendSimulatorProps> = ({
  videos,
  banners,
  settings,
  onBack,
}) => {
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  // Telegram modal state in viewer simulation
  const [isTelegramModalVisible, setIsTelegramModalVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(settings.telegramPopupDelaySec || 4);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Adsterra state & trigger counters in simulator
  const [triggerUpdateNonce, setTriggerUpdateNonce] = useState(0);
  const [socialBarDismissed, setSocialBarDismissed] = useState(false);

  // Video playback in simulator
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const activeBanners = banners.filter((b) => b.active);

  const allCategories = useMemo(() => {
    return StorageService.getCategories();
  }, [videos]);

  const activeHomepageAds = useMemo(() => {
    return AdsterraInjector.getActiveAdsForPlacement(settings.adsterraAds, 'homepage');
  }, [settings.adsterraAds, triggerUpdateNonce]);

  const popunderAds = activeHomepageAds.filter((a) => a.type === 'popunder' || a.type === 'direct_link');
  const socialBarAds = activeHomepageAds.filter((a) => a.type === 'socialbar');
  const bannerAds = activeHomepageAds.filter((a) => a.type === 'native_banner');

  // Inject real scripts if on web
  useEffect(() => {
    if (settings.adsterraAds && settings.adsterraAds.length > 0) {
      AdsterraInjector.injectAdWidgets(settings.adsterraAds, 'homepage');
    }
  }, [settings.adsterraAds]);

  // Run the countdown timer based on admin configured delay
  useEffect(() => {
    if (!settings.telegramPopupEnabled) {
      setIsTelegramModalVisible(false);
      return;
    }

    setSecondsRemaining(settings.telegramPopupDelaySec || 4);
    setIsTimerRunning(true);
    setIsTelegramModalVisible(false);

    let currentSeconds = settings.telegramPopupDelaySec || 4;
    const timer = setInterval(() => {
      currentSeconds -= 1;
      setSecondsRemaining(currentSeconds);

      if (currentSeconds <= 0) {
        clearInterval(timer);
        setIsTimerRunning(false);
        setIsTelegramModalVisible(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.telegramPopupDelaySec, settings.telegramPopupEnabled]);

  const restartSimulation = () => {
    setIsTelegramModalVisible(false);
    setIsTimerRunning(true);
    setSecondsRemaining(settings.telegramPopupDelaySec || 4);
    setSocialBarDismissed(false);
    AdsterraInjector.resetSessionTriggers();
    setTriggerUpdateNonce((n) => n + 1);

    let currentSeconds = settings.telegramPopupDelaySec || 4;
    const timer = setInterval(() => {
      currentSeconds -= 1;
      setSecondsRemaining(currentSeconds);

      if (currentSeconds <= 0) {
        clearInterval(timer);
        setIsTimerRunning(false);
        setIsTelegramModalVisible(true);
      }
    }, 1000);
  };

  // Intercept click inside simulated viewport to execute popunders continuously with multi-script power
  const handleSimulatorInteraction = () => {
    popunderAds.forEach((ad) => {
      AdsterraInjector.triggerPopunder(ad);
      setTriggerUpdateNonce((n) => n + 1);
    });
  };

  const filteredVideos = videos.filter((v) => {
    const matchesCategory =
      selectedCategory === 'All' || v.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const heroBanner = activeBanners[activeSlide] || activeBanners[0];

  return (
    <div className="space-y-4">
      {/* Top Device & Simulation Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0"
              title="Return to Admin Overview"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hidden sm:block">
            <MonitorPlay className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Viewer Frontend Sandbox
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live Sync
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Verify how your updates instantly appear to live viewers.
            </p>
          </div>
        </div>

        {/* Viewport Selectors & Reset Timer */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setDeviceViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                deviceViewport === 'desktop'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-500'
              }`}
              title="Desktop View (100%)"
            >
              <Laptop className="w-4 h-4" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                deviceViewport === 'tablet'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-500'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                deviceViewport === 'mobile'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-500'
              }`}
              title="Mobile View (420px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={restartSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            title="Restart simulation timers and reset 10x trigger limits"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Triggers & Timer</span>
          </button>
        </div>
      </div>

      {/* 🎯 ADSTERRA STATUS HUD (SHOWING CONTINUOUS MULTI-SCRIPT MODE) */}
      {activeHomepageAds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-slate-900 dark:text-white">
              Adsterra Active (Continuous Mode):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {activeHomepageAds.map((ad) => {
                const count = AdsterraInjector.getTriggerCount(ad.id);
                const multiplier = ad.multiplier || ad.maxTriggers || 5;
                return (
                  <span
                    key={ad.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30"
                  >
                    <span>{ad.name}:</span>
                    <span>{multiplier}x Parallel (Fired: {count} times, Non-Stop)</span>
                  </span>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            ৫টি স্ক্রিপ্টের সমান সমান্তরাল পাওয়ারে অবিরাম কাজ করছে (কখনো বন্ধ হবে না)।
          </span>
        </div>
      )}

      {/* Simulator Device Frame Container */}
      <div className="flex justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-black/60 rounded-3xl border border-slate-800/80 dark:border-zinc-800 min-h-[750px]">
        <div
          onClick={handleSimulatorInteraction}
          className={`relative bg-zinc-950 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-300 flex flex-col ${
            deviceViewport === 'desktop'
              ? 'w-full max-w-5xl'
              : deviceViewport === 'tablet'
              ? 'w-full max-w-2xl'
              : 'w-full max-w-sm'
          }`}
        >
          {/* Simulated Browser Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-950 text-[11px] font-mono text-zinc-300 border border-zinc-800/80">
              <span>https://{settings.siteName.toLowerCase()}.stream</span>
            </div>
            <div className="text-[10px] text-zinc-500">
              {isTimerRunning ? `Modal in ${secondsRemaining}s` : 'Modal Active'}
            </div>
          </div>

          {/* SIMULATED CLIENT FRONTEND CONTENT */}
          <div className="flex-1 overflow-y-auto max-h-[650px] relative scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Frontpage Navigation */}
            <nav className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.siteName}
                    className="w-7 h-7 rounded-lg object-cover bg-zinc-900 border border-zinc-700 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-xs">
                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                )}
                <span className="font-extrabold tracking-tight text-white text-sm">
                  {settings.siteName || 'StreamPulse'}
                </span>
              </div>

              <div className="relative w-40 sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search streams..."
                  className="w-full pl-7 pr-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-hidden"
                />
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
              </div>
            </nav>

            {/* Hero Banner Section (Picture-Only: No Title, No Subtitle, No Buttons) */}
            {heroBanner && activeBanners.length > 0 && (
              <div className="relative aspect-[16/8] sm:aspect-[21/8] w-full bg-gradient-to-r from-rose-950/90 via-zinc-900 to-indigo-950/90 overflow-hidden group">
                <img
                  src={heroBanner.imageUrl}
                  alt="Picture banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const orig = heroBanner.imageUrl;
                    if (orig && !target.src.includes('wsrv.nl') && !orig.startsWith('data:') && target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                      target.src = getProxyImageUrl(orig);
                    } else if (target.src !== FALLBACK_BANNER_IMAGE_SVG) {
                      target.src = FALLBACK_BANNER_IMAGE_SVG;
                    }
                  }}
                />

                {/* Banner Click Redirection if set */}
                {heroBanner.targetLink && (
                  <a
                    href={heroBanner.targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label="Banner link"
                  />
                )}

                {/* Slider Dot Indicators */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-2.5 left-0 right-0 z-10 flex justify-center items-center gap-1.5 pointer-events-none">
                    {activeBanners.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlide(idx);
                        }}
                        className={`transition-all rounded-full pointer-events-auto ${
                          activeSlide === idx
                            ? 'w-6 h-1.5 bg-rose-500 shadow-sm'
                            : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Simulated Floating Social Bar Ad (if active and not dismissed) */}
            {socialBarAds.length > 0 && !socialBarDismissed && (
              <div className="sticky top-14 z-30 mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-zinc-900 via-rose-950/70 to-zinc-900 border border-rose-500/40 shadow-xl flex items-center justify-between gap-3 animate-bounce-short">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-md">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {socialBarAds[0].name || 'VIP Special Stream Notification'}
                    </p>
                    <p className="text-[10px] text-zinc-300 truncate">
                      Tap to unlock 4K Ultra HD exclusive movie mirrors!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      AdsterraInjector.triggerPopunder(socialBarAds[0]);
                      setTriggerUpdateNonce((n) => n + 1);
                    }}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md"
                  >
                    Watch Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSocialBarDismissed(true);
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Adsterra Sponsored Banner Ad Slot on Homepage */}
            {bannerAds.length > 0 && (
              <div className="px-4 pt-2">
                <AdsterraBannerSlot ad={bannerAds[0]} placementName="Homepage Banner Ad" />
              </div>
            )}

            {/* Category Filter Pills Bar */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  All ({videos.length})
                </button>
                {allCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory.toLowerCase() === category.toLowerCase()
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Videos Grid */}
            <div className="p-4 pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Streams Available ({filteredVideos.length})</span>
                </h4>
                <span className="text-[10px] text-zinc-500">Tap to watch video</span>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                  <p className="text-xs text-zinc-400">No videos match your criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setPlayingVideo(video)}
                      className="group cursor-pointer rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/60 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                          {video.duration || '00:00'}
                        </div>
                      </div>

                      <div className="p-2.5">
                        <h5 className="font-bold text-xs text-white truncate" title={video.title}>
                          {video.title}
                        </h5>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-sky-400" />
                            {(video.views || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                            {(video.likes || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIMULATED TELEGRAM GLASS POPUP MODAL (4-SECOND DELAY) */}
            {isTelegramModalVisible && settings.telegramPopupEnabled && (
              <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-sm bg-gradient-to-b from-zinc-900 to-zinc-950 border border-sky-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setIsTelegramModalVisible(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-lg">
                    <Send className="w-7 h-7 -translate-x-0.5 translate-y-0.5" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {settings.telegramPopupTitle || 'Join StreamPulse VIP Telegram'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      {settings.telegramPopupDescription ||
                        'Get instant notifications for new 4K episodes and direct mirrors!'}
                    </p>
                  </div>

                  <a
                    href={settings.telegramChannelUrl || 'https://t.me/streampulse_official'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Join Official Channel</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player & Test Modal Simulation */}
      {playingVideo && (
        <VideoTestModal
          video={playingVideo}
          settings={settings}
          isAdminPreview={false}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </div>
  );
};
