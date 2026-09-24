import React, { useState, useEffect } from 'react';
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
  const [delaySec, setDelaySec] = useState<number | string>(settings.telegramPopupDelaySec || 4);
  const [enabled, setEnabled] = useState<boolean>(settings.telegramPopupEnabled ?? true);
  const [siteName, setSiteName] = useState(settings.siteName || 'StreamPulse');
  const [isSaving, setIsSaving] = useState(false);

  // Simulator modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(4);

  // Sync state when props change
  useEffect(() => {
    setChannelUrl(settings.telegramChannelUrl);
    setPopupTitle(settings.telegramPopupTitle);
    setPopupDescription(settings.telegramPopupDescription);
    setDelaySec(settings.telegramPopupDelaySec || 4);
    setEnabled(settings.telegramPopupEnabled ?? true);
    setSiteName(settings.siteName || 'StreamPulse');
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
    setIsCountingDown(true);
    setRemainingTime(delaySec);
    setIsPreviewModalOpen(false);

    let timeLeft = delaySec;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setIsCountingDown(false);
        setIsPreviewModalOpen(true);
      }
    }, 1000);
  };

  const openInstantPreview = () => {
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
            <div className="relative rounded-2xl overflow-hidden p-6 border border-sky-500/30 bg-gradient-to-br from-zinc-950/90 via-sky-950/40 to-zinc-950/95 backdrop-blur-xl shadow-2xl text-center">
              {/* Background ambient light */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Glowing Telegram Icon */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-sky-500/20 mb-4 animate-pulse">
                  <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
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
          <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 border border-sky-500/30 bg-zinc-950/95 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200 my-auto">
            {/* Close / Back button */}
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Telegram Icon */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-sky-500/40 ring-4 ring-sky-500/20 mb-4">
              <Send className="w-9 h-9 -rotate-12 translate-x-0.5" />
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
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Maybe Later (Dismiss)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
