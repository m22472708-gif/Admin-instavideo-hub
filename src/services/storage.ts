import { Video, Banner, GeneralSettings, VideoCategory, DEFAULT_CATEGORIES } from '../types';

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
};

const SEED_BANNERS: Banner[] = [
  {
    id: 'b-1',
    title: 'Cyber Tokyo 2099: Neon Horizon',
    subtitle: 'Season 2 Premiere — In a neon-drenched metropolis, rogue synthetics fight for forbidden memories.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    badge: 'Trending',
    active: true,
    targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    id: 'b-2',
    title: 'Shadow Strike: Crimson Protocol',
    subtitle: 'The ultimate blockbuster espionage thriller. Stream exclusively in 4K HDR Dolby Atmos.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    badge: 'New Release',
    active: true,
    targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'b-3',
    title: 'Nadir Pare (Across the River)',
    subtitle: 'Critically acclaimed Bengali dramatic masterpiece capturing timeless coastal village tales.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    badge: 'Featured',
    active: true,
    targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    id: 'b-4',
    title: 'Echoes of the Cosmos: Interstellar Odysseys',
    subtitle: 'An awe-inspiring deep space docuseries exploring the event horizons of supermassive black holes.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    badge: 'Featured',
    active: false,
    targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

const SEED_VIDEOS: Video[] = [
  {
    id: 'v-101',
    title: 'Shadow Strike: Crimson Protocol',
    duration: '2:14:30',
    category: 'Action',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 184500,
    likes: 12840,
    description: 'An elite black-ops operative goes rogue after discovering that a cybernetic conspiracy threatens to destabilize global energy grids.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'v-102',
    title: 'Cyber Tokyo 2099 — Episode 1: Digital Ghosts',
    duration: '52:18',
    category: 'Web Series',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    views: 249120,
    likes: 19430,
    description: 'In the lower districts of neo-Shinjuku, detective Ren uncovers illegal neural implants trading classified memories of the elite.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'v-103',
    title: 'Nadir Pare (Across the River)',
    duration: '1:58:12',
    category: 'Bangla',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    views: 92300,
    likes: 8140,
    description: 'A poetic Bengali drama exploring generational estrangement, river erosion, and rediscovering roots in the Padma basin.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'v-104',
    title: 'The Silent Alibi',
    duration: '1:44:05',
    category: 'Thriller',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 114800,
    likes: 9210,
    description: 'A locked-room homicide trial turns into psychological warfare when the defense attorney suspects his own client is framing him.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'v-105',
    title: 'Neon Horizon: Awakening',
    duration: '24:15',
    category: 'Anime',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: 312400,
    likes: 27800,
    description: 'When ancient mechanized titans awaken from beneath the Mariana Trench, an academy pilot is chosen to interface with unit Zero.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'v-106',
    title: 'Roommates from Hell',
    duration: '1:32:40',
    category: 'Comedy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    views: 78900,
    likes: 6420,
    description: 'Three wildly mismatched college graduates accidentally sign the same sub-lease for an upscale penthouse with chaotic consequences.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'v-107',
    title: 'Dune Reckoning Part II: Official 4K Trailer',
    duration: '03:15',
    category: 'Trailers',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    views: 541000,
    likes: 42900,
    description: 'Exclusive worldwide teaser trailer for the sci-fi epic. In theaters and streaming on StreamPulse this winter.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: 'v-108',
    title: 'The Autumn Letters',
    duration: '2:01:25',
    category: 'Drama',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    views: 65400,
    likes: 5120,
    description: 'Decades after the war, an archivist finds a hidden drawer of undelivered letters that connect two estranged families across continents.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: 'v-109',
    title: 'Dhaka Underworld: Syndicate',
    duration: '2:18:50',
    category: 'Bangla',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 198000,
    likes: 16750,
    description: 'High-octane Bangladeshi crime thriller revolving around an undercover detective infiltrating Old Dhaka port syndicates.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
];

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
      return Array.isArray(parsed) ? parsed : [];
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
