import React from 'react';
import { ActiveTab, Video, Banner, GeneralSettings } from '../../types';
import {
  Film,
  LayoutDashboard,
  Images,
  Send,
  MonitorPlay,
  Settings,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  videos: Video[];
  banners: Banner[];
  settings: GeneralSettings;
  onLockSession: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  videos,
  banners,
  settings,
  onLockSession,
}) => {
  const activeBannersCount = banners.filter((b) => b.active).length;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'videos' as ActiveTab,
      label: 'Video Manager',
      icon: Film,
      badge: `${videos.length}`,
    },
    {
      id: 'banners' as ActiveTab,
      label: 'Banner Slider',
      icon: Images,
      badge: `${activeBannersCount} active`,
    },
    {
      id: 'adsterra' as ActiveTab,
      label: 'Adsterra Ads',
      icon: TrendingUp,
      badge: `${(settings.adsterraAds || []).filter((a) => a.enabled).length} active`,
      badgeColor: (settings.adsterraAds || []).some((a) => a.enabled) ? 'text-amber-400 bg-amber-950/40' : 'text-zinc-400 bg-zinc-800',
    },
    {
      id: 'telegram' as ActiveTab,
      label: 'Telegram & Popup',
      icon: Send,
      badge: settings.telegramPopupEnabled ? 'ON' : 'OFF',
      badgeColor: settings.telegramPopupEnabled ? 'text-emerald-400 bg-emerald-950/40' : 'text-zinc-400 bg-zinc-800',
    },
    {
      id: 'simulator' as ActiveTab,
      label: 'Frontend Simulator',
      icon: MonitorPlay,
      badge: 'Live',
      badgeColor: 'text-amber-400 bg-amber-950/40',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Sync',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-zinc-950 text-slate-100 dark:text-zinc-100 border-r border-slate-800 dark:border-zinc-800/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-slate-800 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 min-w-0">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName || 'Logo'}
              className="w-10 h-10 rounded-xl object-cover bg-zinc-900 border border-zinc-700 shadow-md shrink-0"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-md shadow-rose-950/50 shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base truncate max-w-[130px]">
                {settings.siteName || 'StreamPulse'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate max-w-[160px]">
              {settings.tagline || 'Cinema Management'}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Close Navigation Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Core Management
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-rose-700/80 text-white'
                      : item.badgeColor || 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Summary & Security Card */}
      <div className="p-4 border-t border-slate-800 dark:border-zinc-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              Platform Audience
            </span>
            <span className="font-mono text-white font-semibold">
              {(totalViews / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{videos.length} videos online</span>
            <span>{banners.length} banners</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Master Admin Mode</span>
          </div>
          <button
            type="button"
            onClick={onLockSession}
            className="hover:text-rose-400 transition-colors"
          >
            Lock
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
