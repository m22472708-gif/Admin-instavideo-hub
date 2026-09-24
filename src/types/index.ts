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
}

export type ActiveTab = 'overview' | 'videos' | 'banners' | 'telegram' | 'simulator' | 'settings';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}
