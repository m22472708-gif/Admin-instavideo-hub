import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  remove,
  update,
  onValue,
  get,
  Database,
} from 'firebase/database';
import { Video, Banner, GeneralSettings } from '../types';
import { StorageService } from './storage';
import { FALLBACK_BANNER_IMAGE_SVG } from '../utils/bannerAssets';

export const firebaseConfig = {
  apiKey: "AIzaSyD_zTfT_3SCTCMMtb2yROaKHREPfGdk57g",
  authDomain: "whatsapp-video-site.firebaseapp.com",
  databaseURL: "https://whatsapp-video-site-default-rtdb.firebaseio.com",
  projectId: "whatsapp-video-site",
  storageBucket: "whatsapp-video-site.firebasestorage.app",
  messagingSenderId: "2271699766",
  appId: "1:2271699766:web:8e6cbb131aeb023eab0997",
  measurementId: "G-8D731M93SH",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Initialize Realtime Database (RTDB) for 100% userpanel compatibility
let rtdbInstance: Database | null = null;
try {
  rtdbInstance = getDatabase(app);
} catch (e) {
  console.warn('Realtime Database init note:', e);
}
export const rtdb = rtdbInstance;

// Firestore collection & RTDB path references
export const COLLECTIONS = {
  VIDEOS: 'videos',
  BANNERS: 'banners',
  SETTINGS: 'settings',
};

export const SETTINGS_DOC_ID = 'general';

export const DEFAULT_SETTINGS: GeneralSettings = {
  telegramChannelUrl: 'https://t.me/streampulse_official',
  telegramPopupTitle: 'Join StreamPulse VIP Telegram',
  telegramPopupDescription: 'Get instant notifications for new 4K episodes, direct download mirrors, and exclusive community movie polls!',
  telegramPopupDelaySec: 4,
  telegramPopupEnabled: true,
  telegramProfilePicUrl: '',
  telegramCoverPicUrl: '',
  siteName: 'StreamPulse',
  adminPin: '1234',
  unlockAdEnabled: true,
  unlockAdUrl: 'https://example.com/ads',
  unlockAdRequiredClicks: 3,
  unlockAdWaitSeconds: 10,
  unlockAdButtonText: 'Unlock Video (Watch Ads to Play)',
};

// Universal Parser: converts any userpanel / database video format to standard Video
export function parseVideoData(id: string, data: any): Video {
  if (!data) {
    return {
      id,
      title: 'Untitled Video',
      duration: '00:00',
      category: 'Movies',
      thumbnailUrl: '',
      directLink: '',
      views: 0,
      likes: 0,
      description: '',
      createdAt: Date.now(),
    };
  }
  return {
    id: id || data.id,
    title: data.title || data.name || 'Untitled Video',
    duration: data.duration || '00:00',
    category: data.category || 'Movies',
    thumbnailUrl:
      data.thumbnailUrl ||
      data.thumbnail ||
      data.image ||
      data.poster ||
      data.cover ||
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    directLink:
      data.directLink ||
      data.videoUrl ||
      data.streamUrl ||
      data.streamLink ||
      data.url ||
      data.link ||
      '',
    views: typeof data.views === 'number' ? data.views : 0,
    likes: typeof data.likes === 'number' ? data.likes : 0,
    description: data.description || '',
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  };
}

// Universal Parser: converts any picture banner format to standard Banner
export function parseBannerData(id: string, data: any): Banner {
  if (!data) {
    return {
      id,
      imageUrl: '',
      targetLink: '',
      active: true,
      createdAt: Date.now(),
    };
  }
  const isActive =
    typeof data.active === 'boolean'
      ? data.active
      : typeof data.enabled === 'boolean'
      ? data.enabled
      : data.status === 'active' || data.status === undefined;

  const rawUrl =
    data.imageUrl ||
    data.image ||
    data.bannerUrl ||
    data.bannerImage ||
    data.url ||
    '';

  return {
    id: id || data.id,
    imageUrl: rawUrl.trim(),
    targetLink:
      data.targetLink ||
      data.link ||
      data.targetUrl ||
      data.redirectUrl ||
      data.videoUrl ||
      '',
    active: Boolean(isActive),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    title: data.title || '',
    subtitle: data.subtitle || '',
  };
}

// Universal Parser: settings
export function parseSettingsData(data: any): GeneralSettings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    telegramChannelUrl:
      data.telegramChannelUrl ||
      data.telegramUrl ||
      data.telegramLink ||
      data.telegram ||
      data.channelUrl ||
      DEFAULT_SETTINGS.telegramChannelUrl,
    telegramPopupTitle:
      data.telegramPopupTitle ||
      data.popupTitle ||
      data.title ||
      DEFAULT_SETTINGS.telegramPopupTitle,
    telegramPopupDescription:
      data.telegramPopupDescription ||
      data.popupDescription ||
      data.description ||
      data.message ||
      DEFAULT_SETTINGS.telegramPopupDescription,
    telegramPopupDelaySec:
      typeof data.telegramPopupDelaySec === 'number'
        ? data.telegramPopupDelaySec
        : typeof data.popupDelay === 'number'
        ? data.popupDelay
        : typeof data.delay === 'number'
        ? data.delay
        : DEFAULT_SETTINGS.telegramPopupDelaySec,
    telegramPopupEnabled:
      typeof data.telegramPopupEnabled === 'boolean'
        ? data.telegramPopupEnabled
        : typeof data.popupEnabled === 'boolean'
        ? data.popupEnabled
        : typeof data.enabled === 'boolean'
        ? data.enabled
        : DEFAULT_SETTINGS.telegramPopupEnabled,
    telegramProfilePicUrl:
      data.telegramProfilePicUrl ||
      data.telegramAvatarUrl ||
      data.telegramProfilePic ||
      data.profilePicUrl ||
      data.avatarUrl ||
      '',
    telegramCoverPicUrl:
      data.telegramCoverPicUrl ||
      data.telegramCoverUrl ||
      data.telegramBannerUrl ||
      data.coverPicUrl ||
      data.coverUrl ||
      '',
    siteName: data.siteName || DEFAULT_SETTINGS.siteName,
    logoUrl: data.logoUrl || data.logo || data.siteLogo || DEFAULT_SETTINGS.logoUrl || '',
    tagline: data.tagline || data.siteTagline || data.subTitle || data.subtitle || DEFAULT_SETTINGS.tagline || '',
    adminPin: data.adminPin || DEFAULT_SETTINGS.adminPin,
    unlockAdEnabled:
      typeof data.unlockAdEnabled === 'boolean'
        ? data.unlockAdEnabled
        : typeof data.adEnabled === 'boolean'
        ? data.adEnabled
        : DEFAULT_SETTINGS.unlockAdEnabled,
    unlockAdUrl:
      data.unlockAdUrl ||
      data.adUrl ||
      data.adsUrl ||
      data.adLink ||
      DEFAULT_SETTINGS.unlockAdUrl,
    unlockAdRequiredClicks:
      typeof data.unlockAdRequiredClicks === 'number'
        ? data.unlockAdRequiredClicks
        : typeof data.adClicks === 'number'
        ? data.adClicks
        : typeof data.requiredClicks === 'number'
        ? data.requiredClicks
        : DEFAULT_SETTINGS.unlockAdRequiredClicks,
    unlockAdWaitSeconds:
      typeof data.unlockAdWaitSeconds === 'number'
        ? data.unlockAdWaitSeconds
        : typeof data.adWaitSeconds === 'number'
        ? data.adWaitSeconds
        : typeof data.waitSeconds === 'number'
        ? data.waitSeconds
        : DEFAULT_SETTINGS.unlockAdWaitSeconds,
    unlockAdButtonText:
      data.unlockAdButtonText ||
      data.adButtonText ||
      DEFAULT_SETTINGS.unlockAdButtonText,
  };
}

