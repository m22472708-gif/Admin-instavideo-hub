import React, { useState, useEffect, useMemo } from 'react';
import { Video, Banner, GeneralSettings } from '../../types';
import { StorageService } from '../../services/storage';
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
} from 'lucide-react';
import { VideoTestModal } from '../videos/VideoTestModal';

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

  // Video playback in simulator
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const activeBanners = banners.filter((b) => b.active);

  const allCategories = useMemo(() => {
    return StorageService.getCategories();
  }, [videos]);

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
            title="Restart the 4-second Telegram popup delay timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Timer</span>
          </button>
        </div>
      </div>

      {/* Simulator Device Frame Container */}
      <div className="flex justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-black/60 rounded-3xl border border-slate-800/80 dark:border-zinc-800 min-h-[750px]">
        <div
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
                  className="w-full pl-7 pr-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none"
                />
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
              </div>
            </nav>

            {/* Hero Banner Section (Picture-Only: No Title, No Subtitle, No Buttons) */}
            {heroBanner && (
              <div className="relative aspect-[16/8] sm:aspect-[21/8] w-full bg-black overflow-hidden group">
                <img
                  src={heroBanner.imageUrl}
                  alt="Picture banner"
                  className="w-full h-full object-cover select-none"
                />
                {/* Click target if targetLink exists */}
                {heroBanner.targetLink && (
                  <a
                    href={heroBanner.targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0"
                    title="Click banner to open stream"
                  />
                )}
                {/* Subtle slide indicator dots */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-black/50 backdrop-blur-sm z-10 pointer-events-none">
                    {activeBanners.map((_, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full transition-all ${
                          idx === activeSlide ? 'w-4 h-1.5 bg-rose-500' : 'w-1.5 h-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Categories Navigation */}
            <div className="px-4 py-3 border-b border-zinc-900 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'All' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                All
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Video Streams Grid */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {selectedCategory === 'All' ? 'All Featured Streams' : `${selectedCategory} Streams`}
                </span>
                <span>{filteredVideos.length} Available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setPlayingVideo(vid)}
                    className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/60 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {/* Corner Time Badge */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono font-bold text-white">
                        {vid.duration}
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-rose-500 fill-rose-500" />
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-rose-400">
                        {vid.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{vid.category}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" />
                          {(vid.views / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIMULATED 4-SECOND GLASS TELEGRAM MODAL IN VIEWER */}
            {isTelegramModalVisible && settings.telegramPopupEnabled && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-sm rounded-2xl p-6 border border-sky-500/40 bg-zinc-950/95 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => setIsTelegramModalVisible(false)}
                    className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-sky-500/40 ring-4 ring-sky-500/20 mb-3">
                    <Send className="w-7 h-7 -rotate-12 translate-x-0.5" />
                  </div>

                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    {settings.siteName} Alert
                  </span>

                  <h3 className="text-sm font-bold text-white mt-1">
                    {settings.telegramPopupTitle}
                  </h3>

                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    {settings.telegramPopupDescription}
                  </p>

                  <div className="mt-4 space-y-2">
                    <a
                      href={settings.telegramChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs hover:from-sky-400 hover:to-blue-500 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5 -rotate-12" />
                      Join Telegram Channel
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsTelegramModalVisible(false)}
                      className="text-[11px] text-zinc-400 hover:text-white block w-full py-1"
                    >
                      Dismiss & Continue Watching
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Stream Test Modal if opened inside simulator */}
      {playingVideo && (
        <VideoTestModal video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}
    </div>
  );
};
