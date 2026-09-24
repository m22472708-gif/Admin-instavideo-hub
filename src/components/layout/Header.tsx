import React, { useState } from 'react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { FirebaseConnectionModal } from '../common/FirebaseConnectionModal';
import {
  Menu,
  Moon,
  Sun,
  Eye,
  Lock,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  onLockSession: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'Cinema analytics, database health, and activity metrics.',
  },
  videos: {
    title: 'Video Catalog Manager',
    subtitle: 'Upload, modify, filter categories, and verify stream links.',
  },
  banners: {
    title: 'Hero Banner Slider Manager',
    subtitle: 'Frontpage promotional billboard slides, toggles, and backdrops.',
  },
  adsterra: {
    title: 'Adsterra Advertising Engine',
    subtitle: 'Manage Popunder, Social Bar, and custom ad scripts with trigger counts and target placements.',
  },
  telegram: {
    title: 'Telegram & Glass Modal Control',
    subtitle: 'Configure channel link, 4-second delay, copy, and test live preview.',
  },
  simulator: {
    title: 'Frontend Viewer Simulator',
    subtitle: 'Simulate live viewer experience to verify real-time sync.',
  },
  settings: {
    title: 'System & Database Sync',
    subtitle: 'Admin PIN security, Firestore schema blueprint, and JSON backups.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onLockSession,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const currentTabInfo = TAB_TITLES[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-18 px-3 sm:px-6 md:px-8 border-b transition-colors duration-200 bg-white/90 dark:bg-zinc-950/90 border-slate-200 dark:border-zinc-800/80 backdrop-blur-md">
        {/* Left: Mobile trigger / Back button & Page Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dynamic Back to Overview Button when inside any subpage */}
          {activeTab !== 'overview' && (
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0"
              title="Go back to Overview Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Back</span>
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-zinc-400 truncate max-w-xl">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Simulator Shortcut Button */}
          {activeTab !== 'simulator' && (
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Viewer Preview</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-slate-200 dark:border-zinc-800/80 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Lock Admin Session Button */}
          <button
            type="button"
            onClick={onLockSession}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-slate-200 dark:border-zinc-800/80 transition-colors"
            title="Lock Admin Session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Firebase Diagnostic & Rules Fix Modal */}
      <FirebaseConnectionModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </>
  );
};
