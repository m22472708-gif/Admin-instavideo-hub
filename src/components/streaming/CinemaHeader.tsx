import React, { useState } from 'react';
import { Film, Search, Send, Sparkles, X, Menu } from 'lucide-react';
import { GeneralSettings } from '../../types';

interface CinemaHeaderProps {
  settings: GeneralSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export const CinemaHeader: React.FC<CinemaHeaderProps> = ({
  settings,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectCategory('All');
                onSearchChange('');
              }}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  {settings.siteName || 'StreamPulse'}
                  <span className="text-rose-500 text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    Cinema
                  </span>
                </span>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide">
                  Stream & 4K Direct Downloads
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Categories Quick Bar */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'text-white bg-rose-600 shadow-md shadow-rose-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Right Actions: Search + Telegram Join */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, web series..."
                className={`w-40 sm:w-56 md:w-64 pl-9 pr-8 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:w-72 transition-all`}
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Official Telegram Channel Link */}
            <a
              href={settings.telegramChannelUrl || 'https://t.me/your_channel'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-950/40 hover:shadow-sky-500/20 transition-all shrink-0"
              title="Join Official Telegram Channel"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span className="hidden sm:inline">Join Telegram</span>
            </a>

            {/* Mobile Category Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Open categories menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Categories */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-zinc-800/80 animate-in slide-in-from-top-2 duration-150">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Browse Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
