import React, { useState, useEffect } from 'react';
import { Banner, Video } from '../../types';
import { Play, Sparkles, Send, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  banners: Banner[];
  onPlayFeatured?: () => void;
  telegramUrl: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  onPlayFeatured,
  telegramUrl,
}) => {
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 7 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl group">
      {/* Background Backdrop Image */}
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Cinematic Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />

      {/* Content Info Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-12 max-w-3xl">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-rose-600 text-white shadow-lg shadow-rose-950/50">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            {currentBanner.badge}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            4K Ultra HD · Direct Stream
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight line-clamp-2">
          {currentBanner.title}
        </h1>

        {/* Teaser Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 mt-2 sm:mt-3 leading-relaxed line-clamp-2 drop-shadow-sm max-w-2xl">
          {currentBanner.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-6">
          <button
            type="button"
            onClick={onPlayFeatured}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-950/60 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch Now</span>
          </button>

          <a
            href={telegramUrl || 'https://t.me/your_channel'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 font-bold text-xs sm:text-sm transition-all backdrop-blur-md"
          >
            <Send className="w-3.5 h-3.5 text-sky-400 -rotate-12" />
            <span>Get 4K Telegram Link</span>
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-4 sm:right-8 flex items-center gap-1.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-rose-500' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
