import React from 'react';
import { Video, Banner, GeneralSettings, ActiveTab, VIDEO_CATEGORIES } from '../../types';
import {
  Film,
  Eye,
  Heart,
  Images,
  Send,
  Plus,
  Play,
  TrendingUp,
  Database,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
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
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const activeBanners = banners.filter((b) => b.active);

  // Top 5 videos by views
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  // Category counts
  const categoryCounts = VIDEO_CATEGORIES.map((cat) => ({
    name: cat,
    count: videos.filter((v) => v.category === cat).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin Session · {settings.siteName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            StreamPulse Cinema Command Center
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            Manage your video streaming catalog, hero billboards, and automatic Telegram viewer engagement. All updates sync instantly with the streaming frontend and Firestore storage.
          </p>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <button
              type="button"
              onClick={onOpenAddVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/50 transition-all"
            >
              <Plus className="w-4 h-4" /> Upload New Video
            </button>
            <button
              type="button"
              onClick={onOpenAddBanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-zinc-700"
            >
              <Images className="w-4 h-4" /> Add Hero Slide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider transition-colors border border-amber-500/30"
            >
              <Eye className="w-4 h-4" /> View Live Simulator
            </button>
          </div>
        </div>

        {/* Cinematic Backdrop Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-600/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Videos Card */}
        <div
          onClick={() => setActiveTab('videos')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-rose-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Total Stream Videos
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {videos.length}
            </span>
            <span className="text-xs text-rose-500 flex items-center font-medium group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
            Across {categoryCounts.length} active genres
          </p>
        </div>

        {/* Total Views Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Platform Views
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
            Average {(totalViews / Math.max(1, videos.length)).toFixed(0)} per stream
          </p>
        </div>

        {/* Hero Banners Card */}
        <div
          onClick={() => setActiveTab('banners')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-rose-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Hero Banner Slides
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Images className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeBanners.length}
              <span className="text-sm font-normal text-zinc-500"> / {banners.length}</span>
            </span>
            <span className="text-xs text-amber-500 flex items-center font-medium group-hover:translate-x-0.5 transition-transform">
              Sliders <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
            {activeBanners.length} billboard slides active on site
          </p>
        </div>

        {/* Telegram Modal Status Card */}
        <div
          onClick={() => setActiveTab('telegram')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              4s Glass Modal
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-lg font-bold ${
                settings.telegramPopupEnabled ? 'text-emerald-500' : 'text-zinc-500'
              }`}
            >
              {settings.telegramPopupEnabled ? 'ACTIVE (4s)' : 'DISABLED'}
            </span>
            <span className="text-xs text-sky-500 flex items-center font-medium group-hover:translate-x-0.5 transition-transform">
              Config <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1 truncate">
            {settings.telegramChannelUrl}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Top Streams & Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Streams by Engagement */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Top Performing Catalog Streams
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ranked by viewer counts and audience interaction.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className="text-xs font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1"
            >
              View Full Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topVideos.map((video, idx) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-600 w-4">
                    #{idx + 1}
                  </span>
                  <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 bg-black">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{video.category}</span>
                      <span>·</span>
                      <span className="font-mono">{video.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                    <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    {video.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-rose-500 hidden sm:flex">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                    {video.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre / Category Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Genre Catalog Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            Catalog distribution across platform categories.
          </p>

          <div className="space-y-2.5">
            {categoryCounts.map((cat) => {
              const percentage = Math.round((cat.count / Math.max(1, videos.length)) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">{cat.name}</span>
                    <span className="font-mono text-slate-500 dark:text-zinc-400">
                      {cat.count} streams ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> All items synchronized
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="text-rose-500 hover:underline"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
