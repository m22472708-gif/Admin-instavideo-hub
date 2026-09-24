import { Video, Banner, GeneralSettings, VideoCategory, DEFAULT_CATEGORIES } from '../types';
import { FALLBACK_BANNER_IMAGE_SVG } from '../utils/bannerAssets';

const STORAGE_KEYS = {
  VIDEOS: 'streampulse_videos',
  BANNERS: 'streampulse_banners',
  SETTINGS: 'streampulse_settings',
  CATEGORIES: 'streampulse_categories',
  AUTH_SESSION: 'streampulse_auth_session',
  THEME: 'streampulse_theme',
};

const DEFAULT_SETTINGS: GeneralSettings = {
  telegramChannelUrl: 'https://t.me/streampulse_official',
  telegramPopupTitle: 'Join StreamPulse VIP Telegram',
  telegramPopupDescription: 'Get instant notifications for new 4K episodes, direct download mirrors, and exclusive community movie polls!',
  telegramPopupDelaySec: 4,
  telegramPopupEnabled: true,
  siteName: 'StreamPulse',
  logoUrl: '',
  tagline: 'Premium Cinema & Web Series Hub',
  adminPin: '1234',
  unlockAdEnabled: true,
  unlockAdUrl: 'https://example.com/ads',
  unlockAdRequiredClicks: 3,
  unlockAdWaitSeconds: 10,
  unlockAdButtonText: 'Unlock Video (Watch Ads to Play)',
};

const SEED_BANNERS: Banner[] = [];

const SEED_VIDEOS: Video[] = [];

// Broadcast channel for instantaneous cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('streampulse_admin_sync');
  }
} catch {
  // Graceful fallback if not supported
}

function notifySync(type: 'videos' | 'banners' | 'settings' | 'all') {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, timestamp: Date.now() });
    } catch {
      // ignore error
    }
  }
}

