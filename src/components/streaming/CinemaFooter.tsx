import React from 'react';
import { Film, Send, ShieldCheck, Heart } from 'lucide-react';
import { GeneralSettings } from '../../types';

interface CinemaFooterProps {
  settings: GeneralSettings;
  onOpenManager?: () => void;
}

export const CinemaFooter: React.FC<CinemaFooterProps> = ({ settings, onOpenManager }) => {
  return (
    <footer className="mt-16 border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                {settings.siteName || 'StreamPulse'} Cinema
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm">
              Unlimited high-definition streaming, web series, trailers, and instant 4K release links via Telegram.
            </p>
          </div>

          {/* Quick Telegram Button */}
          <div className="flex items-center gap-3">
            <a
              href={settings.telegramChannelUrl || 'https://t.me/your_channel'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Official Telegram Community</span>
            </a>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Manager Link */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} {settings.siteName || 'StreamPulse'}. Connected to Firebase Realtime Cloud.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              Powered by <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for stream viewers
            </span>

            {/* Discreet Owner Portal Access */}
            {onOpenManager && (
              <button
                type="button"
                onClick={onOpenManager}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 underline transition-colors"
                title="Manage Videos & Banners"
              >
                Owner Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
