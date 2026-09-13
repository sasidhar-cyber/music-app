/**
 * SoundWave Music Experience
 * Synced Lyrics & Romanization Viewer
 */

import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import api from '../services/api';
import {
  Mic2,
  X,
  Type,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Music,
  Clock,
  Languages,
  AlignLeft,
  AlignCenter,
  Globe
} from 'lucide-react';

export function LyricsModal() {
  const {
    isLyricsOpen,
    setIsLyricsOpen,
    currentTrack,
    currentTime,
    seekTo,
    lyricsFontSize = 20,
    setLyricsFontSize,
    lyricsOffsetMs = 0,
    setLyricsOffsetMs
  } = useMusic();

  const [loading, setLoading] = useState(false);
  const [syncedLines, setSyncedLines] = useState([]);
  const [plainLyrics, setPlainLyrics] = useState('');
  const [currentLineIdx, setCurrentLineIdx] = useState(-1);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [textAlign, setTextAlign] = useState('left'); // 'left' | 'center'
  const [showRomanization, setShowRomanization] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [provider, setProvider] = useState('LRCLIB / KuGou');

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Parse LRC timestamps [mm:ss.xx]
  const parseLrc = (lrcString) => {
    if (!lrcString) return [];
    const lines = lrcString.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = parseInt(match[3].padEnd(3, '0'), 10);
        const time = min * 60 + sec + ms / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          result.push({ time, text });
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
  };

  // Fetch Lyrics on Track Change / Modal Open
  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;

    setLoading(true);
    setSyncedLines([]);
    setPlainLyrics('');
    setCurrentLineIdx(-1);

    api.getMusicLyrics(currentTrack.title, currentTrack.artist)
      .then((res) => {
        if (res.syncedLyrics) {
          const parsed = parseLrc(res.syncedLyrics);
          setSyncedLines(parsed);
          setProvider(res.source || 'LRCLIB Synced');
        } else if (res.plainLyrics) {
          setPlainLyrics(res.plainLyrics);
          setProvider(res.source || 'Genius / KuGou');
        } else {
          setPlainLyrics(`🎵 ${currentTrack.title}\n\nLyrics currently unavailable for this track.`);
        }
      })
      .catch(() => {
        setPlainLyrics(`🎵 ${currentTrack.title}\n\nLyrics currently unavailable.`);
      })
      .finally(() => setLoading(false));
  }, [isLyricsOpen, currentTrack?.id]);

  // Synchronize Active Line based on Current Time + Offset
  useEffect(() => {
    if (syncedLines.length === 0) return;

    const adjustedTime = currentTime + lyricsOffsetMs / 1000;
    let activeIdx = -1;

    for (let i = 0; i < syncedLines.length; i++) {
      if (adjustedTime >= syncedLines[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }

    setCurrentLineIdx(activeIdx);

    // Auto-scroll to active line if not in manual scroll mode
    if (!isManualScroll && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, syncedLines, lyricsOffsetMs, isManualScroll]);

  // Handle user manual scroll with auto-resume timer
  const handleUserScroll = () => {
    setIsManualScroll(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsManualScroll(false);
    }, 4000);
  };

  if (!isLyricsOpen || !currentTrack) return null;

  return (
    <div
      id="soundwave-lyrics-view"
      className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Ambient Artwork Blurred Glow Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <img
          src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'}
          alt=""
          className="w-full h-full object-cover filter blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 pt-safe border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Mic2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold truncate text-white">{currentTrack.title}</h2>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
              <span>{currentTrack.artist}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 text-[10px]">{provider}</span>
            </p>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Text Alignment */}
          <button
            onClick={() => setTextAlign(textAlign === 'left' ? 'center' : 'left')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Text Alignment"
          >
            {textAlign === 'left' ? <AlignCenter className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
          </button>

          {/* Romanization / Transliteration Toggle */}
          <button
            onClick={() => setShowRomanization(!showRomanization)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              showRomanization ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="Toggle Romanized Pronunciation"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Romaji</span>
          </button>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setLyricsFontSize(Math.max(14, lyricsFontSize - 2))}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-200">{lyricsFontSize}</span>
            <button
              onClick={() => setLyricsFontSize(Math.min(32, lyricsFontSize + 2))}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={() => setIsLyricsOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Lyrics Container */}
      <div
        ref={containerRef}
        onScroll={handleUserScroll}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-12 scroll-smooth"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Fetching synced lyrics from LRCLIB / KuGou...</p>
          </div>
        ) : syncedLines.length > 0 ? (
          <div
            className={`max-w-2xl mx-auto space-y-6 ${
              textAlign === 'center' ? 'text-center' : 'text-left'
            }`}
          >
            {syncedLines.map((line, idx) => {
              const isActive = idx === currentLineIdx;
              const isPast = idx < currentLineIdx;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seekTo(line.time)}
                  className={`cursor-pointer transition-all duration-300 group py-1.5 px-3 rounded-2xl ${
                    isActive
                      ? 'text-white font-bold scale-105 bg-emerald-500/10'
                      : isPast
                      ? 'text-slate-400 opacity-60 hover:opacity-100 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={{ fontSize: `${lyricsFontSize}px`, lineHeight: 1.6 }}
                >
                  <p className="tracking-wide">
                    {line.text}
                  </p>
                  {showRomanization && (
                    <p className="text-xs text-emerald-400 font-mono opacity-80 mt-1">
                      {line.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`max-w-2xl mx-auto whitespace-pre-line text-slate-300 font-medium ${
              textAlign === 'center' ? 'text-center' : 'text-left'
            }`}
            style={{ fontSize: `${lyricsFontSize}px`, lineHeight: 1.8 }}
          >
            {plainLyrics}
          </div>
        )}
      </div>

      {/* Manual Scroll Resume Pill */}
      {isManualScroll && syncedLines.length > 0 && (
        <div className="relative z-10 py-3 flex justify-center bg-black/60 backdrop-blur-md">
          <button
            onClick={() => {
              setIsManualScroll(false);
              if (activeLineRef.current) {
                activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="px-4 py-1.5 rounded-full bg-emerald-500 text-black font-semibold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Resume Auto-Scroll
          </button>
        </div>
      )}
    </div>
  );
}
