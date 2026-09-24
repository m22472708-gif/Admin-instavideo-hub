import React, { useState, useMemo } from 'react';
import { Video, Banner, GeneralSettings, ActiveTab, VIDEO_CATEGORIES } from '../../types';
import { VideoTestModal } from '../videos/VideoTestModal';
import {
  Film,
  Eye,
  Heart,
  Images,
  Send,
  Plus,
  Play,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  Clock,
  Radio,
  Tv,
  Flame,
  Award,
  BarChart3,
  Zap,
  ChevronRight,
  ChevronLeft,
  Share2,
  Compass,
  Star,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface OverviewStatsProps {
  videos: Video[];
  banners: Banner[];
  settings: GeneralSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddVideo: () => void;
  onOpenAddBanner: () => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  videos,
  banners,
  settings,
  setActiveTab,
  onOpenAddVideo,
  onOpenAddBanner,
}) => {
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState<Video | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const totalViews = videos.reduce((acc, v) => acc + (Number(v.views) || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (Number(v.likes) || 0), 0);
  const activeBanners = banners.filter((b) => b.active);
  const isAdUnlockEnabled = Boolean(settings.unlockAdEnabled);

  // Dynamic Category Stats
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    videos.forEach((v) => {
      const cat = v.category?.trim() || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      percent: videos.length > 0 ? Math.round((count / videos.length) * 100) : 0,
    }));
  }, [videos]);

  // Featured Spotlight video (highest views or marked featured)
  const spotlightVideo = useMemo(() => {
    return (
      videos.find((v) => v.featured) ||
      [...videos].sort((a, b) => (b.views || 0) - (a.views || 0))[0] ||
      null
    );
  }, [videos]);

  // Filtered Videos by Category
  const displayedVideos = useMemo(() => {
    let list = [...videos];
    if (selectedCategory !== 'all') {
      list = list.filter((v) => v.category === selectedCategory);
    }
    return list.sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [videos, selectedCategory]);

  const currentBanner = activeBanners[activeBannerIdx] || banners[0] || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 🎬 1. CINEMA HERO STAGE & FEATURED SPOTLIGHT                              */}
      {/* ========================================================================= */}
      {spotlightVideo ? (
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 dark:border-zinc-800 shadow-2xl text-white group">
          {/* Backdrop Film Art with Dark Cinema Gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src={spotlightVideo.thumbnailUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter blur-xs brightness-[0.35] scale-105 transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Movie Info */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  TOP SPOTLIGHT
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-200 text-xs font-semibold border border-white/10">
                  {spotlightVideo.category}
                </span>
                {spotlightVideo.releaseYear && (
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 font-mono text-xs font-bold border border-zinc-700">
                    {spotlightVideo.releaseYear}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase">
                  4K ULTRA HD
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                {spotlightVideo.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
                  <Eye className="w-4 h-4" />
                  {(spotlightVideo.views || 0).toLocaleString()} Views
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1.5 font-mono text-rose-400 font-bold">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  {(spotlightVideo.likes || 0).toLocaleString()} Likes
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1.5 font-mono text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  {spotlightVideo.duration || '00:00'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPreviewVideo(spotlightVideo)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black shadow-xl shadow-rose-950/60 hover:shadow-rose-600/40 transition-all transform hover:-translate-y-0.5 active:scale-95 tracking-wide"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>TEST STREAM PLAYBACK</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAddVideo}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 text-xs font-bold border border-zinc-700/80 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-rose-400" />
                  <span>Upload Stream</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-semibold border border-white/10 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Live Simulator</span>
                </button>
              </div>
            </div>

            {/* Right Poster Frame */}
            <div
              onClick={() => setSelectedPreviewVideo(spotlightVideo)}
              className="relative w-48 sm:w-56 h-64 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 cursor-pointer group/poster hidden md:block"
            >
              <img
                src={spotlightVideo.thumbnailUrl}
                alt={spotlightVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover/poster:bg-black/20 flex items-center justify-center transition-colors">
                <div className="p-4 rounded-full bg-rose-600/90 text-white shadow-xl group-hover/poster:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Catalog Hero */
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-8 text-white text-center">
          <Film className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-xl font-bold">Welcome to {settings.siteName || 'StreamPulse'} Control Room</h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
            Upload your first video stream to start managing catalog, hero sliders, and audience monetization.
          </p>
          <button
            type="button"
            onClick={onOpenAddVideo}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg"
          >
            <Plus className="w-4 h-4" /> Upload First Video
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 2. FOUR GLOWING STATS METRICS (HIGH-CONTRAST CARDS)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Video Catalog */}
        <div
          onClick={() => setActiveTab('videos')}
          className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Video Catalog
            </span>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {videos.length}
            </span>
            <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>{categoryStats.length} Genres Active</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {videos.filter((v) => v.featured).length} Featured
            </span>
          </div>
        </div>

        {/* Metric 2: Total Views */}
        <div className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-sky-500 dark:hover:border-sky-500 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all group overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Stream Views
            </span>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Avg {videos.length > 0 ? Math.round(totalViews / videos.length) : 0}/title</span>
            <span className="flex items-center gap-1 text-rose-500 font-bold font-mono">
              <Heart className="w-3 h-3 fill-rose-500" /> {totalLikes.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 3: Hero Billboards */}
        <div
          onClick={() => setActiveTab('banners')}
          className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Hero Billboards
            </span>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Images className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {activeBanners.length}
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 ml-1.5">
                / {banners.length} total
              </span>
            </span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Sliders <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Auto-cycling Carousel</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {banners.length - activeBanners.length} Inactive
            </span>
          </div>
        </div>

        {/* Metric 4: Ad Monetization Engine */}
        <div
          onClick={() => setActiveTab('adsterra')}
          className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Adsterra Ads & Monetization
            </span>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {(settings.adsterraAds || []).filter((a) => a.enabled).length}
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 ml-1.5">
                Active Units
              </span>
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Manage Ads <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Popunder (10x) & Social Bar</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Home + Video
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎬 3. CINEMA POSTER GALLERY & VIDEO CATALOG (VISUAL SHOWCASE)             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        {/* Section Header with Filters & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Cinema Catalog Streams</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Click any poster to test playback and verify the unlock ad wall in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-xs font-semibold overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({videos.length})
              </button>
              {categoryStats.slice(0, 4).map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-900 text-rose-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-900 text-rose-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Catalog Content */}
        {displayedVideos.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-zinc-950/50 border border-dashed border-slate-200 dark:border-zinc-800">
            <Film className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              No videos found in this category
            </p>
            <button
              type="button"
              onClick={onOpenAddVideo}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload Stream
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Netflix-Style Poster Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {displayedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedPreviewVideo(video)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-zinc-800/80 hover:border-rose-500 dark:hover:border-rose-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Poster Artwork with 16:9 or 2:3 aspect */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Badges on Poster */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {video.featured && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase shadow-xs">
                        FEATURED
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[9px] font-bold">
                      {video.category}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white font-bold">
                    {video.duration || '00:00'}
                  </div>

                  {/* Play Overlay Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="p-3.5 rounded-full bg-rose-600 text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="p-3 bg-white dark:bg-zinc-900 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={video.title}>
                    {video.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-sky-500">
                      <Eye className="w-3 h-3" />
                      {(video.views || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-rose-500">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      {(video.likes || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Sleek List View */
          <div className="space-y-3">
            {displayedVideos.map((video, idx) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 hover:border-rose-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="font-mono text-xs font-black text-slate-400 dark:text-zinc-600 w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  <div
                    onClick={() => setSelectedPreviewVideo(video)}
                    className="relative w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 cursor-pointer group/thumb shadow-xs"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        {video.category}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{video.duration || '00:00'}</span>
                      {video.releaseYear && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{video.releaseYear}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono tabular-nums text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      <span>{(video.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-rose-500 font-bold flex items-center justify-end gap-1 mt-0.5">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      <span>{(video.likes || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPreviewVideo(video)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-zinc-400">
            Showing {displayedVideos.length} of {videos.length} videos in catalog
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Open Full Video Manager</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Test Modal Preview */}
      {selectedPreviewVideo && (
        <VideoTestModal
          video={selectedPreviewVideo}
          settings={settings}
          isAdminPreview={true}
          onClose={() => setSelectedPreviewVideo(null)}
        />
      )}
    </div>
  );
};
