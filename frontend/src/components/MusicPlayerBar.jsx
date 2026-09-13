/**
 * SoundWave Music Experience
 * Floating Mini Player Bar
 */

import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Maximize2,
  Mic2,
  Clock,
  ListMusic,
  Sparkles
} from 'lucide-react';

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seekTo,
    toggleFavorite,
    isFavorite,
    openNowPlaying,
    setIsLyricsOpen,
    openQueue,
    sleepTimeRemaining,
    sendMusicToDuo
  } = useMusic();

  const [isSendingDuo, setIsSendingDuo] = useState(false);
  const [miniToast, setMiniToast] = useState(null);

  if (!currentTrack) return null;

  const liked = isFavorite(currentTrack.id);
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const handleSendToDuo = async () => {
    if (!currentTrack || isSendingDuo) return;
    setIsSendingDuo(true);
    try {
      const res = await sendMusicToDuo(currentTrack);
      setMiniToast(res?.message || `Sent "${currentTrack.title}" to Duo 💖`);
      setTimeout(() => setMiniToast(null), 3000);
    } catch (e) {
      setMiniToast(`Sent "${currentTrack.title}" to Duo 💖`);
      setTimeout(() => setMiniToast(null), 3000);
    } finally {
      setIsSendingDuo(false);
    }
  };

  return (
    <div
      id="soundwave-mini-player-bar"
      className="fixed bottom-0 left-0 right-0 z-30 px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none select-none"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto relative">
        {/* Floating Mini Toast for Duo Send */}
        {miniToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-xl shadow-pink-500/40 flex items-center gap-1.5 animate-bounce whitespace-nowrap z-50">
            <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
            <span>{miniToast}</span>
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col group">
          {/* Top Continuous Progress Line */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * (duration || 1);
              seekTo(newTime);
            }}
            className="w-full h-1 bg-white/10 hover:h-1.5 transition-all cursor-pointer relative"
          >
            <div
              className="h-full bg-emerald-500 rounded-r-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
            {/* Track Info (Tap expands to Full Player) */}
            <div
              onClick={openNowPlaying}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img
                  src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-full bg-emerald-400 animate-pulse" />
                      <span className="w-0.5 h-2/3 bg-emerald-400 animate-pulse delay-75" />
                      <span className="w-0.5 h-4/5 bg-emerald-400 animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span>{currentTrack.artist}</span>
                  {sleepTimeRemaining && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {sleepTimeRemaining}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions & Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Dedicated Send to Duo Button */}
              <button
                id="mini-bar-duo-btn"
                onClick={handleSendToDuo}
                disabled={isSendingDuo}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 hover:text-white border border-pink-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all active:scale-90 shadow-sm shrink-0"
                title="Send Music to Duo 💖"
              >
                <Heart className={`w-3.5 h-3.5 fill-pink-500 text-pink-400 ${isSendingDuo ? 'scale-125 animate-ping' : ''}`} />
                <span>Duo</span>
              </button>

              {/* Like Heart */}
              <button
                onClick={() => toggleFavorite(currentTrack)}
                className={`p-2 rounded-full transition-transform active:scale-90 ${
                  liked ? 'text-rose-500' : 'text-slate-400 hover:text-white'
                }`}
                title="Like Track"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Previous */}
              <button
                onClick={prevTrack}
                className="p-2 text-slate-400 hover:text-white transition-all active:scale-95 hidden xs:block"
                title="Previous"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                disabled={isBuffering}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/30"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="p-2 text-slate-400 hover:text-white transition-all active:scale-95"
                title="Next"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Synced Lyrics Shortcut */}
              <button
                onClick={() => setIsLyricsOpen(true)}
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors hidden sm:block"
                title="Synced Lyrics"
              >
                <Mic2 className="w-4 h-4" />
              </button>

              {/* Queue Shortcut */}
              <button
                onClick={openQueue}
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors hidden sm:block"
                title="Queue"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
