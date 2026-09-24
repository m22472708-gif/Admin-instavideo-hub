import React, { useState, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { GeneralSettings } from '../../types';

interface TelegramGlassPopupProps {
  settings: GeneralSettings;
}

export const TelegramGlassPopup: React.FC<TelegramGlassPopupProps> = ({ settings }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (!settings.telegramPopupEnabled || hasDismissed) {
      setIsVisible(false);
      return;
    }

    const delayMs = (settings.telegramPopupDelaySec || 4) * 1000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings.telegramPopupEnabled, settings.telegramPopupDelaySec, hasDismissed]);

  if (!isVisible || !settings.telegramPopupEnabled) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 flex justify-center items-start sm:items-center pt-8 sm:pt-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 border border-sky-500/40 bg-zinc-950/95 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss Telegram Alert"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Telegram Icon */}
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-2xl shadow-sky-500/50 ring-4 ring-sky-500/25 mb-4 animate-pulse">
          <Send className="w-9 h-9 -rotate-12 translate-x-0.5" />
        </div>

        {/* Channel Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          {settings.siteName || 'StreamPulse'} Official Community
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {settings.telegramPopupTitle || 'Join Our Official Telegram'}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed max-w-sm mx-auto">
          {settings.telegramPopupDescription ||
            'Get instant 4K release links, new episode alerts, and direct movie requests!'}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <a
            href={settings.telegramChannelUrl || 'https://t.me/your_channel'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-950/70 hover:shadow-sky-500/40 transition-all uppercase tracking-wider"
          >
            <Send className="w-4 h-4 -rotate-12" />
            <span>Join Telegram Channel</span>
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Continue to Cinema Player
          </button>
        </div>
      </div>
    </div>
  );
};