// Real-Time Firebase Service (Dual Firestore & Realtime Database with LocalStorage Sync)
export const FirebaseService = {
  // Subscribe to Videos real-time
  subscribeToVideos(
    callback: (videos: Video[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Subscribe to Firestore collection "videos"
    try {
      const videosCol = collection(db, COLLECTIONS.VIDEOS);
      const unsubFirestore = onSnapshot(
        videosCol,
        (snapshot) => {
          const videos: Video[] = [];
          snapshot.forEach((docSnap) => {
            videos.push(parseVideoData(docSnap.id, docSnap.data()));
          });
          videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          callback(videos);
        },
        (err) => {
          console.warn('Firestore videos snapshot notice:', err);
          onError?.(err);
        }
      );
      unsubscribers.push(unsubFirestore);
    } catch (err: any) {
      console.warn('Firestore subscription fallback:', err);
    }

    // 2. Also listen to Realtime Database "videos" path if available
    if (rtdb) {
      try {
        const videosRef = ref(rtdb, COLLECTIONS.VIDEOS);
        const unsubRtdb = onValue(
          videosRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const val = snapshot.val();
              const videos: Video[] = [];
              if (typeof val === 'object' && val !== null) {
                Object.keys(val).forEach((key) => {
                  videos.push(parseVideoData(key, val[key]));
                });
                videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                callback(videos);
              }
            }
          },
          (err) => {
            console.warn('RTDB videos notice:', err);
          }
        );
        unsubscribers.push(() => unsubRtdb());
      } catch (e) {
        console.warn('RTDB subscription notice:', e);
      }
    }

    return () => {
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
    };
  },

  // Subscribe to Banners real-time
  subscribeToBanners(
    callback: (banners: Banner[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Firestore "banners"
    try {
      const bannersCol = collection(db, COLLECTIONS.BANNERS);
      const unsubFirestore = onSnapshot(
        bannersCol,
        (snapshot) => {
          const banners: Banner[] = [];
          snapshot.forEach((docSnap) => {
            banners.push(parseBannerData(docSnap.id, docSnap.data()));
          });
          banners.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          callback(banners);
        },
        (err) => {
          console.warn('Firestore banners notice:', err);
          onError?.(err);
        }
      );
      unsubscribers.push(unsubFirestore);
    } catch (err: any) {
      console.warn('Firestore banners fallback:', err);
    }

    // 2. Realtime Database "banners"
    if (rtdb) {
      try {
        const bannersRef = ref(rtdb, COLLECTIONS.BANNERS);
        const unsubRtdb = onValue(
          bannersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const val = snapshot.val();
              const banners: Banner[] = [];
              if (typeof val === 'object' && val !== null) {
                Object.keys(val).forEach((key) => {
                  banners.push(parseBannerData(key, val[key]));
                });
                banners.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                callback(banners);
              }
            }
          },
          (err) => {
            console.warn('RTDB banners notice:', err);
          }
        );
        unsubscribers.push(() => unsubRtdb());
      } catch (e) {
        console.warn('RTDB banners note:', e);
      }
    }

    return () => {
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
    };
  },

  // Subscribe to Settings real-time
  subscribeToSettings(
    callback: (settings: GeneralSettings) => void,
    onError?: (error: Error) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    try {
      const settingsDoc = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      const unsub = onSnapshot(
        settingsDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            callback(parseSettingsData(snapshot.data()));
          }
        },
        (err) => {
          console.warn('Firestore settings notice:', err);
          onError?.(err);
        }
      );
      unsubscribers.push(unsub);
    } catch (err: any) {
      console.warn('Settings subscription fallback:', err);
    }

    if (rtdb) {
      try {
        const settingsRef = ref(rtdb, 'settings');
        const unsubRtdb = onValue(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const general = data.general ? data.general : data;
            callback(parseSettingsData(general));
          }
        });
        unsubscribers.push(() => unsubRtdb());
      } catch {
        // ignore
      }
    }

    return () => {
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
    };
  },

  // Subscribe to Categories real-time
  subscribeToCategories(
    callback: (categories: string[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Firestore "settings/categories"
    try {
      const catDoc = doc(db, COLLECTIONS.SETTINGS, 'categories');
      const unsubFirestore = onSnapshot(
        catDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (Array.isArray(data.list) && data.list.length > 0) {
              StorageService.saveCategories(data.list);
              callback(data.list);
            }
          }
        },
        (err) => {
          console.warn('Firestore categories snapshot notice:', err);
          onError?.(err);
        }
      );
      unsubscribers.push(unsubFirestore);
    } catch (err) {
      console.warn('Firestore categories fallback:', err);
    }

    // 2. Realtime Database "categories"
    if (rtdb) {
      try {
        const catRef = ref(rtdb, 'categories');
        const unsubRtdb = onValue(catRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const list = Array.isArray(val)
              ? val
              : typeof val === 'object' && val !== null
              ? Object.values(val)
              : null;
            if (Array.isArray(list) && list.length > 0) {
              const strList = list.map((x) => String(x).trim()).filter(Boolean);
              StorageService.saveCategories(strList);
              callback(strList);
            }
          }
        });
        unsubscribers.push(() => unsubRtdb());
      } catch {
        // ignore
      }
    }

    return () => {
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
    };
  },

  // Save full Categories list to Firestore & RTDB & LocalStorage
  async saveCategories(categories: string[]): Promise<string[]> {
    const updated = StorageService.saveCategories(categories);

    // Firestore
    try {
      const catDoc = doc(db, COLLECTIONS.SETTINGS, 'categories');
      await setDoc(catDoc, { list: updated, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.warn('Firestore categories save notice:', err);
    }

    // RTDB
    if (rtdb) {
      try {
        const catRef = ref(rtdb, 'categories');
        await set(catRef, updated);
      } catch (err) {
        console.warn('RTDB categories save notice:', err);
      }
    }

    return updated;
  },

  // Add a new Category
  async addCategory(newCategoryName: string): Promise<string[]> {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return StorageService.getCategories();
    const current = StorageService.getCategories();
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return current;
    }
    const updated = [...current, trimmed];
    return this.saveCategories(updated);
  },

  // Delete a Category
  async deleteCategory(categoryToDelete: string): Promise<string[]> {
    const current = StorageService.getCategories();
    const updated = current.filter(
      (c) => c.toLowerCase() !== categoryToDelete.trim().toLowerCase()
    );
    return this.saveCategories(updated);
  },

  // Update / Rename a Category
  async updateCategory(oldName: string, newName: string): Promise<string[]> {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName.trim().toLowerCase() === trimmedNew.toLowerCase()) {
      return StorageService.getCategories();
    }
    const updated = StorageService.updateCategory(oldName, trimmedNew);
    await this.saveCategories(updated);
    return updated;
  },

  // Save or update video across all endpoints & userpanel aliases
  async saveVideo(video: Omit<Video, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<Video> {
    const videoId =
      video.id ||
      `v-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = video.createdAt || Date.now();

    const fullVideoObject: Video = {
      id: videoId,
      title: video.title.trim(),
      duration: video.duration.trim(),
      category: video.category,
      thumbnailUrl: video.thumbnailUrl.trim(),
      directLink: video.directLink.trim(),
      views: typeof video.views === 'number' ? video.views : 0,
      likes: typeof video.likes === 'number' ? video.likes : 0,
      description: video.description ? video.description.trim() : '',
      createdAt,
    };

    // Payload with ALL userpanel compatibility aliases
    const payload: any = {
      id: videoId,
      title: fullVideoObject.title,
      name: fullVideoObject.title,
      duration: fullVideoObject.duration,
      category: fullVideoObject.category,
      thumbnailUrl: fullVideoObject.thumbnailUrl,
      thumbnail: fullVideoObject.thumbnailUrl,
      image: fullVideoObject.thumbnailUrl,
      poster: fullVideoObject.thumbnailUrl,
      cover: fullVideoObject.thumbnailUrl,
      directLink: fullVideoObject.directLink,
      videoUrl: fullVideoObject.directLink,
      streamUrl: fullVideoObject.directLink,
      streamLink: fullVideoObject.directLink,
      url: fullVideoObject.directLink,
      link: fullVideoObject.directLink,
      views: fullVideoObject.views,
      likes: fullVideoObject.likes,
      description: fullVideoObject.description,
      createdAt,
      updatedAt: Date.now(),
    };

    // 1. Save locally
    StorageService.saveVideo(fullVideoObject);

    // 2. Save to Firestore (primary 'videos' + aliases 'movies', 'video', 'posts')
    const firestoreErrors: string[] = [];
    try {
      const videoRef = doc(db, COLLECTIONS.VIDEOS, videoId);
      await setDoc(videoRef, payload, { merge: true });
    } catch (err: any) {
      console.error('Firestore videos write error:', err);
      firestoreErrors.push(err?.message || 'Firestore write error');
    }

    // Also sync to alias collections if userpanel uses them
    try {
      await setDoc(doc(db, 'movies', videoId), payload, { merge: true });
    } catch {
      // ignore alias error
    }
    try {
      await setDoc(doc(db, 'video', videoId), payload, { merge: true });
    } catch {
      // ignore alias error
    }

    // 3. Save to Realtime Database
    let rtdbError: string | null = null;
    if (rtdb) {
      try {
        const rtdbRef = ref(rtdb, `${COLLECTIONS.VIDEOS}/${videoId}`);
        await set(rtdbRef, payload);
      } catch (err: any) {
        console.error('RTDB set error:', err);
        rtdbError = err?.message || 'RTDB error';
      }
      try {
        await set(ref(rtdb, `movies/${videoId}`), payload);
      } catch {
        // ignore
      }
    }

    if (firestoreErrors.length > 0 && rtdbError) {
      console.warn('Firebase sync warning: check Firebase Security Rules in Firebase Console.');
    }

    return fullVideoObject;
  },

  // Test Firebase Live Connection & Security Rules
  async testFirebaseConnection(): Promise<{
    firestore: { ok: boolean; message: string; error?: string };
    rtdb: { ok: boolean; message: string; error?: string };
  }> {
    const testId = `_ping_test_${Date.now()}`;
    const result: {
      firestore: { ok: boolean; message: string; error?: string };
      rtdb: { ok: boolean; message: string; error?: string };
    } = {
      firestore: { ok: false, message: 'Testing...', error: undefined },
      rtdb: { ok: false, message: 'Testing...', error: undefined },
    };

    // 1. Test Firestore write & delete
    try {
      const testRef = doc(db, 'videos', testId);
      await setDoc(testRef, { test: true, timestamp: Date.now() });
      await deleteDoc(testRef);
      result.firestore = { ok: true, message: 'Connected & Read/Write Permitted', error: undefined };
    } catch (err: any) {
      result.firestore = {
        ok: false,
        message: err?.code === 'permission-denied' ? 'Permission Denied (Firebase Rules Blocked)' : 'Firestore Connection Error',
        error: err?.message || String(err),
      };
    }

    // 2. Test RTDB
    if (rtdb) {
      try {
        const testRtdbRef = ref(rtdb, `_ping_test/${testId}`);
        await set(testRtdbRef, { test: true, timestamp: Date.now() });
        await remove(testRtdbRef);
        result.rtdb = { ok: true, message: 'Connected & Read/Write Permitted', error: undefined };
      } catch (err: any) {
        result.rtdb = {
          ok: false,
          message: err?.code === 'PERMISSION_DENIED' ? 'Permission Denied (RTDB Rules Blocked)' : 'RTDB Connection Error',
          error: err?.message || String(err),
        };
      }
    } else {
      result.rtdb = { ok: false, message: 'RTDB not initialized', error: undefined };
    }

    return result;
  },

  // Permanent Delete Video from Firestore, RTDB and Local Storage
  async deleteVideo(id: string): Promise<boolean> {
    // 1. Delete from Local Storage immediately
    StorageService.deleteVideo(id);

    // 2. Delete from Firestore
    const firestorePromise = (async () => {
      try {
        const videoRef = doc(db, COLLECTIONS.VIDEOS, id);
        await deleteDoc(videoRef);
      } catch (err) {
        console.warn('Firestore deleteDoc notice:', err);
      }
    })();

    // 3. Delete from Realtime Database
    const rtdbPromise = (async () => {
      if (rtdb) {
        try {
          const rtdbRef = ref(rtdb, `${COLLECTIONS.VIDEOS}/${id}`);
          await remove(rtdbRef);
        } catch (err) {
          console.warn('RTDB remove notice:', err);
        }
      }
    })();

    await Promise.allSettled([firestorePromise, rtdbPromise]);
    return true;
  },

  // Increment video views in Firestore & RTDB
  async incrementVideoView(id: string): Promise<void> {
    try {
      const videoRef = doc(db, COLLECTIONS.VIDEOS, id);
      const snap = await getDoc(videoRef);
      if (snap.exists()) {
        const currentViews = snap.data().views || 0;
        await updateDoc(videoRef, { views: currentViews + 1 });
      }
    } catch {
      // ignore
    }

    if (rtdb) {
      try {
        const videoRef = ref(rtdb, `${COLLECTIONS.VIDEOS}/${id}`);
        const snap = await get(videoRef);
        if (snap.exists()) {
          const val = snap.val();
          await update(videoRef, { views: (val.views || 0) + 1 });
        }
      } catch {
        // ignore
      }
    }
  },

  // Increment video likes in Firestore & RTDB
  async incrementVideoLike(id: string): Promise<void> {
    try {
      const videoRef = doc(db, COLLECTIONS.VIDEOS, id);
      const snap = await getDoc(videoRef);
      if (snap.exists()) {
        const currentLikes = snap.data().likes || 0;
        await updateDoc(videoRef, { likes: currentLikes + 1 });
      }
    } catch {
      // ignore
    }

    if (rtdb) {
      try {
        const videoRef = ref(rtdb, `${COLLECTIONS.VIDEOS}/${id}`);
        const snap = await get(videoRef);
        if (snap.exists()) {
          const val = snap.val();
          await update(videoRef, { likes: (val.likes || 0) + 1 });
        }
      } catch {
        // ignore
      }
    }
  },

  // Save or update Picture-Only Banner
  async saveBanner(banner: {
    id?: string;
    imageUrl: string;
    targetLink?: string;
    active: boolean;
    createdAt?: number;
  }): Promise<Banner> {
    const bannerId =
      banner.id ||
      `b-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = banner.createdAt || Date.now();

    const fullBannerObject: Banner = {
      id: bannerId,
      imageUrl: banner.imageUrl.trim(),
      targetLink: banner.targetLink ? banner.targetLink.trim() : '',
      active: banner.active,
      createdAt,
      title: '',
      subtitle: '',
    };

    const payload: any = {
      id: bannerId,
      imageUrl: fullBannerObject.imageUrl,
      image: fullBannerObject.imageUrl,
      bannerUrl: fullBannerObject.imageUrl,
      bannerImage: fullBannerObject.imageUrl,
      url: fullBannerObject.imageUrl,
      targetLink: fullBannerObject.targetLink,
      link: fullBannerObject.targetLink,
      targetUrl: fullBannerObject.targetLink,
      redirectUrl: fullBannerObject.targetLink,
      videoUrl: fullBannerObject.targetLink,
      active: fullBannerObject.active,
      enabled: fullBannerObject.active,
      status: fullBannerObject.active ? 'active' : 'inactive',
      title: '',
      subtitle: '',
      createdAt,
      updatedAt: Date.now(),
    };

    // 1. Save locally
    StorageService.saveBanner(fullBannerObject);

    // 2. Save to Firestore
    try {
      const bannerRef = doc(db, COLLECTIONS.BANNERS, bannerId);
      await setDoc(bannerRef, payload, { merge: true });
    } catch (err) {
      console.warn('Firestore banner setDoc notice:', err);
    }

    // 3. Save to RTDB
    if (rtdb) {
      try {
        const rtdbRef = ref(rtdb, `${COLLECTIONS.BANNERS}/${bannerId}`);
        await set(rtdbRef, payload);
      } catch (err) {
        console.warn('RTDB banner set notice:', err);
      }
    }

    return fullBannerObject;
  },

  // 1-Click Toggle Banner Active
  async toggleBannerActive(id: string, currentActive: boolean): Promise<boolean> {
    const newActive = !currentActive;

    // Local
    StorageService.toggleBannerActive(id);

    // Firestore
    try {
      const bannerRef = doc(db, COLLECTIONS.BANNERS, id);
      await updateDoc(bannerRef, {
        active: newActive,
        enabled: newActive,
        status: newActive ? 'active' : 'inactive',
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore toggle notice:', err);
    }

    // RTDB
    if (rtdb) {
      try {
        const rtdbRef = ref(rtdb, `${COLLECTIONS.BANNERS}/${id}`);
        await update(rtdbRef, {
          active: newActive,
          enabled: newActive,
          status: newActive ? 'active' : 'inactive',
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn('RTDB toggle notice:', err);
      }
    }

    return true;
  },

  // Permanent Delete Banner
  async deleteBanner(id: string): Promise<boolean> {
    // 1. Local
    StorageService.deleteBanner(id);

    // 2. Firestore
    const firestorePromise = (async () => {
      try {
        const bannerRef = doc(db, COLLECTIONS.BANNERS, id);
        await deleteDoc(bannerRef);
      } catch (err) {
        console.warn('Firestore delete banner notice:', err);
      }
    })();

    // 3. RTDB
    const rtdbPromise = (async () => {
      if (rtdb) {
        try {
          const rtdbRef = ref(rtdb, `${COLLECTIONS.BANNERS}/${id}`);
          await remove(rtdbRef);
        } catch (err) {
          console.warn('RTDB delete banner notice:', err);
        }
      }
    })();

    await Promise.allSettled([firestorePromise, rtdbPromise]);
    return true;
  },

  // Save Settings
  async saveSettings(settings: Partial<GeneralSettings>): Promise<void> {
    StorageService.saveSettings(settings);

    const merged = {
      ...DEFAULT_SETTINGS,
      ...StorageService.getSettings(),
      ...settings,
    };

    const payload: any = {
      telegramChannelUrl: merged.telegramChannelUrl,
      telegramUrl: merged.telegramChannelUrl,
      telegramLink: merged.telegramChannelUrl,
      telegram: merged.telegramChannelUrl,
      channelUrl: merged.telegramChannelUrl,
      telegramPopupTitle: merged.telegramPopupTitle,
      popupTitle: merged.telegramPopupTitle,
      title: merged.telegramPopupTitle,
      telegramPopupDescription: merged.telegramPopupDescription,
      popupDescription: merged.telegramPopupDescription,
      description: merged.telegramPopupDescription,
      message: merged.telegramPopupDescription,
      telegramPopupDelaySec: Number(merged.telegramPopupDelaySec) || 4,
      popupDelay: Number(merged.telegramPopupDelaySec) || 4,
      delay: Number(merged.telegramPopupDelaySec) || 4,
      popupDelaySec: Number(merged.telegramPopupDelaySec) || 4,
      telegramPopupEnabled: Boolean(merged.telegramPopupEnabled),
      popupEnabled: Boolean(merged.telegramPopupEnabled),
      enabled: Boolean(merged.telegramPopupEnabled),
      isPopupEnabled: Boolean(merged.telegramPopupEnabled),
      showPopup: Boolean(merged.telegramPopupEnabled),
      telegramProfilePicUrl: merged.telegramProfilePicUrl ? merged.telegramProfilePicUrl.trim() : '',
      profilePicUrl: merged.telegramProfilePicUrl ? merged.telegramProfilePicUrl.trim() : '',
      telegramCoverPicUrl: merged.telegramCoverPicUrl ? merged.telegramCoverPicUrl.trim() : '',
      coverPicUrl: merged.telegramCoverPicUrl ? merged.telegramCoverPicUrl.trim() : '',
      siteName: merged.siteName,
      name: merged.siteName,
      logoUrl: merged.logoUrl || '',
      logo: merged.logoUrl || '',
      tagline: merged.tagline || '',
      subtitle: merged.tagline || '',
      adminPin: merged.adminPin,
      // Video Unlock & Ads Configuration
      unlockAdEnabled: Boolean(merged.unlockAdEnabled),
      adEnabled: Boolean(merged.unlockAdEnabled),
      unlockAdUrl: merged.unlockAdUrl || '',
      adUrl: merged.unlockAdUrl || '',
      unlockAdRequiredClicks: Number(merged.unlockAdRequiredClicks) || 3,
      adClicks: Number(merged.unlockAdRequiredClicks) || 3,
      requiredClicks: Number(merged.unlockAdRequiredClicks) || 3,
      unlockAdWaitSeconds: Number(merged.unlockAdWaitSeconds) || 10,
      adWaitSeconds: Number(merged.unlockAdWaitSeconds) || 10,
      waitSeconds: Number(merged.unlockAdWaitSeconds) || 10,
      unlockAdButtonText: merged.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)',
      adButtonText: merged.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)',
      updatedAt: Date.now(),
    };

    // Firestore
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      await setDoc(settingsRef, payload, { merge: true });
    } catch (err) {
      console.warn('Firestore settings save notice:', err);
    }

    // RTDB
    if (rtdb) {
      try {
        const rtdbGeneralRef = ref(rtdb, 'settings/general');
        await set(rtdbGeneralRef, payload);
        const rtdbRootRef = ref(rtdb, 'settings');
        await update(rtdbRootRef, payload);
      } catch (err) {
        console.warn('RTDB settings save notice:', err);
      }
    }
  },

  // Seed sample initial data
  async seedInitialDataIfEmpty(currentVideosCount: number, currentBannersCount: number): Promise<{ seeded: boolean; message: string }> {
    const initialBanners = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
        targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
        targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        targetLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        active: true,
      },
    ];

    const initialVideos = [
      {
        title: 'Shadow Strike: Crimson Protocol',
        duration: '18:45',
        category: 'Action' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: 184500,
        likes: 12840,
        description: 'An elite black-ops operative goes rogue after discovering a cybernetic conspiracy.',
      },
      {
        title: 'Cyber Tokyo 2099 — Episode 1: Digital Ghosts',
        duration: '24:10',
        category: 'Web Series' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        views: 249120,
        likes: 19430,
        description: 'Detective Ren uncovers illegal neural implants trading classified memories of the elite.',
      },
      {
        title: 'Nadir Pare (Across the River)',
        duration: '1:58:12',
        category: 'Bangla' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        views: 92300,
        likes: 8140,
        description: 'A poetic Bengali drama exploring generational estrangement and roots along the river.',
      },
      {
        title: 'Neon Horizon: Awakening',
        duration: '24:15',
        category: 'Anime' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: 312400,
        likes: 27800,
        description: 'Ancient mechanized titans awaken from beneath the deep ocean trench.',
      },
    ];

    for (const b of initialBanners) {
      await this.saveBanner(b);
    }

    for (const v of initialVideos) {
      await this.saveVideo(v);
    }

    await this.saveSettings(DEFAULT_SETTINGS);

    return { seeded: true, message: 'All sample data synchronized to Firebase & Userpanel!' };
  },
};

export const incrementFirestoreVideoView = (id: string) => FirebaseService.incrementVideoView(id);
export const incrementFirestoreVideoLike = (id: string) => FirebaseService.incrementVideoLike(id);
