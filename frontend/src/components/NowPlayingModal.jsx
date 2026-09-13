/**
 * SoundWave Music Experience
 * Fullscreen Player Modal & Dynamic Visualizer
 */

import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { useRoom } from '../context/RoomContext';
import { WavySlider } from './WavySlider';
import { EqualizerModal } from './EqualizerModal';
import { downloadTrack, isTrackDownloaded } from '../utils/downloadManager';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  Download,
  Share2,
  Volume2,
  VolumeX,
  ChevronDown,
  Clock,
  Sliders,
  ListMusic,
  Plus,
  Send,
  Sparkles,
  Check,
  Disc,
  Radio,
  MoreVertical,
  Layers,
  Gauge,
  Users,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { playSound } from '../utils/soundEffects';

const SLEEP_OPTIONS = [
  { label: '5 Minutes', value: 5 },
  { label: '10 Minutes', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '20 Minutes', value: 20 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes', value: 60 },
  { label: 'End of Current Song', value: 'end_of_song' }
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function NowPlayingModal({ isOpen, onClose }) {
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
    skipTime,
    isShuffle,
    setIsShuffle,
    isLoop,
    setIsLoop,
    favorites,
    toggleFavorite,
    isFavorite,
    setIsLyricsOpen,
    openQueue,
    openPlaylistModal,
    activeEqPreset,
    playbackSpeed,
    setSpeed,
    trackError,
    retryPlayback,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    sleepTimerOption,
    sleepTimeRemaining,
    setSleepTimer,
    cancelSleepTimer,
    sliderStyle = 'wavy',
    autoRadio = true,
    toggleAutoRadio,
    isDuoSyncEnabled = true,
    toggleDuoSync = () => {},
    duoPartnerPlaying = null,
    continuePartnerTrack = () => {},
    requestPartnerMusic = () => {},
    sendMusicToDuo
  } = useMusic();

  const { hasRoom, roomData, sendMessage, hasPartner, partner } = useRoom();

  const [isEqOpen, setIsEqOpen] = useState(false);
  const [sleepMenuOpen, setSleepMenuOpen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [volumeMenuOpen, setVolumeMenuOpen] = useState(false);
  const [isDuoMenuOpen, setIsDuoMenuOpen] = useState(false);
  const [isVinylMode, setIsVinylMode] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadToast, setDownloadToast] = useState('');
  const [heartBurst, setHeartBurst] = useState(false);
  const [isSendingDuo, setIsSendingDuo] = useState(false);
  const [duoSentToast, setDuoSentToast] = useState(null);

  useEffect(() => {
    if (currentTrack?.id) {
      try {
        setIsDownloaded(Boolean(isTrackDownloaded(currentTrack.id)));
      } catch {
        setIsDownloaded(false);
      }
    }
  }, [currentTrack?.id]);

  if (!isOpen || !currentTrack) return null;

  const liked = isFavorite(currentTrack.id);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleHeartClick = () => {
    toggleFavorite(currentTrack);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 800);
  };

  const handleDownload = async () => {
    if (isDownloading || isDownloaded) return;
    setIsDownloading(true);
    setDownloadToast('Downloading 320kbps offline track...');
    try {
      const success = await downloadTrack(currentTrack);
      if (success) {
        setIsDownloaded(true);
        setDownloadToast('Saved to Offline Library!');
      } else {
        setDownloadToast('Download failed');
      }
    } catch {
      setDownloadToast('Download error');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadToast(''), 3000);
    }
  };

  const handleSendToDuo = async () => {
    if (!currentTrack || isSendingDuo) return;
    setIsSendingDuo(true);
    try {
      const res = await sendMusicToDuo(currentTrack);
      setDuoSentToast(res?.message || `Sent "${currentTrack.title}" to Duo 💖`);
      setTimeout(() => setDuoSentToast(null), 3200);
    } catch (e) {
      setDuoSentToast(`Sent "${currentTrack.title}" to Duo 💖`);
      setTimeout(() => setDuoSentToast(null), 3200);
    } finally {
      setIsSendingDuo(false);
    }
  };

  const handleShareToChat = async () => {
    try {
      const shareUrl = `${window.location.origin}/?track=${encodeURIComponent(currentTrack?.id || '')}`;
      if (navigator.share) {
        await navigator.share({
          title: currentTrack?.title || 'Song',
          text: `Check out ${currentTrack?.title} by ${currentTrack?.artist} on SoundWave!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSharedToast(true);
        setTimeout(() => setSharedToast(false), 2500);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        navigator.clipboard?.writeText(window.location.href);
        setSharedToast(true);
        setTimeout(() => setSharedToast(false), 2500);
      }
    }
  };

  return (
    <>
      <div
        id="soundwave-fullscreen-player"
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Dynamic Album Art Ambient Glow Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <img
            src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'}
            alt=""
            className="w-full h-full object-cover filter blur-3xl scale-125 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-10 flex items-center justify-between px-6 py-4 pt-safe">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-200 hover:text-white"
            title="Minimize Player"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Playing from / Context Badge */}
          <div className="flex flex-col items-center max-w-[200px] sm:max-w-xs text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Playing From
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate w-full">
              {currentTrack.album || 'SoundWave Mix'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sleep Timer Indicator Pill */}
            {sleepTimerOption && (
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {sleepTimeRemaining || 'Active'}
              </div>
            )}

            {/* Vinyl mode toggle */}
            <button
              onClick={() => setIsVinylMode(!isVinylMode)}
              className={`p-2.5 rounded-full transition-all ${
                isVinylMode ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
              title="Vinyl Spin Animation"
            >
              <Disc className={`w-5 h-5 ${isVinylMode && isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            </button>
          </div>
        </header>

        {/* Center Section: Cover Artwork + Metadata */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
          {/* Artwork Container with Bursting Heart */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 my-auto cursor-pointer group"
            onDoubleClick={handleHeartClick}
          >
            <div
              className={`w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/10 ${
                isVinylMode ? 'rounded-full ring-8 ring-slate-900 shadow-emerald-500/20' : 'group-hover:scale-[1.02]'
              }`}
            >
              <img
                src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${
                  isVinylMode && isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '10s' }}
              />
            </div>

            {/* Heart Burst Particle Effect */}
            {heartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping duration-500">
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Title, Artist & Audio Format Badges */}
          <div className="w-full mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white truncate">
                {currentTrack.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium truncate mt-0.5">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LOSSLESS • 320 KBPS
                </span>
                {currentTrack.album && (
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {currentTrack.album}
                  </span>
                )}
              </div>
            </div>

            {/* Like Heart Button */}
            <button
              onClick={handleHeartClick}
              className={`p-3 rounded-full transition-transform active:scale-90 ${
                liked ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-7 h-7 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Wavy / Squiggly Interactive Slider */}
          <div className="w-full mt-6">
            <WavySlider
              value={currentTime}
              max={duration || 100}
              onChangeEnd={(newVal) => seekTo(newVal)}
              isPlaying={isPlaying}
              sliderStyle={sliderStyle}
              accentColor="#10b981"
              formatTime={formatTime}
            />
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          {/* Primary Playback Controls Row */}
          <div className="w-full flex items-center justify-between mt-6 px-4">
            {/* Shuffle */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2.5 rounded-full transition-colors ${
                isShuffle ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous Track */}
            <button
              onClick={prevTrack}
              className="p-3 rounded-full text-slate-200 hover:text-white active:scale-90 transition-transform"
              title="Previous Track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            {/* Morphing Play/Pause Button with Ripple Glow */}
            <button
              onClick={togglePlay}
              disabled={isBuffering}
              className="relative p-5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center group"
            >
              {isBuffering ? (
                <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              className="p-3 rounded-full text-slate-200 hover:text-white active:scale-90 transition-transform"
              title="Next Track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={() => setIsLoop(!isLoop)}
              className={`p-2.5 rounded-full transition-colors ${
                isLoop ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Repeat"
            >
              {isLoop ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Action Dock */}
        <footer className="relative z-10 px-6 py-4 pb-safe border-t border-white/10 bg-black/60 backdrop-blur-md">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {/* Synced Lyrics */}
            <button
              onClick={() => setIsLyricsOpen(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Mic2 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Lyrics</span>
            </button>

            {/* Queue Drawer */}
            <button
              onClick={openQueue}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ListMusic className="w-5 h-5" />
              <span className="text-[10px] font-medium">Queue</span>
            </button>

            {/* 10-Band EQ */}
            <button
              onClick={() => setIsEqOpen(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[10px] font-medium">EQ & FX</span>
            </button>

            {/* Sleep Timer */}
            <div className="relative">
              <button
                onClick={() => setSleepMenuOpen(!sleepMenuOpen)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  sleepTimerOption ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="text-[10px] font-medium">Timer</span>
              </button>

              {sleepMenuOpen && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 border-b border-white/5">
                    Sleep Timer
                  </div>
                  {SLEEP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSleepTimer(opt.value);
                        setSleepMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 text-slate-200 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                  {sleepTimerOption && (
                    <button
                      onClick={() => {
                        cancelSleepTimer();
                        setSleepMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Turn Off Timer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Speed Controller */}
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <Gauge className="w-5 h-5" />
                <span className="text-[10px] font-medium font-mono">{playbackSpeed}x</span>
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-36 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 border-b border-white/5">
                    Playback Speed
                  </div>
                  {SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setSpeed(spd);
                        setSpeedMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        playbackSpeed === spd ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {spd}x {spd === 1 && '(Normal)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Offline Download */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isDownloaded ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : isDownloaded ? (
                <Check className="w-5 h-5" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span className="text-[10px] font-medium">{isDownloaded ? 'Saved' : 'Download'}</span>
            </button>

            {/* Duo Music Send Option */}
            <button
              id="btn-nowplaying-duo-send"
              onClick={handleSendToDuo}
              disabled={isSendingDuo}
              className={`flex flex-col items-center gap-1 transition-all active:scale-90 group ${
                isSendingDuo ? 'text-pink-300' : 'text-pink-400 hover:text-pink-300'
              }`}
              title="Send Music to Duo 💖"
            >
              <div className="relative">
                <Heart
                  className={`w-5 h-5 fill-pink-500 text-pink-400 transition-transform ${
                    isSendingDuo ? 'scale-125 animate-ping' : 'group-hover:scale-110'
                  }`}
                />
                <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-pink-300">Duo</span>
            </button>
          </div>
        </footer>

        {/* Toasts */}
        {duoSentToast && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white font-bold text-xs shadow-2xl shadow-pink-500/50 flex items-center gap-2 animate-bounce z-50 whitespace-nowrap">
            <Heart className="w-4 h-4 fill-white text-white shrink-0" />
            <span>{duoSentToast}</span>
          </div>
        )}
        {sharedToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-500 text-black font-semibold text-xs shadow-xl animate-bounce">
            Song Shared!
          </div>
        )}
        {downloadToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-800 text-white border border-white/10 text-xs shadow-xl">
            {downloadToast}
          </div>
        )}
      </div>

      {/* Equalizer Modal */}
      <EqualizerModal isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
    </>
  );
}
