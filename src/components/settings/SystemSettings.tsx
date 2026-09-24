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

  useEffect(() => {
    setSiteName(settings.siteName || 'StreamPulse');
    setLogoUrl(settings.logoUrl || '');
    setTagline(settings.tagline || 'Premium Cinema & Web Series Hub');
  }, [settings.siteName, settings.logoUrl, settings.tagline]);

  const [newPin, setNewPin] = useState(settings.adminPin || '1234');
  const [confirmPin, setConfirmPin] = useState(settings.adminPin || '1234');
  const [copied, setCopied] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

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

      {/* Firestore Schema Blueprint Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Firestore Data Schema & Direct Collections Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Strictly maps to collections: <code className="text-rose-400 font-mono">videos</code>, <code className="text-rose-400 font-mono">banners</code> (picture-only), and <code className="text-rose-400 font-mono">settings/general</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopySchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Schema'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-zinc-300 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
          {firestoreSchemaSample}
        </pre>
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
