import React, { useState, useEffect, useRef } from 'react';
import { GeneralSettings } from '../../types';
import { FirebaseService } from '../../services/firebase';
import { useToast } from '../../context/ToastContext';
import {
  Send,
  Sliders,
  Play,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  Layers,
  Save,
  RotateCcw,
  X,
  BellRing,
  Image as ImageIcon,
  Trash2,
  UserCircle,
} from 'lucide-react';

interface TelegramManagerProps {
  settings: GeneralSettings;
  onRefresh: () => void;
}

export const TelegramManager: React.FC<TelegramManagerProps> = ({ settings, onRefresh }) => {
  const { showSuccessToast, showErrorToast } = useToast();

  const [channelUrl, setChannelUrl] = useState(settings.telegramChannelUrl);
  const [popupTitle, setPopupTitle] = useState(settings.telegramPopupTitle);
  const [popupDescription, setPopupDescription] = useState(settings.telegramPopupDescription);
  const [delaySec, setDelaySec] = useState<number | string>(
    Math.max(1, Number(settings.telegramPopupDelaySec) || 4)
  );
  const [enabled, setEnabled] = useState<boolean>(settings.telegramPopupEnabled ?? true);
  const [siteName, setSiteName] = useState(settings.siteName || 'StreamPulse');
  const [profilePicUrl, setProfilePicUrl] = useState(settings.telegramProfilePicUrl || '');
  const [coverPicUrl, setCoverPicUrl] = useState(settings.telegramCoverPicUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  // Simulator modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(4);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Sync state when props change
  useEffect(() => {
    setChannelUrl(settings.telegramChannelUrl);
    setPopupTitle(settings.telegramPopupTitle);
    setPopupDescription(settings.telegramPopupDescription);
    setDelaySec(settings.telegramPopupDelaySec || 4);
    setEnabled(settings.telegramPopupEnabled ?? true);
    setSiteName(settings.siteName || 'StreamPulse');
    setProfilePicUrl(settings.telegramProfilePicUrl || '');
    setCoverPicUrl(settings.telegramCoverPicUrl || '');
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await FirebaseService.saveSettings({
        telegramChannelUrl: channelUrl.trim(),
        telegramPopupTitle: popupTitle.trim(),
        telegramPopupDescription: popupDescription.trim(),
        telegramPopupDelaySec: Number(delaySec) || 4,
        telegramPopupEnabled: enabled,
        telegramProfilePicUrl: profilePicUrl.trim(),
        telegramCoverPicUrl: coverPicUrl.trim(),
        siteName: siteName.trim(),
      });

      showSuccessToast(
        'Telegram Settings Saved',
        'Settings updated and synced with Firebase & live userpanel in real-time!'
      );
      onRefresh();
    } catch (err: any) {
      console.error('Error saving settings to Firestore:', err);
      showErrorToast('Save Error', err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const startCountdownTest = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    const numericDelay = Math.max(1, Number(delaySec) || 4);
    setIsCountingDown(true);
    setRemainingTime(numericDelay);
    setIsPreviewModalOpen(false);

    let timeLeft = numericDelay;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);
      if (timeLeft <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setIsCountingDown(false);
        setIsPreviewModalOpen(true);
      }
    }, 1000);
  };

  const openInstantPreview = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountingDown(false);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center border border-sky-500/30">
            <Send className="w-6 h-6 -rotate-12" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Telegram Channel & 4-Second Glass Modal Control
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Manage automatic viewer conversion modal, delay timing, and target links.
            </p>
          </div>
        </div>

        {/* Live Simulator Trigger Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startCountdownTest}
            disabled={isCountingDown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/40 transition-all disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5" />
            {isCountingDown ? `Triggering in ${remainingTime}s...` : `Simulate ${delaySec}s Delay`}
          </button>
          <button
            type="button"
            onClick={openInstantPreview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Instant Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings Configuration Form */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-500" />
                Modal Parameters
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Status:</span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5.5 rounded-full transition-colors relative ${
                      enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      enabled ? 'text-emerald-500' : 'text-zinc-500'
                    }`}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            {/* Official Telegram Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Official Telegram Channel URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://t.me/your_channel"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  required
                />
                <Send className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                The destination invite link where viewers will be redirected upon clicking "Join Channel".
              </p>
            </div>

            {/* Visual Branding: Profile Picture / Avatar & Cover Banner Picture */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                  Telegram Popup Visual Assets
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">Custom avatar & cover banner</span>
              </div>

              {/* 1. Profile Picture / Avatar URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Profile Picture / Avatar URL
                  </label>
                  {profilePicUrl && (
                    <button
                      type="button"
                      onClick={() => setProfilePicUrl('')}
                      className="text-[11px] font-medium text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Live circular thumbnail preview (rounded-full) */}
                  <div
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-sky-500/50 bg-slate-200 dark:bg-zinc-800 shadow-sm shrink-0 overflow-hidden flex items-center justify-center"
                    title="Live circular thumbnail preview (rounded-full)"
                  >
                    {profilePicUrl ? (
                      <img
                        src={profilePicUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center">
                        <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Input field with Clear button */}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      value={profilePicUrl}
                      onChange={(e) => setProfilePicUrl(e.target.value)}
                      placeholder="https://.../channel-avatar.jpg"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setProfilePicUrl('')}
                      disabled={!profilePicUrl}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/40 disabled:opacity-40 disabled:hover:text-inherit disabled:hover:border-inherit transition-all shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  Image URL for the Telegram channel logo/avatar shown in the 3D circular badge.
                </p>
              </div>

              {/* 2. Cover Banner Picture URL */}
              <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Cover Banner Picture URL
                  </label>
                  {coverPicUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverPicUrl('')}
                      className="text-[11px] font-medium text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  {/* Live wide rectangular preview (rounded-xl) */}
                  <div
                    className="relative w-full sm:w-36 h-20 sm:h-20 rounded-xl border border-sky-500/40 bg-zinc-900 overflow-hidden shadow-xs shrink-0 flex items-center justify-center"
                    title="Live wide rectangular preview (rounded-xl)"
                  >
                    {coverPicUrl ? (
                      <img
                        src={coverPicUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-sky-950/60 via-blue-900/30 to-zinc-900 flex flex-col items-center justify-center p-2 text-center text-[10px] text-zinc-400">
                        <ImageIcon className="w-4 h-4 text-sky-400 mb-0.5" />
                        <span>Default Header</span>
                      </div>
                    )}
                  </div>

                  {/* Input field with Clear button */}
                  <div className="flex-1 w-full flex gap-2">
                    <input
                      type="url"
                      value={coverPicUrl}
                      onChange={(e) => setCoverPicUrl(e.target.value)}
                      placeholder="https://.../popup-header-banner.jpg"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverPicUrl('')}
                      disabled={!coverPicUrl}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/40 disabled:opacity-40 disabled:hover:text-inherit disabled:hover:border-inherit transition-all shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  Image URL for the top header cover banner of the popup.
                </p>
              </div>
            </div>

            {/* Site Name & Delay Seconds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Streaming Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="StreamPulse"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Popup Delay
                  </label>
                  <span className="font-mono text-xs font-bold text-sky-500">{delaySec || 1} seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={Number(delaySec) || 1}
                    onChange={(e) => setDelaySec(parseInt(e.target.value, 10))}
                    className="flex-1 accent-sky-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={delaySec}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setDelaySec('');
                      } else {
                        const num = parseInt(val, 10);
                        setDelaySec(isNaN(num) ? '' : num);
                      }
                    }}
                    onBlur={() => {
                      if (!delaySec || Number(delaySec) < 1) {
                        setDelaySec(1);
                      }
                    }}
                    className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-center text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Popup Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Glass Modal Title
              </label>
              <input
                type="text"
                value={popupTitle}
                onChange={(e) => setPopupTitle(e.target.value)}
                placeholder="e.g. Join Our Official Telegram"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                required
              />
            </div>

            {/* Popup Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Glass Modal Call-to-Action Description
              </label>
              <textarea
                rows={3}
                value={popupDescription}
                onChange={(e) => setPopupDescription(e.target.value)}
                placeholder="Message to convince viewers to join your telegram channel..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                required
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-zinc-500">
                Changes take effect across all viewer sessions instantly.
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-sky-950/40 transition-all"
              >
                <Save className="w-4 h-4" />
                Save & Synchronize
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Glassmorphism Mockup & Information */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              Live Glassmorphism Render Preview
            </h3>

            {/* In-container simulated glass card */}
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 bg-gradient-to-br from-zinc-950/90 via-sky-950/40 to-zinc-950/95 backdrop-blur-xl shadow-2xl text-center">
              {/* Background ambient light */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

              {/* Top Header Cover Banner */}
              {coverPicUrl ? (
                <div className="relative h-28 w-full overflow-hidden bg-zinc-900 border-b border-sky-500/20">
                  <img
                    src={coverPicUrl}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>
              ) : (
                <div className="h-14 w-full bg-gradient-to-b from-sky-500/20 via-blue-600/10 to-transparent" />
              )}

              <div className={`p-6 ${coverPicUrl ? '-mt-10' : ''} relative z-10`}>
                {/* 3D Circular Badge / Avatar */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-sky-500/20 border-2 border-white/20 mb-3 overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt="Telegram Avatar"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Send className="w-8 h-8 -rotate-12 translate-x-0.5 animate-pulse" />
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Official Community
                </div>

                <h4 className="text-base font-extrabold text-white tracking-tight">
                  {popupTitle || 'Join Our Official Telegram'}
                </h4>

                <p className="text-xs text-zinc-300 mt-2 leading-relaxed max-w-sm mx-auto">
                  {popupDescription || 'Get instant 4K release links and direct requests.'}
                </p>

                <div className="mt-5 space-y-2">
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5 -rotate-12" />
                    Join {siteName} Telegram Channel
                  </a>
                  <button
                    type="button"
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Continue to StreamPulse Player
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5 text-slate-600 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  Delay Execution:
                </span>
                <span className="font-mono text-sky-500 font-bold">{delaySec} seconds after load</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Target Channel:</span>
                <span className="font-mono truncate max-w-[160px] text-slate-700 dark:text-zinc-300">
                  {channelUrl}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Avatar / Banner:</span>
                <span className="font-mono text-[11px] text-sky-400">
                  {profilePicUrl ? 'Custom Avatar' : 'Default'} • {coverPicUrl ? 'Custom Banner' : 'Default'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Status:</span>
                <span className={enabled ? 'text-emerald-500 font-semibold' : 'text-zinc-500'}>
                  {enabled ? 'Active on Frontend' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN LIVE POPUP SIMULATOR MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex justify-center items-start sm:items-center pt-8 sm:pt-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-sky-500/30 bg-zinc-950/95 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Cover Banner */}
            {coverPicUrl ? (
              <div className="relative h-36 w-full overflow-hidden bg-zinc-900 border-b border-sky-500/20">
                <img
                  src={coverPicUrl}
                  alt="Cover Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
              </div>
            ) : (
              <div className="h-18 w-full bg-gradient-to-b from-sky-500/20 via-blue-600/10 to-transparent" />
            )}

            {/* Close / Back button */}
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full text-zinc-300 hover:text-white bg-black/50 hover:bg-black/80 transition-colors backdrop-blur-xs cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`p-6 sm:p-7 ${coverPicUrl ? '-mt-14' : ''} relative z-10`}>
              {/* 3D Circular Badge / Avatar */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-sky-500/40 ring-4 ring-sky-500/30 border-2 border-white/30 mb-4 overflow-hidden">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="Telegram Avatar"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Send className="w-9 h-9 -rotate-12 translate-x-0.5" />
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                {siteName} VIP Channel
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {popupTitle || 'Join Our Official Telegram'}
              </h3>

              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {popupDescription || 'Get instant 4K release links, new episode alerts, and direct movie requests!'}
              </p>

              <div className="mt-6 space-y-2.5">
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    showSuccessToast('Testing Link', 'Redirecting to your official Telegram channel');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all uppercase tracking-wider"
                >
                  <Send className="w-4 h-4 -rotate-12" />
                  Join Channel on Telegram
                </a>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Maybe Later (Dismiss)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
