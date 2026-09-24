import React, { useState } from 'react';
import { Video } from '../../types';
import { X, ExternalLink, Film, AlertTriangle, ArrowLeft } from 'lucide-react';

interface VideoTestModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoTestModal: React.FC<VideoTestModalProps> = ({ video, onClose }) => {
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh] my-0 sm:my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Prominent Back Button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold mr-1 transition-colors"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Back</span>
            </button>

            <div className="p-1.5 rounded-lg bg-rose-600/20 text-rose-500 border border-rose-500/30 shrink-0 hidden sm:block">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">Test Stream Verification</h3>
              <p className="text-[11px] text-zinc-400 truncate">{video.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player Box */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {video.directLink ? (
              <video
                src={video.directLink}
                controls
                autoPlay
                poster={video.thumbnailUrl}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setLoadError(true)}
              />
            ) : (
              <div className="text-center p-6 text-zinc-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-xs">No direct stream URL defined</p>
              </div>
            )}

            {loadError && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center text-zinc-300">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-white">Stream restricted or CORS protected</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Some CDNs restrict inline player embedding. You can verify this stream in an external tab.
                </p>
                <a
                  href={video.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
                >
                  Open in External Tab <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Stream Link Details */}
          <div className="p-4 sm:p-5 space-y-3 bg-zinc-900">
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Destination Direct Link
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                <span className="truncate flex-1">{video.directLink}</span>
                <a
                  href={video.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                  title="Open Direct Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Category</span>
                <span className="font-medium text-white">{video.category}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Duration Corner Badge</span>
                <span className="font-medium text-white font-mono">{video.duration}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 col-span-2 sm:col-span-1">
                <span className="text-zinc-500 block text-[10px]">Live Metrics</span>
                <span className="font-medium text-emerald-400 font-mono">
                  {video.views.toLocaleString()} views · {video.likes.toLocaleString()} likes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 z-30 px-4 sm:px-5 py-3 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Video Manager</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
          >
            Done Testing
          </button>
        </div>
      </div>
    </div>
  );
};
