import React from 'react';
import { Video } from '../../types';
import { Play, Eye, Heart, Clock, Film } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onLikeVideo?: (video: Video) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onSelectVideo }) => {
  if (videos.length === 0) {
    return (
      <div className="py-16 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-8">
        <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Videos Found</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          No streams match your selected category or search filter. Try clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
      {videos.map((video) => (
        <div
          key={video.id}
          onClick={() => onSelectVideo(video)}
          className="group relative bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/30 flex flex-col cursor-pointer"
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-[16/10] sm:aspect-video w-full bg-black overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* Corner Duration Badge */}
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-xs border border-white/10 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-rose-400" />
              {video.duration || 'HD'}
            </span>

            {/* Category Tag on Top-Left */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-600/90 text-white shadow-sm">
              {video.category}
            </span>

            {/* Center Play Button on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950/80 scale-75 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              </div>
            </div>
          </div>

          {/* Video Metadata Content */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                  {video.description}
                </p>
              )}
            </div>

            {/* Metrics Footer */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-800/60">
              <span className="flex items-center gap-1 text-zinc-300">
                <Eye className="w-3 h-3 text-zinc-500" />
                {video.views ? Number(video.views).toLocaleString() : 0}
              </span>

              <span className="flex items-center gap-1 text-rose-400">
                <Heart className="w-3 h-3 fill-rose-500/20" />
                {video.likes ? Number(video.likes).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
