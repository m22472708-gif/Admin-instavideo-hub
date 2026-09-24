import React, { useState, useEffect } from 'react';
import { GeneralSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { FirebaseService, firebaseConfig } from '../../services/firebase';
import { useToast } from '../../context/ToastContext';
import {
  KeyRound,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Save,
  Radio,
  Copy,
  Check,
  Server,
  Sparkles,
  Globe,
  Image as ImageIcon,
  Palette,
  Lock,
  Unlock,
  Clock,
  ExternalLink,
  PlaySquare,
  Link as LinkIcon,
  Layers,
} from 'lucide-react';

interface SystemSettingsProps {
  settings: GeneralSettings;
  onRefresh: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ settings, onRefresh }) => {
  const { showSuccessToast, showErrorToast } = useToast();

  const [siteName, setSiteName] = useState(settings.siteName || 'StreamPulse');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [tagline, setTagline] = useState(settings.tagline || 'Premium Cinema & Web Series Hub');
  const [isUpdatingBrand, setIsUpdatingBrand] = useState(false);

  // Video Unlock & Ads System State
  const [unlockAdEnabled, setUnlockAdEnabled] = useState(
    settings.unlockAdEnabled !== undefined ? settings.unlockAdEnabled : true
  );
  const [unlockAdUrl, setUnlockAdUrl] = useState(
    settings.unlockAdUrl || 'https://example.com/ads'
  );
  const [unlockAdRequiredClicks, setUnlockAdRequiredClicks] = useState<number | string>(
    settings.unlockAdRequiredClicks || 3
  );
  const [unlockAdWaitSeconds, setUnlockAdWaitSeconds] = useState<number | string>(
    settings.unlockAdWaitSeconds || 10
  );
  const [unlockAdButtonText, setUnlockAdButtonText] = useState(
    settings.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)'
  );
  const [isUpdatingUnlockAds, setIsUpdatingUnlockAds] = useState(false);

  useEffect(() => {
    setSiteName(settings.siteName || 'StreamPulse');
    setLogoUrl(settings.logoUrl || '');
    setTagline(settings.tagline || 'Premium Cinema & Web Series Hub');
    setUnlockAdEnabled(settings.unlockAdEnabled !== undefined ? settings.unlockAdEnabled : true);
    setUnlockAdUrl(settings.unlockAdUrl || 'https://example.com/ads');
    setUnlockAdRequiredClicks(settings.unlockAdRequiredClicks || 3);
    setUnlockAdWaitSeconds(settings.unlockAdWaitSeconds || 10);
    setUnlockAdButtonText(settings.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)');
  }, [
    settings.siteName,
    settings.logoUrl,
    settings.tagline,
    settings.unlockAdEnabled,
    settings.unlockAdUrl,
    settings.unlockAdRequiredClicks,
    settings.unlockAdWaitSeconds,
    settings.unlockAdButtonText,
  ]);

  const [newPin, setNewPin] = useState(settings.adminPin || '1234');
  const [confirmPin, setConfirmPin] = useState(settings.adminPin || '1234');
  const [copied, setCopied] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleToggleUnlockStatus = async (newVal: boolean) => {
    setUnlockAdEnabled(newVal);
    try {
      const updatedData = {
        unlockAdEnabled: newVal,
        unlockAdUrl: unlockAdUrl.trim(),
        unlockAdRequiredClicks: Math.max(1, Number(unlockAdRequiredClicks) || 1),
        unlockAdWaitSeconds: Math.max(1, Number(unlockAdWaitSeconds) || 1),
        unlockAdButtonText: unlockAdButtonText.trim() || 'Unlock Video (Watch Ads to Play)',
      };
      await FirebaseService.saveSettings(updatedData);
      StorageService.saveSettings(updatedData);
      showSuccessToast(
        newVal ? 'Unlock System Enabled (চালু হয়েছে)' : 'Unlock System Disabled (বন্ধ হয়েছে)',
        newVal
          ? 'ভিডিও দেখার আগে অ্যাড আনলক করতে হবে।'
          : 'ভিডিও সরাসরি প্লে হবে, কোনো অ্যাড বা লক স্ক্রিন থাকবে না।'
      );
      onRefresh();
    } catch (err: any) {
      showErrorToast('Failed to change status', err?.message);
    }
  };

  const handleUpdateUnlockAds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockAdEnabled && !unlockAdUrl.trim()) {
      showErrorToast('Ad Link Required', 'Please enter your ad destination URL or monetized link.');
      return;
    }

    setIsUpdatingUnlockAds(true);
    try {
      const updatedData = {
        unlockAdEnabled,
        unlockAdUrl: unlockAdUrl.trim(),
        unlockAdRequiredClicks: Math.max(1, Number(unlockAdRequiredClicks) || 1),
        unlockAdWaitSeconds: Math.max(1, Number(unlockAdWaitSeconds) || 1),
        unlockAdButtonText: unlockAdButtonText.trim() || 'Unlock Video (Watch Ads to Play)',
      };
      await FirebaseService.saveSettings(updatedData);
      StorageService.saveSettings(updatedData);
      showSuccessToast('Video Unlock Settings Saved', 'Ad-wall configuration updated in Firestore & real-time listeners.');
      onRefresh();
    } catch (err: any) {
      showErrorToast('Save Failed', err?.message || 'Failed to save Video Unlock settings');
    } finally {
      setIsUpdatingUnlockAds(false);
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = siteName.trim();
    if (!trimmedName) {
      showErrorToast('Site Name Required', 'Please enter a valid website name.');
      return;
    }

    setIsUpdatingBrand(true);
    try {
      const updatedData = {
        siteName: trimmedName,
        logoUrl: logoUrl.trim(),
        tagline: tagline.trim(),
      };
      await FirebaseService.saveSettings(updatedData);
      StorageService.saveSettings(updatedData);
      showSuccessToast('Brand Identity Updated', 'Site name and logo saved to Firestore & real-time listeners.');
      onRefresh();
    } catch (err: any) {
      showErrorToast('Update Failed', err?.message || 'Failed to update brand settings');
    } finally {
      setIsUpdatingBrand(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showErrorToast('Invalid PIN', 'Admin PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      showErrorToast('PIN Mismatch', 'The confirmation PIN does not match.');
      return;
    }

    try {
      await FirebaseService.saveSettings({ adminPin: newPin });
      StorageService.saveSettings({ adminPin: newPin });
      showSuccessToast('Security PIN Updated', 'Master access PIN updated in Firestore and local storage.');
      onRefresh();
    } catch (err: any) {
      showErrorToast('Error Updating PIN', err?.message || 'Failed to update PIN');
    }
  };

  const handleExportData = () => {
    const data = StorageService.exportAllData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `streampulse_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showSuccessToast('Backup Exported', 'Full collections database downloaded as JSON.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const content = event.target?.result as string;
        const res = StorageService.importData(content);
        if (res.success) {
          showSuccessToast('Database Restored', 'All collections imported successfully.');
          onRefresh();
        } else {
          showErrorToast('Import Failed', res.error || 'Invalid JSON format');
        }
      };
    }
  };

  const handleResetToDemo = () => {
    StorageService.resetToDefault();
    showSuccessToast('Reset Complete', 'Database restored to initial cinematic demo catalog.');
    setResetConfirmOpen(false);
    onRefresh();
  };

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    try {
      const res = await FirebaseService.seedInitialDataIfEmpty(0, 0);
      showSuccessToast('Firestore Synchronized', res.message);
      onRefresh();
    } catch (err: any) {
      console.error('Error seeding data:', err);
      showErrorToast('Sync Error', err?.message || 'Could not seed Firestore collections');
    } finally {
      setIsSeeding(false);
    }
  };

  const firestoreSchemaSample = `{
  // 1. Collection "videos"
  "videos": [
    {
      "id": "v-101",
      "title": "Shadow Strike: Crimson Protocol",
      "duration": "18:45", // Corner duration badge
      "category": "Action", // Movies | Web Series | Action | Drama | Bangla | Thriller | Comedy | Anime | Trailers
      "thumbnailUrl": "https://images.unsplash.com/...",
      "directLink": "https://commondatastorage.googleapis.com/...",
      "views": 184500,
      "likes": 12840,
      "description": "Black-ops operative conspiracy...",
      "createdAt": 1727000000000
    }
  ],

  // 2. Collection "banners" (PICTURE-ONLY: No title, No subtitle, No button text!)
  "banners": [
    {
      "id": "b-1",
      "imageUrl": "https://images.unsplash.com/...", // Direct picture URL
      "targetLink": "https://...",                   // Optional redirect link
      "active": true,                               // 1-click on/off toggle
      "createdAt": 1727000000000
    }
  ],

  // 3. Collection "settings" (document "general")
  "settings": {
    "general": {
      "telegramChannelUrl": "https://t.me/your_channel",
      "telegramPopupTitle": "Join StreamPulse VIP Telegram",
      "telegramPopupDescription": "Get instant notifications for new 4K releases...",
      "telegramPopupDelaySec": 4,
      "telegramPopupEnabled": true,
      "siteName": "StreamPulse",
      "adminPin": "1234"
    }
  }
}`;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(firestoreSchemaSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccessToast('Schema Copied', 'Firestore JSON blueprint copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      {/* Brand Identity & Logo Customization Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 text-rose-500 border border-rose-500/30">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Website Brand Identity & Logo
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Customize website name, brand logo image, and tagline across admin & user frontend.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateBrand} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Site Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Website / Brand Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. StreamPulse, MovieFlix, CinemaZone"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Watch HD Movies & Web Series"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Logo URL with Live Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Logo Image URL (PNG, JPG, SVG, WebP)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png (leave empty for default icon)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>

              {/* Live Logo Preview Box */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shrink-0">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  Preview:
                </span>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-8 h-8 rounded-lg object-contain bg-zinc-900 border border-zinc-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {siteName || 'Site Name'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingBrand}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/30 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isUpdatingBrand ? 'Saving Brand...' : 'Save Brand & Logo'}
            </button>
          </div>
        </form>
      </div>

      {/* Video Unlock & Ads Configuration Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Video Unlock & Ads Paywall System
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    unlockAdEnabled
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                  }`}
                >
                  {unlockAdEnabled ? 'Active / Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Require viewers to visit ad links (2 to 5 times) and wait seconds before video unlocks and plays.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none self-start sm:self-auto bg-slate-100 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              System Status:
            </span>
            <input
              type="checkbox"
              checked={unlockAdEnabled}
              onChange={(e) => handleToggleUnlockStatus(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 relative"></div>
          </label>
        </div>

        {/* Status reminder banner */}
        {!unlockAdEnabled && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold">
                Status: Paused / Disabled (Direct Play). You can still edit & save your ad configuration below.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdateUnlockAds} className="space-y-4">
          {/* Ad Link URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Ad / Destination URL <span className="text-rose-500">*</span>
              </label>
              {unlockAdUrl && (
                <a
                  href={unlockAdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 hover:underline"
                >
                  <span>Test Ad Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type="url"
                value={unlockAdUrl}
                onChange={(e) => setUnlockAdUrl(e.target.value)}
                placeholder="https://example.com/ad-network-link or direct CPA url"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required={unlockAdEnabled}
              />
              <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Users will be redirected to this monetized link in a new tab when clicking Unlock Video.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Required Clicks / Views */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Required Ad Views (কত বার দেখতে হবে)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={unlockAdRequiredClicks}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setUnlockAdRequiredClicks('');
                    } else {
                      const num = parseInt(val, 10);
                      setUnlockAdRequiredClicks(isNaN(num) ? '' : num);
                    }
                  }}
                  onBlur={() => {
                    if (!unlockAdRequiredClicks || Number(unlockAdRequiredClicks) < 1) {
                      setUnlockAdRequiredClicks(1);
                    }
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <Layers className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-zinc-400">
                e.g. 2 বার বা 5 বার দেখা বাধ্যতামূলক হবে
              </p>
            </div>

            {/* Wait Countdown Seconds */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Wait Time Per Ad (সেকেন্ড কাউন্টডাউন)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={unlockAdWaitSeconds}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setUnlockAdWaitSeconds('');
                    } else {
                      const num = parseInt(val, 10);
                      setUnlockAdWaitSeconds(isNaN(num) ? '' : num);
                    }
                  }}
                  onBlur={() => {
                    if (!unlockAdWaitSeconds || Number(unlockAdWaitSeconds) < 1) {
                      setUnlockAdWaitSeconds(1);
                    }
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-zinc-400">
                e.g. প্রতি ক্লিকে ৫ বা ১০ সেকেন্ড অপেক্ষা করতে হবে
              </p>
            </div>

            {/* Custom Button Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Button Label (বাটনের লেখা)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={unlockAdButtonText}
                  onChange={(e) => setUnlockAdButtonText(e.target.value)}
                  placeholder="Unlock Video (Watch Ads to Play)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <PlaySquare className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Displayed under the locked video player
              </p>
            </div>
          </div>

          {/* Real-time Preview Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Viewer Experience Preview:</span>
              <span className="text-amber-500 font-mono font-bold">
                {unlockAdRequiredClicks || 1} Views Required • {unlockAdWaitSeconds || 1}s Wait Each
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {unlockAdButtonText || 'Unlock Video (Watch Ads to Play)'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Step: 0 of {unlockAdRequiredClicks || 1} completed • Click to view ad and wait {unlockAdWaitSeconds || 1}s
                  </div>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs shadow-md whitespace-nowrap">
                Unlock Video ({unlockAdRequiredClicks || 1} Ads Left)
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              💡 {unlockAdRequiredClicks} বার অ্যাড দেখা সম্পন্ন হলে স্বয়ংক্রিয়ভাবে ভিডিওর শুরুতে স্ক্রোল হবে এবং ভিডিও প্লে শুরু হবে।
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingUnlockAds}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-950/30 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isUpdatingUnlockAds ? 'Saving Settings...' : 'Save Video Unlock Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Admin Master PIN Security */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Master PIN Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                The 4-digit code required on the authentication lock screen.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-center text-sm font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-center text-sm font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
              <p>Current PIN: <code className="font-mono font-bold text-rose-500">{settings.adminPin}</code></p>
              <p className="text-zinc-500">
                Default PIN is 1234. You can also use "Quick Enter" access mode.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider shadow-md shadow-rose-950/30 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Update Master PIN
            </button>
          </form>
        </div>

        {/* Card 2: Database Backup & Restore */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup & JSON Snapshot
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Export or import all Firestore datasets as JSON.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Full Database</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Saves videos, picture banners, and telegram settings to a single file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Download</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Import Backup File</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Upload a JSON snapshot to restore data.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Emergency Reset
            </span>
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="text-xs text-zinc-400 hover:text-rose-400 underline font-medium"
            >
              Reset to Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Firestore Schema Blueprint Card (Clean Collapsible Accordion) */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none select-none">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Firestore Collections Blueprint</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  Click to Expand
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Strictly maps to collections: <code className="text-rose-500 font-mono">videos</code>, <code className="text-rose-500 font-mono">banners</code>, and <code className="text-rose-500 font-mono">settings/general</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopySchema();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </summary>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-mono text-[11px] overflow-x-auto border border-slate-200 dark:border-zinc-800 leading-relaxed max-h-64">
              {firestoreSchemaSample}
            </pre>
          </div>
        </details>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Reset to Factory Cinematic Demo?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              This will overwrite local datasets with default cinematic demo data.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDemo}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-950/40 transition-all"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
