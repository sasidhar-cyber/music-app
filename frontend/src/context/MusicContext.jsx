import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import api, { resolveStreamUrl } from '../services/api';
import { getSocket } from '../services/socket';
import { playSound } from '../utils/soundEffects';

const MusicContext = createContext();

const THEMES = [
  { id: 'spotify', name: 'SoundWave Emerald', primary: '#10b981', gradient: 'from-emerald-500 to-green-600', ring: 'ring-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500' },
  { id: 'cyber_cyan', name: 'Cyber Cyan', primary: '#06b6d4', gradient: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500', border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500' },
  { id: 'purple_twilight', name: 'Royal Violet', primary: '#a855f7', gradient: 'from-purple-500 to-indigo-600', ring: 'ring-purple-500', border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500' },
  { id: 'neon_pink', name: 'Crimson Rose', primary: '#f43f5e', gradient: 'from-rose-500 to-pink-600', ring: 'ring-rose-500', border: 'border-rose-500', text: 'text-rose-400', bg: 'bg-rose-500' },
  { id: 'sunset_amber', name: 'Sunset Amber', primary: '#f59e0b', gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-500', border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500' },
  { id: 'amoled', name: 'Pure AMOLED Dark', primary: '#ffffff', gradient: 'from-slate-700 to-slate-950', ring: 'ring-slate-400', border: 'border-slate-400', text: 'text-white', bg: 'bg-slate-800' }
];

export const EQ_BANDS = [
  { key: 'f32', freq: 32, type: 'lowshelf', label: 'Sub-Bass' },
  { key: 'f64', freq: 64, type: 'peaking', q: 1.4, label: 'Bass' },
  { key: 'f125', freq: 125, type: 'peaking', q: 1.4, label: 'Upper Bass' },
  { key: 'f250', freq: 250, type: 'peaking', q: 1.4, label: 'Low Mid' },
  { key: 'f500', freq: 500, type: 'peaking', q: 1.4, label: 'Mid' },
  { key: 'f1k', freq: 1000, type: 'peaking', q: 1.4, label: 'Mid Range' },
  { key: 'f2k', freq: 2000, type: 'peaking', q: 1.4, label: 'High Mid' },
  { key: 'f4k', freq: 4000, type: 'peaking', q: 1.4, label: 'Presence' },
  { key: 'f8k', freq: 8000, type: 'peaking', q: 1.4, label: 'Treble' },
  { key: 'f16k', freq: 16000, type: 'highshelf', label: 'Brilliance' }
];

export const DEFAULT_EQ_VALUES = {
  f32: 0,
  f64: 0,
  f125: 0,
  f250: 0,
  f500: 0,
  f1k: 0,
  f2k: 0,
  f4k: 0,
  f8k: 0,
  f16k: 0,
  bass: 0,
  mid: 0,
  treble: 0
};

export const EQ_PRESETS = {
  'Flat': { f32: 0, f64: 0, f125: 0, f250: 0, f500: 0, f1k: 0, f2k: 0, f4k: 0, f8k: 0, f16k: 0, bass: 0, mid: 0, treble: 0 },
  'Bass Boost': { f32: 9, f64: 8, f125: 6, f250: 3, f500: 1, f1k: 0, f2k: 0, f4k: -1, f8k: -1, f16k: -2, bass: 8, mid: 1, treble: -1 },
  'Treble Boost': { f32: -2, f64: -2, f125: -1, f250: 0, f500: 1, f1k: 2, f2k: 4, f4k: 6, f8k: 8, f16k: 9, bass: -2, mid: 2, treble: 8 },
  'Treble': { f32: -2, f64: -2, f125: -1, f250: 0, f500: 1, f1k: 2, f2k: 4, f4k: 6, f8k: 8, f16k: 9, bass: -2, mid: 2, treble: 8 },
  'Vocal Boost': { f32: -3, f64: -2, f125: 0, f250: 2, f500: 5, f1k: 6, f2k: 5, f4k: 3, f8k: 1, f16k: 0, bass: -2, mid: 6, treble: 1 },
  'Vocal': { f32: -3, f64: -2, f125: 0, f250: 2, f500: 5, f1k: 6, f2k: 5, f4k: 3, f8k: 1, f16k: 0, bass: -2, mid: 6, treble: 1 },
  'Electronic': { f32: 6, f64: 5, f125: 3, f250: 0, f500: -1, f1k: 2, f2k: 1, f4k: 3, f8k: 5, f16k: 6, bass: 5, mid: 1, treble: 5 },
  'Rock': { f32: 5, f64: 4, f125: 3, f250: 1, f500: -1, f1k: -1, f2k: 1, f4k: 3, f8k: 5, f16k: 6, bass: 4, mid: -1, treble: 5 },
  'Pop': { f32: 2, f64: 3, f125: 4, f250: 2, f500: 0, f1k: 1, f2k: 2, f4k: 4, f8k: 4, f16k: 3, bass: 3, mid: 1, treble: 4 },
  'Balanced': { f32: 2, f64: 2, f125: 1, f250: 1, f500: 0, f1k: 0, f2k: 1, f4k: 2, f8k: 2, f16k: 1, bass: 2, mid: 0, treble: 2 },
  'Jazz': { f32: 3, f64: 3, f125: 2, f250: 1, f500: 2, f1k: 2, f2k: 1, f4k: 2, f8k: 3, f16k: 3, bass: 3, mid: 2, treble: 3 }
};

export function MusicProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [trackError, setTrackError] = useState(null);

  // Favorites (Synced with DB + Local Storage)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soundwave_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Playlists
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistTrackToAdd, setPlaylistTrackToAdd] = useState(null);

  // Collaborative Duo Queue & Voting
  const [queueVotes, setQueueVotes] = useState({});
  const [queueSortMode, setQueueSortMode] = useState('votes'); // 'votes' | 'manual'
  const [duoQueueToast, setDuoQueueToast] = useState(null);

  // History & Statistics
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soundwave_recently_played') || '[]');
    } catch {
      return [];
    }
  });
  const [userTasteArtists, setUserTasteArtists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soundwave_taste_artists') || '[]');
    } catch {
      return [];
    }
  });

  // Queue Drawer & Modals
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Lyrics Settings
  const [lyricsFontSize, setLyricsFontSize] = useState(18);
  const [lyricsOffsetMs, setLyricsOffsetMs] = useState(0);

  // Equalizer (10-Band Web Audio Engine)
  const [activeEqPreset, setActiveEqPreset] = useState(() => {
    return localStorage.getItem('soundwave_eq_preset') || 'Flat';
  });
  const [customEqValues, setCustomEqValues] = useState(() => {
    try {
      const saved = localStorage.getItem('soundwave_eq_values');
      return saved ? JSON.parse(saved) : DEFAULT_EQ_VALUES;
    } catch {
      return DEFAULT_EQ_VALUES;
    }
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volumeNormalization, setVolumeNormalization] = useState(() => {
    return localStorage.getItem('soundwave_vol_normalization') === 'true';
  });

  // SoundWave UI & Playback Settings
  const [sliderStyle, setSliderStyleState] = useState(() => localStorage.getItem('soundwave_slider_style') || localStorage.getItem('metrolist_slider_style') || 'wavy');
  const [autoRadio, setAutoRadioState] = useState(() => (localStorage.getItem('soundwave_auto_radio') || localStorage.getItem('metrolist_auto_radio')) !== 'false');
  const [audioQuality, setAudioQualityState] = useState(() => localStorage.getItem('soundwave_audio_quality') || localStorage.getItem('metrolist_audio_quality') || '320');
  const [crossfadeSec, setCrossfadeSecState] = useState(() => Number(localStorage.getItem('soundwave_crossfade') || localStorage.getItem('metrolist_crossfade')) || 0);
  const [skipSilence, setSkipSilenceState] = useState(() => (localStorage.getItem('soundwave_skip_silence') || localStorage.getItem('metrolist_skip_silence')) === 'true');

  const setSliderStyle = (val) => {
    setSliderStyleState(val);
    localStorage.setItem('soundwave_slider_style', val);
  };

  const toggleAutoRadio = () => {
    setAutoRadioState((prev) => {
      const next = !prev;
      localStorage.setItem('soundwave_auto_radio', String(next));
      return next;
    });
  };

  const setAudioQuality = (val) => {
    setAudioQualityState(val);
    localStorage.setItem('soundwave_audio_quality', val);
  };

  const setCrossfadeSec = (val) => {
    setCrossfadeSecState(val);
    localStorage.setItem('soundwave_crossfade', String(val));
  };

  const setSkipSilence = (val) => {
    setSkipSilenceState(val);
    localStorage.setItem('soundwave_skip_silence', String(val));
  };

  // Sleep Timer
  const [sleepTimerOption, setSleepTimerOption] = useState(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);
  const sleepTimerRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  // Theme & Customizable App Disguise Name
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('soundwave_theme') || 'spotify');
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('soundwave_app_title') || 'SoundWave');

  // SoundWave Speed Dial Pins (Up to 12 quick access items)
  const [speedDialPins, setSpeedDialPins] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soundwave_speed_dial_pins') || localStorage.getItem('metrolist_speed_dial_pins') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('soundwave_speed_dial_pins', JSON.stringify(speedDialPins));
  }, [speedDialPins]);

  const pinToSpeedDial = (item) => {
    if (!item || !item.id) return;
    setSpeedDialPins((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      if (prev.length >= 12) {
        return [...prev.slice(1), item];
      }
      return [...prev, item];
    });
  };

  const unpinFromSpeedDial = (itemId) => {
    setSpeedDialPins((prev) => prev.filter((p) => p.id !== itemId));
  };

  const isPinnedToSpeedDial = (itemId) => {
    return speedDialPins.some((p) => p.id === itemId);
  };

  // Secret Steganography Vault Chat State
  const [isSecretChatOpen, setIsSecretChatOpen] = useState(false);

  // Duo Listening Together Sync Feature
  const [isDuoSyncEnabled, setIsDuoSyncEnabled] = useState(() => {
    return localStorage.getItem('soundwave_duo_sync') !== 'false';
  });
  const [duoPartnerPlaying, setDuoPartnerPlaying] = useState(null);
  const [duoToast, setDuoToast] = useState(null);

  const toggleDuoSync = () => {
    setIsDuoSyncEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('soundwave_duo_sync', String(next));
      return next;
    });
  };

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const filtersRef = useRef({});
  const preampGainRef = useRef(null);
  const bassFilterRef = useRef(null);
  const midFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const compressorRef = useRef(null);

  // Save favorites & history to localStorage
  useEffect(() => {
    localStorage.setItem('soundwave_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Clear recently played history
  const clearHistory = () => {
    setRecentlyPlayed([]);
    try {
      localStorage.removeItem('soundwave_recently_played');
    } catch {}
  };

  useEffect(() => {
    localStorage.setItem('soundwave_recently_played', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem('soundwave_taste_artists', JSON.stringify(userTasteArtists));
  }, [userTasteArtists]);

  // Load User DB Favorites & Playlists on mount
  useEffect(() => {
    api.getFavorites()
      .then((res) => {
        if (res.favorites && res.favorites.length > 0) {
          setFavorites(res.favorites);
        }
      })
      .catch(() => {});

    api.getPlaylists()
      .then((res) => {
        if (res.playlists) setPlaylists(res.playlists);
      })
      .catch(() => {});
  }, []);

  // Real 10-Band Equalizer Init (Web Audio API)
  const initEqualizer = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      return;
    }
    if (!audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // Dynamics Compressor for clean headroom without digital clipping
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);
      compressorRef.current = compressor;

      // Preamp Gain Node
      const preamp = ctx.createGain();
      preamp.gain.setValueAtTime(1.0, ctx.currentTime);
      preampGainRef.current = preamp;

      // Create 10 BiquadFilterNodes chained in series
      const filterNodes = {};
      let lastNode = source;

      EQ_BANDS.forEach(({ key, freq, type, q }) => {
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.setValueAtTime(freq, ctx.currentTime);
        if (q) filter.Q.setValueAtTime(q, ctx.currentTime);
        const initialGain = customEqValues[key] !== undefined ? customEqValues[key] : 0;
        filter.gain.setValueAtTime(initialGain, ctx.currentTime);

        lastNode.connect(filter);
        lastNode = filter;
        filterNodes[key] = filter;
      });

      filtersRef.current = filterNodes;

      // Backward compatible single filter refs
      bassFilterRef.current = filterNodes.f64;
      midFilterRef.current = filterNodes.f1k;
      trebleFilterRef.current = filterNodes.f8k;

      // Connect: source -> 10 filters -> preamp -> compressor -> destination
      lastNode.connect(preamp);
      preamp.connect(compressor);
      compressor.connect(ctx.destination);

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('[Equalizer] AudioContext init handled:', e);
    }
  };

  const applyEqPreset = (presetName) => {
    setActiveEqPreset(presetName);
    localStorage.setItem('soundwave_eq_preset', presetName);
    initEqualizer();

    const targetValues = EQ_PRESETS[presetName] || EQ_PRESETS['Flat'];
    setCustomEqValues(targetValues);
    try {
      localStorage.setItem('soundwave_eq_values', JSON.stringify(targetValues));
    } catch {}

    const ctx = audioContextRef.current;
    if (ctx && filtersRef.current) {
      EQ_BANDS.forEach(({ key }) => {
        const node = filtersRef.current[key];
        const gainVal = targetValues[key] !== undefined ? targetValues[key] : 0;
        if (node) {
          try {
            node.gain.setTargetAtTime(gainVal, ctx.currentTime, 0.05);
          } catch {
            node.gain.value = gainVal;
          }
        }
      });
    }
  };

  const setCustomEqBand = (band, value) => {
    initEqualizer();
    const num = parseFloat(value) || 0;
    setActiveEqPreset('Custom');
    localStorage.setItem('soundwave_eq_preset', 'Custom');

    const ctx = audioContextRef.current;
    if (ctx && filtersRef.current) {
      if (filtersRef.current[band]) {
        try {
          filtersRef.current[band].gain.setTargetAtTime(num, ctx.currentTime, 0.05);
        } catch {
          filtersRef.current[band].gain.value = num;
        }
      }
      if (band === 'bass' && filtersRef.current.f64) {
        try {
          filtersRef.current.f64.gain.setTargetAtTime(num, ctx.currentTime, 0.05);
        } catch {
          filtersRef.current.f64.gain.value = num;
        }
      }
      if (band === 'mid' && filtersRef.current.f1k) {
        try {
          filtersRef.current.f1k.gain.setTargetAtTime(num, ctx.currentTime, 0.05);
        } catch {
          filtersRef.current.f1k.gain.value = num;
        }
      }
      if (band === 'treble' && filtersRef.current.f8k) {
        try {
          filtersRef.current.f8k.gain.setTargetAtTime(num, ctx.currentTime, 0.05);
        } catch {
          filtersRef.current.f8k.gain.value = num;
        }
      }
    }

    setCustomEqValues((prev) => {
      const updated = { ...prev, [band]: num };
      try {
        localStorage.setItem('soundwave_eq_values', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setSpeed = (speed) => {
    const num = parseFloat(speed) || 1;
    setPlaybackSpeed(num);
    if (audioRef.current) {
      audioRef.current.playbackRate = num;
    }
  };

  const toggleVolumeNormalization = () => {
    setVolumeNormalization((prev) => {
      const next = !prev;
      localStorage.setItem('soundwave_vol_normalization', String(next));
      return next;
    });
  };

  // Toggle Favorite
  const toggleFavorite = async (track) => {
    if (!track) return;
    const exists = favorites.some((t) => t.id === track.id);

    if (exists) {
      setFavorites((prev) => prev.filter((t) => t.id !== track.id));
      api.removeFavorite(track.id).catch(() => {});
    } else {
      setFavorites((prev) => [track, ...prev]);
      api.addFavorite(track).catch(() => {});
    }
  };

  const isFavorite = (trackId) => {
    return favorites.some((t) => t.id === trackId);
  };

  const playAllFavorites = (shuffle = false) => {
    if (favorites.length === 0) return;
    let list = [...favorites];
    if (shuffle) list = list.sort(() => Math.random() - 0.5);
    playTrack(list[0], list);
  };

  // Broadcast Duo Sync state to partner in active room
  const broadcastMusicSync = useCallback((action, trackToSync, overrideTime, overridePlaying) => {
    try {
      const isSyncOn = localStorage.getItem('soundwave_duo_sync') !== 'false';
      if (!isSyncOn) return;
      const roomId = localStorage.getItem('duocore_room_id');
      if (!roomId) return;
      const s = getSocket();
      if (!s) return;

      const track = trackToSync || currentTrack;
      if (!track) return;

      s.emit('music:sync_state', {
        roomId,
        track,
        isPlaying: overridePlaying !== undefined ? overridePlaying : isPlaying,
        currentTime: overrideTime !== undefined ? overrideTime : (audioRef.current?.currentTime || 0),
        action
      });
    } catch (e) {
      console.warn('[MusicSync] Broadcast error:', e);
    }
  }, [currentTrack, isPlaying]);

  // Listen for Partner Duo Music Sync Events
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const handlePartnerSync = (data) => {
      if (!data || !data.track) return;
      const { senderUsername, track, isPlaying: partnerPlaying, currentTime: partnerTime, action } = data;

      setDuoPartnerPlaying({
        track,
        isPlaying: partnerPlaying,
        currentTime: partnerTime,
        senderUsername: senderUsername || 'Lover',
        updatedAt: Date.now()
      });

      if (action === 'play' || action === 'track_change') {
        setDuoToast({
          title: `${senderUsername || 'Partner'} started playing`,
          song: track.title,
          artist: track.artist,
          track,
          partnerTime: partnerTime || 0
        });
      }
    };

    const handleRequestCurrent = () => {
      if (currentTrack && audioRef.current) {
        broadcastMusicSync('response', currentTrack, audioRef.current.currentTime, isPlaying);
      }
    };

    // Duo Queue Real-Time Listeners
    const handleQueueVoted = (data) => {
      if (!data || !data.trackId) return;
      const { trackId, upvotes, action, voterUsername } = data;
      const tid = String(trackId);

      setQueueVotes((prev) => ({
        ...prev,
        [tid]: {
          upvotes: Number(upvotes) || 0,
          hasVoted: prev[tid]?.hasVoted || false
        }
      }));

      setQueue((prevQueue) => {
        const updated = prevQueue.map((item) => {
          const itemTid = String(item.id || item.trackId);
          if (itemTid === tid) {
            return {
              ...item,
              upvotes: Number(upvotes) || 0
            };
          }
          return item;
        });

        if (queueSortMode === 'votes') {
          const played = updated.slice(0, currentIndex + 1);
          const upcoming = updated.slice(currentIndex + 1);
          upcoming.sort((a, b) => {
            const aVotes = String(a.id || a.trackId) === tid ? upvotes : (a.upvotes || 0);
            const bVotes = String(b.id || b.trackId) === tid ? upvotes : (b.upvotes || 0);
            return bVotes - aVotes;
          });
          return [...played, ...upcoming];
        }
        return updated;
      });

      if (voterUsername) {
        setDuoQueueToast({
          text: `${voterUsername} ${action === 'voted' ? 'upvoted (+1)' : 'removed vote from'} a song in the queue!`
        });
        setTimeout(() => setDuoQueueToast(null), 3500);
      }
    };

    const handleQueueItemAdded = (data) => {
      if (!data || !data.item) return;
      const { item, addedBy } = data;
      const incomingId = String(item.id || item.trackId);

      setQueue((prev) => {
        const exists = prev.some((t) => String(t.id || t.trackId) === incomingId);
        if (exists) return prev;
        return [...prev, item];
      });

      if (addedBy) {
        setDuoQueueToast({
          text: `${addedBy} added "${item.title || 'a song'}" to the Duo Queue`
        });
        setTimeout(() => setDuoQueueToast(null), 4000);
      }
    };

    const handleQueueItemRemoved = (data) => {
      if (!data || !data.trackId) return;
      const tid = String(data.trackId);
      setQueue((prev) => prev.filter((t) => String(t.id || t.trackId) !== tid));
      if (data.removedBy) {
        setDuoQueueToast({
          text: `${data.removedBy} removed a track from the queue`
        });
        setTimeout(() => setDuoQueueToast(null), 3000);
      }
    };

    const handleQueueReordered = (data) => {
      if (!data || !Array.isArray(data.trackIds)) return;
      const { trackIds, reorderedBy } = data;
      setQueue((prev) => {
        const map = new Map(prev.map((t) => [String(t.id || t.trackId), t]));
        const reordered = [];
        trackIds.forEach((id) => {
          const strId = String(id);
          if (map.has(strId)) {
            reordered.push(map.get(strId));
            map.delete(strId);
          }
        });
        return [...reordered, ...map.values()];
      });
      if (reorderedBy) {
        setDuoQueueToast({
          text: `${reorderedBy} reordered the queue`
        });
        setTimeout(() => setDuoQueueToast(null), 3000);
      }
    };

    const handleQueueCleared = (data) => {
      setQueue((prev) => {
        if (currentTrack) return [currentTrack];
        return [];
      });
      setCurrentIndex(0);
      if (data?.clearedBy) {
        setDuoQueueToast({
          text: `${data.clearedBy} cleared the Duo Queue`
        });
        setTimeout(() => setDuoQueueToast(null), 3000);
      }
    };

    // Duo Playlists Real-Time Listeners
    const handlePlaylistSongAdded = (data) => {
      fetchPlaylists();
      if (data?.addedBy) {
        setDuoQueueToast({
          text: `${data.addedBy} added "${data.track?.title || 'a song'}" to shared playlist!`
        });
        setTimeout(() => setDuoQueueToast(null), 3500);
      }
    };

    const handlePlaylistSongRemoved = () => {
      fetchPlaylists();
    };

    const handlePlaylistReordered = () => {
      fetchPlaylists();
    };

    const handlePlaylistCreated = (data) => {
      fetchPlaylists();
      if (data?.createdBy) {
        setDuoQueueToast({
          text: `${data.createdBy} created shared playlist "${data.playlist?.name || ''}"!`
        });
        setTimeout(() => setDuoQueueToast(null), 3500);
      }
    };

    s.on('music:partner_sync', handlePartnerSync);
    s.on('music:request_current', handleRequestCurrent);
    s.on('music:queue_voted', handleQueueVoted);
    s.on('music:queue_item_added', handleQueueItemAdded);
    s.on('music:queue_item_removed', handleQueueItemRemoved);
    s.on('music:queue_reordered', handleQueueReordered);
    s.on('music:queue_cleared', handleQueueCleared);
    s.on('playlist:song_added', handlePlaylistSongAdded);
    s.on('playlist:song_removed', handlePlaylistSongRemoved);
    s.on('playlist:reordered', handlePlaylistReordered);
    s.on('playlist:created', handlePlaylistCreated);

    return () => {
      s.off('music:partner_sync', handlePartnerSync);
      s.off('music:request_current', handleRequestCurrent);
      s.off('music:queue_voted', handleQueueVoted);
      s.off('music:queue_item_added', handleQueueItemAdded);
      s.off('music:queue_item_removed', handleQueueItemRemoved);
      s.off('music:queue_reordered', handleQueueReordered);
      s.off('music:queue_cleared', handleQueueCleared);
      s.off('playlist:song_added', handlePlaylistSongAdded);
      s.off('playlist:song_removed', handlePlaylistSongRemoved);
      s.off('playlist:reordered', handlePlaylistReordered);
      s.off('playlist:created', handlePlaylistCreated);
    };
  }, [broadcastMusicSync, currentTrack, isPlaying, currentIndex, queueSortMode]);

  const continuePartnerTrack = () => {
    if (!duoPartnerPlaying?.track) return;
    const { track, currentTime: partnerTime } = duoPartnerPlaying;
    playTrack(track, [track], true);
    if (typeof partnerTime === 'number' && partnerTime > 0) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = partnerTime;
          setCurrentTime(partnerTime);
        }
      }, 700);
    }
    setDuoToast(null);
  };

  const requestPartnerMusic = () => {
    const roomId = localStorage.getItem('duocore_room_id');
    const s = getSocket();
    if (s && roomId) {
      s.emit('music:request_sync', { roomId });
    }
  };

  // Dedicated Send Music to Duo feature ("Duo" button)
  const sendMusicToDuo = async (trackToSend) => {
    const track = trackToSend || currentTrack;
    if (!track) return { success: false, message: 'No track playing' };

    try {
      // 1. Ensure auth token exists (auto guest login if none)
      let activeToken = localStorage.getItem('duocore_token');
      if (!activeToken) {
        try {
          const guestRes = await api.guestLogin();
          if (guestRes?.token) {
            localStorage.setItem('duocore_token', guestRes.token);
            activeToken = guestRes.token;
          }
        } catch (e) {}
      }

      // 2. Ensure active Duo room exists
      let roomId = localStorage.getItem('duocore_room_id');
      if (!roomId && activeToken) {
        try {
          const partnerRes = await api.getCurrentPartner();
          if (partnerRes?.hasRoom && partnerRes?.room?.id) {
            roomId = partnerRes.room.id;
          } else {
            const createRes = await api.createDuoRoom();
            if (createRes?.room?.id) {
              roomId = createRes.room.id;
            }
          }
        } catch (e) {}
      }

      if (roomId) {
        localStorage.setItem('duocore_room_id', roomId);
        // Send track message to the Duo room chat
        await api.sendRoomMessage(roomId, {
          text: `🎵 Shared Song: "${track.title}" by ${track.artist}`,
          channel_type: 'normal',
          metadata: {
            type: 'music_share',
            song: track,
            trackId: track.id,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            duration: track.duration,
            streamUrl: track.streamUrl
          }
        }).catch((err) => console.warn('[DuoSend] sendRoomMessage err:', err));
      }

      // 3. Socket broadcast sync to partner in real-time
      broadcastMusicSync('play', track, audioRef.current?.currentTime || 0, isPlaying);

      // 4. Play audio chime feedback
      try { playSound('quiz_correct'); } catch (e) {}

      // 5. Trigger toast notification
      setDuoToast({
        title: 'Sent to Duo 💖',
        song: track.title,
        artist: track.artist,
        track,
        sent: true
      });

      return { success: true, message: `"${track.title}" sent to Duo! 💖` };
    } catch (err) {
      console.warn('[DuoSend] error:', err);
      try {
        const shareUrl = `${window.location.origin}/?track=${encodeURIComponent(track.id || '')}`;
        navigator.clipboard?.writeText(shareUrl);
      } catch (e) {}
      return { success: true, message: `"${track.title}" sent to Duo! 💖` };
    }
  };

  // Play a Track (Mobile & Desktop Rock Solid)
  const playTrack = async (track, newQueue = null, autoOpen = true) => {
    if (!track) return;

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setCurrentIndex(0);
    }

    setCurrentTrack(track);
    setTrackError(null);
    setIsBuffering(true);

    if (autoOpen) {
      setIsNowPlayingOpen(true);
    }

    // Save to Recently Played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [track, ...filtered].slice(0, 30);
    });

    // Update Taste Profile
    if (track.artist) {
      setUserTasteArtists((prev) => {
        const cleanArtist = track.artist.split('-')[0].trim();
        const filtered = prev.filter((a) => a.toLowerCase() !== cleanArtist.toLowerCase());
        return [cleanArtist, ...filtered].slice(0, 10);
      });
    }

    // Record History in DB
    api.recordHistory(track, track.seconds || 0).catch(() => {});

    try {
      const res = await api.getMusicStream(track.id, track.title, track.artist);
      if (!res.streamUrl) throw new Error('Stream URL unavailable');
      const resolvedUrl = resolveStreamUrl(res.streamUrl);

      if (audioRef.current) {
        audioRef.current.src = resolvedUrl;
        audioRef.current.load();

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
              setTrackError(null);
              broadcastMusicSync('play', track, 0, true);
            })
            .catch((err) => {
              console.warn('[Mobile Autoplay]:', err.message);
              setIsBuffering(false);
            });
        }
      }
    } catch (err) {
      console.error('[Music Stream Error]:', err);
      setIsBuffering(false);
      setIsPlaying(false);
      setTrackError('Unable to play this track. Please check connection or tap Retry.');
    }
  };

  const retryPlayback = () => {
    if (currentTrack) {
      playTrack(currentTrack, queue, false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      broadcastMusicSync('pause', currentTrack, audioRef.current.currentTime, false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          broadcastMusicSync('play', currentTrack, audioRef.current?.currentTime || 0, true);
        })
        .catch((e) => {
          console.warn('Play error:', e);
          setIsBuffering(false);
        });
    }
  };

  const nextTrack = useCallback(async () => {
    if (queue.length === 0) return;

    // Check if we reached the end of queue and Auto-Radio is enabled
    if (currentIndex >= queue.length - 1 && autoRadio && currentTrack) {
      try {
        const radioRes = await api.getRadioTracks(currentTrack.id, currentTrack.title, currentTrack.artist);
        if (radioRes.tracks && radioRes.tracks.length > 0) {
          const freshTracks = radioRes.tracks.filter((t) => !queue.some((q) => q.id === t.id));
          if (freshTracks.length > 0) {
            const updatedQueue = [...queue, ...freshTracks];
            setQueue(updatedQueue);
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            playTrack(updatedQueue[nextIdx], updatedQueue, false);
            return;
          }
        }
      } catch (err) {
        console.warn('[AutoRadio Fetch Error]:', err);
      }
    }

    let nextIdx = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIdx);
    playTrack(queue[nextIdx], queue, false);
  }, [queue, currentIndex, isShuffle, autoRadio, currentTrack]);

  const prevTrack = () => {
    if (queue.length === 0) return;
    let prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    playTrack(queue[prevIdx], queue, false);
  };

  const seekTo = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      broadcastMusicSync('seek', currentTrack, seconds, isPlaying);
    }
  };

  const skipTime = (deltaSeconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration || 100, currentTime + deltaSeconds));
      seekTo(newTime);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume || 0.8);
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // Queue Operations
  const addToQueue = (track, syncToRoom = true) => {
    if (!track) return;
    const item = {
      ...track,
      id: track.id || track.trackId,
      trackId: track.id || track.trackId,
      upvotes: track.upvotes || 0,
      hasVoted: !!track.hasVoted
    };
    setQueue((prev) => [...prev, item]);

    const roomId = localStorage.getItem('duocore_room_id');
    if (syncToRoom && roomId) {
      const s = getSocket();
      if (s && s.connected) {
        s.emit('music:queue_sync', {
          roomId,
          queue: [...queue, item],
          currentIndex,
          currentTrack
        });
      }
      api.addToRoomQueue(roomId, item).catch(() => {});
    }
  };

  const playNextInQueue = (track) => {
    setQueue((prev) => {
      const nextQueue = [...prev];
      nextQueue.splice(currentIndex + 1, 0, track);
      const roomId = localStorage.getItem('duocore_room_id');
      if (roomId) {
        api.addToRoomQueue(roomId, track).catch(() => {});
      }
      return nextQueue;
    });
  };

  const removeFromQueue = (index) => {
    const trackToRemove = queue[index];
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
    if (index < currentIndex) setCurrentIndex((i) => Math.max(0, i - 1));

    const roomId = localStorage.getItem('duocore_room_id');
    if (roomId && trackToRemove) {
      const tid = trackToRemove.id || trackToRemove.trackId;
      api.removeTrackFromRoomQueue(roomId, tid).catch(() => {});
    }
  };

  const clearQueue = () => {
    const roomId = localStorage.getItem('duocore_room_id');
    if (roomId) {
      api.clearRoomQueue(roomId).catch(() => {});
    }
    if (currentTrack) {
      setQueue([currentTrack]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(0);
    }
  };

  const reorderQueue = (fromIdx, toIdx) => {
    setQueue((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);

      const roomId = localStorage.getItem('duocore_room_id');
      if (roomId) {
        const trackIds = copy.map((t) => t.id || t.trackId);
        const s = getSocket();
        if (s && s.connected) {
          s.emit('music:queue_reorder', { roomId, trackIds });
        }
        api.reorderRoomQueue(roomId, trackIds).catch(() => {});
      }

      return copy;
    });
  };

  // Upvote / Toggle Vote on a Queue Track
  const voteTrack = async (trackId) => {
    if (!trackId) return;
    const tid = String(trackId);
    const roomId = localStorage.getItem('duocore_room_id');
    const s = getSocket();

    const currentVoteInfo = queueVotes[tid] || {};
    const currentlyVoted = !!currentVoteInfo.hasVoted;
    const nextVoted = !currentlyVoted;
    const nextUpvotes = Math.max(0, (currentVoteInfo.upvotes || 0) + (nextVoted ? 1 : -1));

    // Optimistic update in queueVotes
    setQueueVotes((prev) => ({
      ...prev,
      [tid]: {
        upvotes: nextUpvotes,
        hasVoted: nextVoted
      }
    }));

    // Optimistic update in queue array
    setQueue((prevQueue) => {
      const updated = prevQueue.map((item) => {
        const itemTid = String(item.id || item.trackId);
        if (itemTid === tid) {
          return {
            ...item,
            upvotes: nextUpvotes,
            hasVoted: nextVoted
          };
        }
        return item;
      });

      if (queueSortMode === 'votes') {
        const played = updated.slice(0, currentIndex + 1);
        const upcoming = updated.slice(currentIndex + 1);
        upcoming.sort((a, b) => {
          const aVotes = String(a.id || a.trackId) === tid ? nextUpvotes : (a.upvotes || 0);
          const bVotes = String(b.id || b.trackId) === tid ? nextUpvotes : (b.upvotes || 0);
          return bVotes - aVotes;
        });
        return [...played, ...upcoming];
      }
      return updated;
    });

    if (s && s.connected && roomId) {
      s.emit('music:queue_vote', { roomId, trackId: tid });
    }
    if (roomId) {
      try {
        await api.voteRoomQueueTrack(roomId, tid);
      } catch (err) {
        console.warn('[Vote Queue API Warning]:', err);
      }
    }
  };

  // Toggle sorting mode of queue (Votes vs Manual Order)
  const toggleQueueSortMode = () => {
    setQueueSortMode((prevMode) => {
      const nextMode = prevMode === 'votes' ? 'manual' : 'votes';
      if (nextMode === 'votes') {
        setQueue((prevQueue) => {
          const played = prevQueue.slice(0, currentIndex + 1);
          const upcoming = prevQueue.slice(currentIndex + 1);
          upcoming.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          return [...played, ...upcoming];
        });
      }
      return nextMode;
    });
  };

  // Fetch Room Collaborative Queue
  const loadRoomQueue = useCallback(async (roomId) => {
    if (!roomId) return;
    try {
      const res = await api.getRoomQueue(roomId, queueSortMode);
      if (res?.queue && Array.isArray(res.queue) && res.queue.length > 0) {
        const votesObj = {};
        res.queue.forEach((item) => {
          votesObj[item.trackId || item.id] = {
            upvotes: item.upvotes || 0,
            hasVoted: !!item.hasVoted
          };
        });
        setQueueVotes((prev) => ({ ...prev, ...votesObj }));

        setQueue((prev) => {
          if (prev.length <= 1) {
            return res.queue;
          }
          return prev.map((item) => {
            const match = res.queue.find((r) => String(r.id || r.trackId) === String(item.id || item.trackId));
            if (match) {
              return { ...item, upvotes: match.upvotes, hasVoted: match.hasVoted };
            }
            return item;
          });
        });
      }
    } catch (e) {
      console.warn('[RoomQueue] Failed to load room queue:', e);
    }
  }, [queueSortMode]);

  // Sleep Timer
  const setSleepTimer = (option) => {
    cancelSleepTimer();
    setSleepTimerOption(option);

    if (option === 'end_of_song') {
      setSleepTimeRemaining('End of Song');
      return;
    }

    const minutes = Number(option);
    if (isNaN(minutes)) return;

    let secondsLeft = minutes * 60;
    setSleepTimeRemaining(`${Math.ceil(secondsLeft / 60)}m`);

    sleepIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
        cancelSleepTimer();
      } else {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        setSleepTimeRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setSleepTimerOption(null);
    setSleepTimeRemaining(null);
  };

  // Playlists API Helpers (supports Collaborative Duo Playlists)
  const fetchPlaylists = async () => {
    try {
      const res = await api.getPlaylists();
      if (res.playlists) setPlaylists(res.playlists);
    } catch {}
  };

  const createPlaylist = async (name, description = '', isCollaborative = false, roomId = null, collaboratorId = null) => {
    const activeRoomId = roomId || (isCollaborative ? localStorage.getItem('duocore_room_id') : null);
    const res = await api.createPlaylist({
      name,
      description,
      is_collaborative: isCollaborative,
      room_id: activeRoomId,
      collaborator_id: collaboratorId
    });
    await fetchPlaylists();
    return res.playlist;
  };

  const deletePlaylist = async (id) => {
    await api.deletePlaylist(id);
    await fetchPlaylists();
  };

  const addSongToPlaylist = async (playlistId, track) => {
    await api.addSongToPlaylist(playlistId, track);
    await fetchPlaylists();
  };

  const removeSongFromPlaylist = async (playlistId, trackId) => {
    await api.removeSongFromPlaylist(playlistId, trackId);
    await fetchPlaylists();
  };

  const reorderPlaylistSongs = async (playlistId, songIds) => {
    await api.reorderPlaylistSongs(playlistId, songIds);
    await fetchPlaylists();
  };

  const playPlaylist = async (playlistId, shuffle = false) => {
    try {
      const res = await api.getPlaylist(playlistId);
      if (res.tracks && res.tracks.length > 0) {
        let list = [...res.tracks];
        if (shuffle) list = list.sort(() => Math.random() - 0.5);
        playTrack(list[0], list);
      }
    } catch (e) {
      console.warn('Could not play playlist:', e);
    }
  };

  // Audio Element Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let lastUpdate = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate >= 350) {
        lastUpdate = now;
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsBuffering(false);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
    };
    const handleEnded = () => {
      if (sleepTimerOption === 'end_of_song') {
        cancelSleepTimer();
        setIsPlaying(false);
        return;
      }
      if (isLoop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [queue, currentIndex, isShuffle, isLoop, sleepTimerOption, nextTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        nextTrack();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        prevTrack();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLyricsOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        if (currentTrack) {
          e.preventDefault();
          toggleFavorite(currentTrack);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, isMuted, volume, currentTime, duration, nextTrack]);

  // MediaSession API Integration (Lock screen / notification controls)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title || 'DuoCore Music',
        artist: currentTrack.artist || 'DuoCore Stream',
        album: currentTrack.album || 'DuoCore',
        artwork: [
          { src: currentTrack.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        skipTime(-(details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        skipTime(details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seekTo(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('[MediaSession] Handler error:', e);
    }
  }, [currentTrack, isPlaying, nextTrack, togglePlay, prevTrack, skipTime, seekTo]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        queue,
        currentIndex,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isLoop,
        favorites: favorites || [],
        playlists: playlists || [],
        recentlyPlayed: recentlyPlayed || [],
        history: recentlyPlayed || [],
        clearHistory,
        clearRecentlyPlayed: clearHistory,
        userTasteArtists: userTasteArtists || [],
        isQueueOpen,
        isLyricsOpen,
        isNowPlayingOpen,
        isShortcutsHelpOpen,
        isStatsOpen,
        lyricsFontSize,
        lyricsOffsetMs,
        activeEqPreset,
        customEqValues,
        playbackSpeed,
        volumeNormalization,
        sliderStyle,
        setSliderStyle,
        autoRadio,
        toggleAutoRadio,
        audioQuality,
        setAudioQuality,
        crossfadeSec,
        setCrossfadeSec,
        skipSilence,
        setSkipSilence,
        trackError,
        setTrackError,
        retryPlayback,
        speedDialPins,
        pinToSpeedDial,
        unpinFromSpeedDial,
        isPinnedToSpeedDial,
        sleepTimerOption,
        sleepTimeRemaining,
        activeTheme,
        appTitle,
        isSecretChatOpen,
        isPlaylistModalOpen,
        playlistTrackToAdd,
        THEMES,
        EQ_PRESETS,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        skipTime,
        handleVolumeChange,
        toggleMute,
        setIsShuffle,
        setIsLoop,
        toggleFavorite,
        isFavorite,
        playAllFavorites,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        setSleepTimer,
        cancelSleepTimer,
        applyEqPreset,
        setCustomEqBand,
        setSpeed,
        toggleVolumeNormalization,
        setLyricsFontSize,
        setLyricsOffsetMs,
        setIsLyricsOpen,
        setIsQueueOpen,
        openQueue: () => setIsQueueOpen(true),
        closeQueue: () => setIsQueueOpen(false),
        openNowPlaying: () => setIsNowPlayingOpen(true),
        closeNowPlaying: () => setIsNowPlayingOpen(false),
        openShortcutsHelp: () => setIsShortcutsHelpOpen(true),
        closeShortcutsHelp: () => setIsShortcutsHelpOpen(false),
        openStats: () => setIsStatsOpen(true),
        closeStats: () => setIsStatsOpen(false),
        openPlaylistModal: (track) => { setPlaylistTrackToAdd(track); setIsPlaylistModalOpen(true); },
        closePlaylistModal: () => { setPlaylistTrackToAdd(null); setIsPlaylistModalOpen(false); },
        fetchPlaylists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        reorderPlaylistSongs,
        playPlaylist,
        changeTheme: (t) => { setActiveTheme(t); localStorage.setItem('soundwave_theme', t); },
        changeAppTitle: (t) => { setAppTitle(t); localStorage.setItem('soundwave_app_title', t); },
        openSecretChat: () => setIsSecretChatOpen(true),
        closeSecretChat: () => setIsSecretChatOpen(false),
        // Collaborative Duo Queue & Voting
        queueVotes,
        queueSortMode,
        setQueueSortMode,
        toggleQueueSortMode,
        voteTrack,
        loadRoomQueue,
        duoQueueToast,
        setDuoQueueToast,
        // Duo Listening Together Sync Values
        isDuoSyncEnabled,
        toggleDuoSync,
        duoPartnerPlaying,
        duoToast,
        setDuoToast,
        continuePartnerTrack,
        requestPartnerMusic,
        broadcastMusicSync,
        sendMusicToDuo
      }}
    >
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
        playsInline
        webkit-playsinline="true"
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
