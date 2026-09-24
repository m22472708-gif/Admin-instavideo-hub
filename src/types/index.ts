export type VideoCategory = string;

export const DEFAULT_CATEGORIES: string[] = [];

export const VIDEO_CATEGORIES: string[] = DEFAULT_CATEGORIES;

export interface Video {
  id: string;
  title: string;
  duration: string; // e.g., "18:45" or "2:10:00"
  category: VideoCategory;
  thumbnailUrl: string;
  directLink: string;
  views: number;
  likes: number;
  description: string;
  createdAt: number;
  featured?: boolean;
  releaseYear?: number | string;
}

export type BannerBadge = 'Trending' | 'Featured' | 'New Release';

export const BANNER_BADGES: BannerBadge[] = ['Trending', 'Featured', 'New Release'];

// Picture-only banner model for StreamPulse Video Platform
export interface Banner {
  id: string;
  imageUrl: string;
  targetLink?: string; // Optional direct redirect when viewer taps banner
  active: boolean; // Active toggle on/off
  createdAt?: number;
  // Optional legacy fields for backwards compatibility
  title?: string;
  subtitle?: string;
  badge?: string;
}

// ============================================================================
// 💰 ADSTERRA ADVERTISING CONFIGURATION
// ============================================================================
export type AdsterraAdType = 'popunder' | 'socialbar' | 'native_banner' | 'direct_link' | 'custom_script';
export type AdsterraPlacement = 'homepage' | 'video_page' | 'both';

export interface AdsterraAdConfig {
  id: string;
  name: string; // e.g., "Adsterra Popunder 5x Multiplier"
  type: AdsterraAdType; // 'popunder' | 'socialbar' | 'native_banner' | 'direct_link' | 'custom_script'
  scriptCode: string; // The script tag or direct link/code provided by Adsterra
  placement: AdsterraPlacement; // 'homepage' | 'video_page' | 'both'
  maxTriggers: number; // Script multiplier / instance count (e.g. 5x script instances injected in parallel)
  multiplier?: number; // 5x instances
  continuous?: boolean; // Always true: Never turns off, continues running perpetually
  enabled: boolean;
  notes?: string;
  createdAt: number;
}

export interface GeneralSettings {
  telegramChannelUrl: string;
  telegramPopupTitle: string;
  telegramPopupDescription: string;
  telegramPopupDelaySec: number;
  telegramPopupEnabled: boolean;
  siteName: string;
  logoUrl?: string;
  tagline?: string;
  adminPin: string;
  // Video Unlock & Ad Wall Settings
  unlockAdEnabled: boolean;
  unlockAdUrl: string;
  unlockAdRequiredClicks: number;
  unlockAdWaitSeconds: number;
  unlockAdButtonText?: string;
  // Adsterra Ads Engine
  adsterraAds?: AdsterraAdConfig[];
}

export type ActiveTab = 'overview' | 'videos' | 'banners' | 'adsterra' | 'telegram' | 'simulator' | 'settings';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}
