import React, { useState, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { GeneralSettings } from '../../types';

export interface TelegramGlassPopupProps {
  settings: GeneralSettings;
  isOpen?: boolean;
  onDismiss?: () => void;
  isSimulatedContainer?: boolean;
}

export const TelegramGlassPopup: React.FC<TelegramGlassPopupProps> = ({
  settings,
  isOpen,
  onDismiss,
  isSimulatedContainer = false,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [profilePicError, setProfilePicError] = useState(false);
  const [coverPicError, setCoverPicError] = useState(false);

  // Controlled vs Uncontrolled visibility
  const isControlled = typeof isOpen === 'boolean';
  const isVisible = isControlled ? isOpen : internalVisible;

  // Reset image error states if URLs change
  useEffect(() => {
    setProfilePicError(false);
  }, [settings.telegramProfilePicUrl]);

  useEffect(() => {
    setCoverPicError(false);
  }, [settings.telegramCoverPicUrl]);

  useEffect(() => {
    if (isControlled) return;

    if (!settings.telegramPopupEnabled || hasDismissed) {
      setInternalVisible(false);
      return;
    }

    const delayMs = (settings.telegramPopupDelaySec || 4) * 1000;
    const timer = setTimeout(() => {
      setInternalVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings.telegramPopupEnabled, settings.telegramPopupDelaySec, hasDismissed, isControlled]);

  if (!isVisible || !settings.telegramPopupEnabled) return null;

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
    setInternalVisible(false);
    setHasDismissed(true);
  };

  const containerPositionClasses = isSimulatedContainer
    ? 'absolute inset-0 z-40'
    : 'fixed inset-0 z-50';

  const hasCoverPic = Boolean(settings.telegramCoverPicUrl?.trim()) && !coverPicError;
  const hasProfilePic = Boolean(settings.telegramProfilePicUrl?.trim()) && !profilePicError;

  return (
    <div
      className={`${containerPositionClasses} overflow-y-auto bg-black/80 backdrop-blur-md p-3.5 sm:p-5 flex justify-center items-center animate-in fade-in duration-300`}
    >
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden border border-sky-500/40 bg-zinc-950/95 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200 my-auto">
        {/* Top Header Cover Banner */}
        {hasCoverPic ? (
          <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-zinc-900 border-b border-sky-500/20">
            <img
              src={settings.telegramCoverPicUrl}
              alt="Telegram Cover Banner"
              className="w-full h-full object-cover"
              onError={() => setCoverPicError(true)}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>
        ) : (
          <div className="relative h-20 sm:h-24 w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 border-b border-sky-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-xs transition-colors cursor-pointer ring-1 ring-white/10"
          aria-label="Dismiss Telegram Alert"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Content Body with Overlapping Avatar */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-7 -mt-10 sm:-mt-12 relative z-10 flex flex-col items-center">
          {/* 3D Circular Avatar Badge */}
          <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-sky-500/40 ring-4 ring-sky-500/25 border-3 border-zinc-950 mb-3 overflow-hidden shrink-0">
            {hasProfilePic ? (
              <img
                src={settings.telegramProfilePicUrl}
                alt="Telegram Channel Avatar"
                className="w-full h-full object-cover rounded-full"
                onError={() => setProfilePicError(true)}
              />
            ) : (
              <Send className="w-8 h-8 sm:w-10 sm:h-10 -rotate-12 translate-x-0.5 text-white" />
            )}
          </div>

          {/* Channel Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
            <Sparkles className="w-3 h-3 text-sky-400" />
            {settings.siteName || 'StreamPulse'} Official VIP
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            {settings.telegramPopupTitle || 'Join Our Official Telegram'}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            {settings.telegramPopupDescription ||
              'Get instant 4K release links, new episode alerts, and direct movie requests!'}
          </p>

          {/* Action Buttons */}
          <div className="mt-5 sm:mt-6 w-full space-y-2">
            <a
              href={settings.telegramChannelUrl || 'https://t.me/streampulse_official'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-950/70 hover:shadow-sky-500/40 transition-all uppercase tracking-wider active:scale-[0.98]"
            >
              <Send className="w-4 h-4 -rotate-12" />
              <span>Join Telegram Channel</span>
            </a>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Continue to Cinema Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
