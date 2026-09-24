import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { FirebaseService } from './services/firebase';
import { ActiveTab, Video, Banner, GeneralSettings } from './types';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { PinAuthModal } from './components/auth/PinAuthModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { OverviewStats } from './components/overview/OverviewStats';
import { VideoManager } from './components/videos/VideoManager';
import { BannerManager } from './components/banners/BannerManager';
import { TelegramManager } from './components/telegram/TelegramManager';
import { LiveFrontendSimulator } from './components/simulator/LiveFrontendSimulator';
import { SystemSettings } from './components/settings/SystemSettings';
import { VideoFormModal } from './components/videos/VideoFormModal';
import { BannerFormModal } from './components/banners/BannerFormModal';

function DashboardContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    StorageService.isAuthenticated()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Collections state
  const [videos, setVideos] = useState<Video[]>(() => StorageService.getVideos());
  const [banners, setBanners] = useState<Banner[]>(() => StorageService.getBanners());
  const [settings, setSettings] = useState<GeneralSettings>(() => StorageService.getSettings());

  // Quick action modals from overview
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);

  const refreshData = useCallback(() => {
    setVideos(StorageService.getVideos());
    setBanners(StorageService.getBanners());
    setSettings(StorageService.getSettings());
  }, []);

  // Real-time direct synchronization with Firebase (Firestore + Realtime Database)
  useEffect(() => {
    // One-time cleanup for old demo category arrays
    try {
      const stored = localStorage.getItem('streampulse_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && (parsed.includes('Trailers') || parsed.includes('Anime') || parsed.includes('Movies'))) {
          localStorage.setItem('streampulse_categories', JSON.stringify([]));
        }
      }
    } catch {
      // ignore
    }

    // 1. Subscribe to 'videos' collection / path
    const unsubscribeVideos = FirebaseService.subscribeToVideos(
      (remoteVideos) => {
        setVideos(remoteVideos);
        try {
          localStorage.setItem('streampulse_videos', JSON.stringify(remoteVideos));
        } catch {
          // ignore
        }
      },
      (err) => {
        console.warn('Videos subscription notice:', err);
      }
    );

    // 2. Subscribe to 'banners' collection / path
    const unsubscribeBanners = FirebaseService.subscribeToBanners(
      (remoteBanners) => {
        setBanners(remoteBanners);
        try {
          localStorage.setItem('streampulse_banners', JSON.stringify(remoteBanners));
        } catch {
          // ignore
        }
      },
      (err) => {
        console.warn('Banners subscription notice:', err);
      }
    );

    // 3. Subscribe to 'settings' collection / path
    const unsubscribeSettings = FirebaseService.subscribeToSettings(
      (remoteSettings) => {
        if (remoteSettings) {
          setSettings(remoteSettings);
          try {
            localStorage.setItem('streampulse_settings', JSON.stringify(remoteSettings));
          } catch {
            // ignore
          }
        }
      },
      (err) => {
        console.warn('Settings subscription notice:', err);
      }
    );

    // 4. Subscribe to BroadcastChannel for instantaneous cross-tab events
    const unsubscribeSync = StorageService.subscribeToSync(() => {
      refreshData();
    });

    return () => {
      unsubscribeVideos();
      unsubscribeBanners();
      unsubscribeSettings();
      unsubscribeSync();
    };
  }, [refreshData]);

  // Synchronize browser tab title and favicon with current site name & logo URL
  useEffect(() => {
    const currentName = settings.siteName?.trim() || 'StreamPulse';
    document.title = `${currentName} — Admin Management Portal`;

    const faviconEl = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (faviconEl) {
      if (settings.logoUrl?.trim()) {
        faviconEl.href = settings.logoUrl.trim();
      } else {
        faviconEl.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>';
      }
    }
  }, [settings.siteName, settings.logoUrl]);

  const handleLockSession = () => {
    StorageService.setAuthenticated(false);
    setIsAuthenticated(false);
  };

  const handleDeleteVideoImmediate = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleDeleteBannerImmediate = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Admin PIN Lock Screen */}
      {!isAuthenticated && (
        <PinAuthModal onAuthenticated={() => setIsAuthenticated(true)} />
      )}

      {/* Main Admin Portal App */}
      <div className="flex h-screen overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          videos={videos}
          banners={banners}
          settings={settings}
          onLockSession={handleLockSession}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
          {/* Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onLockSession={handleLockSession}
          />

          {/* Scrollable Body */}
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-800">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'overview' && (
                <OverviewStats
                  videos={videos}
                  banners={banners}
                  settings={settings}
                  setActiveTab={setActiveTab}
                  onOpenAddVideo={() => setIsAddVideoOpen(true)}
                  onOpenAddBanner={() => setIsAddBannerOpen(true)}
                />
              )}

              {activeTab === 'videos' && (
                <VideoManager
                  videos={videos}
                  onRefresh={refreshData}
                  onDeleteSuccess={handleDeleteVideoImmediate}
                />
              )}

              {activeTab === 'banners' && (
                <BannerManager
                  banners={banners}
                  onRefresh={refreshData}
                  onDeleteSuccess={handleDeleteBannerImmediate}
                />
              )}

              {activeTab === 'telegram' && (
                <TelegramManager settings={settings} onRefresh={refreshData} />
              )}

              {activeTab === 'simulator' && (
                <LiveFrontendSimulator
                  videos={videos}
                  banners={banners}
                  settings={settings}
                  onBack={() => setActiveTab('overview')}
                />
              )}

              {activeTab === 'settings' && (
                <SystemSettings settings={settings} onRefresh={refreshData} />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoCount={videos.length}
        telegramEnabled={settings.telegramPopupEnabled}
      />

      {/* Quick Add Modals accessible from anywhere */}
      {isAddVideoOpen && (
        <VideoFormModal
          isOpen={isAddVideoOpen}
          onClose={() => setIsAddVideoOpen(false)}
          onSaved={() => {
            refreshData();
            setIsAddVideoOpen(false);
          }}
        />
      )}

      {isAddBannerOpen && (
        <BannerFormModal
          isOpen={isAddBannerOpen}
          onClose={() => setIsAddBannerOpen(false)}
          onSaved={() => {
            refreshData();
            setIsAddBannerOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
