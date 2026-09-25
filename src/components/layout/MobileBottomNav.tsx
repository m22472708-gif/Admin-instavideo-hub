import React from 'react';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Film,
  Images,
  Send,
  MonitorPlay,
  Settings,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  videoCount: number;
  telegramEnabled: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  videoCount,
  telegramEnabled,
}) => {
  const items = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'videos' as ActiveTab, label: 'Videos', icon: Film, count: videoCount },
    { id: 'banners' as ActiveTab, label: 'Banners', icon: Images },
    { id: 'telegram' as ActiveTab, label: 'Telegram', icon: Send, dot: telegramEnabled },
    { id: 'simulator' as ActiveTab, label: 'Simulator', icon: MonitorPlay },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-slate-200 dark:border-zinc-800 backdrop-blur-lg shadow-lg safe-area-bottom">
      <div className="grid grid-cols-6 h-15 items-center px-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-600 text-[8px] font-mono text-white rounded-full leading-tight">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
                {item.dot && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-sky-500 ring-1 ring-zinc-950" />
                )}
              </div>
              <span className="text-[9px] tracking-tight mt-0.5 truncate max-w-[46px]">
                {item.label}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