export const StorageService = {
  // Listeners
  subscribeToSync(callback: (type: string) => void): () => void {
    if (!broadcastChannel) return () => {};
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        callback(e.data.type);
      }
    };
    broadcastChannel.addEventListener('message', handler);
    return () => {
      broadcastChannel?.removeEventListener('message', handler);
    };
  },

  // Videos
  getVideos(): Video[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load videos from storage', e);
      return [];
    }
  },

  saveVideo(video: Omit<Video, 'id' | 'createdAt'> & { id?: string }): Video {
    const videos = this.getVideos();
    let savedVideo: Video;

    if (video.id) {
      // Update
      const index = videos.findIndex((v) => v.id === video.id);
      if (index >= 0) {
        savedVideo = {
          ...videos[index],
          ...video,
          id: video.id,
        };
        videos[index] = savedVideo;
      } else {
        savedVideo = {
          ...video,
          id: video.id,
          createdAt: Date.now(),
        };
        videos.unshift(savedVideo);
      }
    } else {
      // Create new
      savedVideo = {
        ...video,
        id: `v-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      videos.unshift(savedVideo);
    }

    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    notifySync('videos');
    return savedVideo;
  },

  deleteVideo(id: string): boolean {
    const videos = this.getVideos();
    const filtered = videos.filter((v) => v.id !== id);
    if (filtered.length !== videos.length) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filtered));
      notifySync('videos');
      return true;
    }
    return false;
  },

  // Banners
  getBanners(): Banner[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((b) => ({
          ...b,
          imageUrl: b.imageUrl?.trim() || '',
        }));
      }
      return [];
    } catch (e) {
      console.error('Failed to load banners from storage', e);
      return [];
    }
  },

  saveBanner(banner: Omit<Banner, 'id'> & { id?: string }): Banner {
    const banners = this.getBanners();
    let savedBanner: Banner;

    if (banner.id) {
      const index = banners.findIndex((b) => b.id === banner.id);
      if (index >= 0) {
        savedBanner = {
          ...banners[index],
          ...banner,
          id: banner.id,
        };
        banners[index] = savedBanner;
      } else {
        savedBanner = {
          ...banner,
          id: banner.id,
        };
        banners.unshift(savedBanner);
      }
    } else {
      savedBanner = {
        ...banner,
        id: `b-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      };
      banners.unshift(savedBanner);
    }

    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    notifySync('banners');
    return savedBanner;
  },

  toggleBannerActive(id: string): Banner | null {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === id);
    if (index >= 0) {
      banners[index].active = !banners[index].active;
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
      notifySync('banners');
      return banners[index];
    }
    return null;
  },

  deleteBanner(id: string): boolean {
    const banners = this.getBanners();
    const filtered = banners.filter((b) => b.id !== id);
    if (filtered.length !== banners.length) {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(filtered));
      notifySync('banners');
      return true;
    }
    return false;
  },

  saveBanners(banners: Banner[]): Banner[] {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    notifySync('banners');
    return banners;
  },

  // Settings
  getSettings(): GeneralSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(stored),
      };
    } catch (e) {
      console.error('Failed to load settings from storage', e);
      return DEFAULT_SETTINGS;
    }
  },

  // Categories
  getCategories(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveCategories(categories: string[]): string[] {
    const unique = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(unique));
    notifySync('settings');
    return unique;
  },

  addCategory(category: string): string[] {
    const trimmed = category.trim();
    if (!trimmed) return this.getCategories();
    const current = this.getCategories();
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return current;
    const updated = [...current, trimmed];
    return this.saveCategories(updated);
  },

  deleteCategory(category: string): string[] {
    const current = this.getCategories();
    const updated = current.filter((c) => c.toLowerCase() !== category.trim().toLowerCase());
    return this.saveCategories(updated);
  },

  updateCategory(oldName: string, newName: string): string[] {
    const trimmedOld = oldName.trim().toLowerCase();
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedOld === trimmedNew.toLowerCase()) return this.getCategories();

    const current = this.getCategories();
    const updated = current.map((c) => (c.toLowerCase() === trimmedOld ? trimmedNew : c));

    // Also update all stored videos that had the old category
    const videos = this.getVideos();
    let hasVideoUpdates = false;
    const updatedVideos = videos.map((v) => {
      if (v.category && v.category.toLowerCase() === trimmedOld) {
        hasVideoUpdates = true;
        return { ...v, category: trimmedNew };
      }
      return v;
    });

    if (hasVideoUpdates) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updatedVideos));
      notifySync('videos');
    }

    return this.saveCategories(updated);
  },

  saveSettings(newSettings: Partial<GeneralSettings>): GeneralSettings {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...newSettings,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifySync('settings');
    return updated;
  },

  // Auth Session
  isAuthenticated(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
    } catch {
      return false;
    }
  },

  setAuthenticated(value: boolean) {
    try {
      if (value) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
    } catch {
      // ignore
    }
  },

  // Theme
  getStoredTheme(): 'dark' | 'light' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore
    }
    return 'dark'; // cinematic dark theme default
  },

  setStoredTheme(theme: 'dark' | 'light') {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  },

  // Export / Import
  exportAllData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      collections: {
        videos: this.getVideos(),
        banners: this.getBanners(),
        settings: this.getSettings(),
      },
    };
  },

  importData(jsonContent: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (data && data.collections) {
        if (Array.isArray(data.collections.videos)) {
          localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(data.collections.videos));
        }
        if (Array.isArray(data.collections.banners)) {
          localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(data.collections.banners));
        }
        if (data.collections.settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.collections.settings));
        }
        notifySync('all');
        return { success: true };
      }
      return { success: false, error: 'Invalid file format: missing collections property' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'JSON parse error' };
    }
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(SEED_VIDEOS));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(SEED_BANNERS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    notifySync('all');
  },

  wipeAllFresh() {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    notifySync('all');
  },
};
