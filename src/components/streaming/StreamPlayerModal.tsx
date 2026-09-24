import React, { useState, useEffect } from 'react';
import { Video } from '../../types';
import {
  X,
  Play,
  Heart,
  Eye,
  Share2,
  ExternalLink,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { incrementFirestoreVideoView, incrementFirestoreVideoLike } from '../../services/firebase';

interface StreamPlayerModalProps {
  video: Video | null;
  onClose: () => void;
  telegramUrl: string;
  relatedVideos: Video[];
  onSelectVideo: (video: Video) => void;
}

export const StreamPlayerModal: React.FC<StreamPlayerModalProps> = ({
  video,
  onClose,
  telegramUrl,
  relatedVideos,
  onSelectVideo,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (video) {
      setLoadError(false);
      setHasLiked(false);
      setLikeCount(Number(video.likes) || 0);

      // Increment view count in Firebase Firestore automatically
      incrementFirestoreVideoView(video.id);
    }
  }, [video?.id]);

  if (!video) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLikeCount((prev) => prev + 1);
      incrementFirestoreVideoLike(video.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[94vh] my-0 sm:my-4 overflow-hidden">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Back to Streams</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
              {video.category}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Player & Details Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Video Screen */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {video.directLink ? (
              <video
                key={video.id}
                src={video.directLink}
                controls
                autoPlay
                poster={video.thumbnailUrl}
                className="w-full h-full object-contain"
                onError={() => setLoadError(true)}
              />
            ) : (
              <div className="text-center p-6 text-zinc-500">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Stream Destination Unavailable</p>
              </div>
            )}

            {/* Fallback if external provider restricts inline embed */}
            {loadError && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Direct Stream Link Verification
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  This CDN server limits cross-origin video playback inside iframes. You can open the direct stream stream in an external high-speed player.
                </p>
                <a
                  href={video.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open Fullscreen Stream</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Details & Actions Panel */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* Title & Interactive Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                    {video.category}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {video.duration || 'Full Movie'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {video.title}
                </h2>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-zinc-500" />
                    {(Number(video.views) || 0).toLocaleString()} Views
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                    {likeCount.toLocaleString()} Likes
                  </span>
                </div>
              </div>

              {/* Action Buttons: Like & Share */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    hasLiked
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
                  <span>{hasLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all"
                  title="Share link"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Synopsis Description */}
            {video.description && (
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {video.description}
              </div>
            )}

            {/* Official Telegram Join Banner inside Player */}
            <div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden bg-gradient-to-r from-sky-950/70 via-blue-950/60 to-zinc-950 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
                  <Send className="w-6 h-6 -rotate-12" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Want 4K Ultra HD & Faster Downloads?
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  </h4>
                  <p className="text-xs text-sky-200/80 mt-0.5">
                    Join our Telegram channel for direct WhatsApp links, new episodes & movie requests.
                  </p>
                </div>
              </div>

              <a
                href={telegramUrl || 'https://t.me/your_channel'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-950/60 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5 -rotate-12" />
                <span>Join Channel</span>
              </a>
            </div>

            {/* Related Videos in same category */}
            {relatedVideos.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  More in {video.category}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedVideos.slice(0, 4).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectVideo(rel)}
                      className="group cursor-pointer rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-rose-500/50 overflow-hidden transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black">
                        <img
                          src={rel.thumbnailUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono bg-black/80 text-white">
                          {rel.duration}
                        </span>
                      </div>
                      <div className="p-2">
                        <h5 className="text-xs font-semibold text-white group-hover:text-rose-400 truncate">
                          {rel.title}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
