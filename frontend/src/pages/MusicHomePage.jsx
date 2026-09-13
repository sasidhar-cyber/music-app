import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { useRoom } from '../context/RoomContext';
import api from '../services/api';
import {
  Search,
  Mic,
  Play,
  Pause,
  Download,
  Heart,
  Sparkles,
  TrendingUp,
  Music,
  Compass,
  Radio,
  Clock,
  Disc3,
  History,
  Check,
  Plus,
  Trash2,
  FolderPlus,
  BarChart3,
  SlidersHorizontal,
  X,
  Shuffle,
  User,
  MoreVertical,
  ChevronRight,
  Headphones,
  Zap,
  Volume2,
  RotateCw,
  ListMusic,
  Loader2,
  Bookmark,
  Dices,
  Settings,
  Layers,
  ArrowUpDown,
  Filter,
  MessageCircle,
  ArrowRight,
  Users,
  Video,
  FileText,
  Globe,
  Flame,
  Trophy
} from 'lucide-react';

import { AlbumDetailModal } from '../components/AlbumDetailModal';
import { ArtistDetailModal } from '../components/ArtistDetailModal';
import { PlaylistDetailModal } from '../components/PlaylistDetailModal';
import { TrackActionMenu } from '../components/TrackActionMenu';
import { SearchSegmentedView } from '../components/SearchSegmentedView';
import { SoundWaveChipsRow } from '../components/soundwave/SoundWaveChipsRow';
import { SoundWaveNavigationTitle } from '../components/soundwave/SoundWaveNavigationTitle';
import { SoundWaveQuickPicks } from '../components/soundwave/SoundWaveQuickPicks';
import { SoundWaveHorizontalSection } from '../components/soundwave/SoundWaveHorizontalSection';
import { SoundWaveMoodAndGenres } from '../components/soundwave/SoundWaveMoodAndGenres';

import {
  downloadTrack,
  getDownloadedTracks,
  subscribeDownloads,
  removeDownloadedTrack,
  clearDownloadedTracks,
  isTrackDownloaded
} from '../utils/downloadManager';

// SoundWave Filter Chips & Home Tabs (23 Tabs and Categories)
export const SOUNDWAVE_FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'songs', label: 'Songs' },
  { id: 'telugu', label: 'Telugu Songs' },
  { id: 'hindi', label: 'Hindi Songs' },
  { id: 'english', label: 'English Songs' },
  { id: 'tamil', label: 'Tamil Songs' },
  { id: 'malayalam', label: 'Malayalam Songs' },
  { id: 'kannada', label: 'Kannada Songs' },
  { id: 'korean', label: 'Korean Songs' },
  { id: 'trending', label: 'Trending Songs' },
  { id: 'new-releases', label: 'New Releases' },
  { id: 'charts', label: 'Top Charts' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'videos', label: 'Music Videos' },
  { id: 'lyrics', label: 'Lyrics' },
  { id: 'recommended', label: 'Recommended Songs' },
  { id: 'recent', label: 'Recently Played' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'popular-artists', label: 'Popular Artists' },
  { id: 'popular-albums', label: 'Popular Albums' },
  { id: 'genres', label: 'Genres' }
];

export const SOUNDWAVE_LANGUAGES = [
  { id: '', label: 'All Languages' },
  { id: 'Telugu', label: 'Telugu' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'English', label: 'English' },
  { id: 'Tamil', label: 'Tamil' },
  { id: 'Malayalam', label: 'Malayalam' },
  { id: 'Kannada', label: 'Kannada' },
  { id: 'Korean', label: 'Korean' },
  { id: 'International', label: 'International' }
];

export const SOUNDWAVE_GENRES = [
  { id: '', label: 'All Genres' },
  { id: 'Pop', label: 'Pop' },
  { id: 'Rock', label: 'Rock' },
  { id: 'Hip-Hop', label: 'Hip-Hop' },
  { id: 'Classical', label: 'Classical' },
  { id: 'EDM', label: 'EDM' },
  { id: 'Romantic', label: 'Romantic' },
  { id: 'Devotional', label: 'Devotional' },
  { id: 'Lo-fi', label: 'Lo-fi' },
  { id: 'Instrumental', label: 'Instrumental' },
  { id: 'Workout', label: 'Workout' },
  { id: 'Study', label: 'Study' },
  { id: 'Trending', label: 'Trending' }
];

export const SOUNDWAVE_SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'latest', label: 'Latest Releases' },
  { id: 'title', label: 'Title (A-Z)' },
  { id: 'artist', label: 'Artist Name' }
];

// SoundWave Moods and Genres Explore Cards
const SOUNDWAVE_MOOD_GENRES = [
  {
    id: 'mg-telugu',
    title: 'Tollywood Mass & Hits',
    subtitle: 'Pushpa 2, Devara, Guntur Kaaram',
    gradient: 'from-emerald-700 via-teal-800 to-slate-950',
    borderColor: 'border-emerald-500/30',
    tag: 'Trending 🔥',
    icon: '🔥',
    query: 'Telugu Hits Pushpa Devara'
  },
  {
    id: 'mg-romance',
    title: 'Romance & Love',
    subtitle: 'Heart-touching Melodies & Duets',
    gradient: 'from-rose-700 via-pink-800 to-slate-950',
    borderColor: 'border-rose-500/30',
    tag: 'Soul 💖',
    icon: '💌',
    query: 'Love Songs Romantic Melodies Telugu'
  },
  {
    id: 'mg-spb-legends',
    title: 'Gana Gandharva SPB',
    subtitle: 'Evergreen Golden Era Melodies',
    gradient: 'from-amber-700 via-orange-800 to-slate-950',
    borderColor: 'border-amber-500/30',
    tag: 'Legend 🏆',
    icon: '👑',
    query: 'artist:"S. P. Balasubrahmanyam"'
  },
  {
    id: 'mg-anirudh-dsp',
    title: 'Rockstar Anirudh & DSP',
    subtitle: 'High Voltage BGM & Soundtracks',
    gradient: 'from-fuchsia-700 via-purple-900 to-slate-950',
    borderColor: 'border-fuchsia-500/30',
    tag: 'Beat ⚡',
    icon: '🎸',
    query: 'artist:Anirudh Devi Sri Prasad'
  },
  {
    id: 'mg-arijit-shreya',
    title: 'Arijit & Shreya Ghoshal',
    subtitle: 'Soulful Bollywood Chartbusters',
    gradient: 'from-sky-700 via-indigo-900 to-slate-950',
    borderColor: 'border-sky-500/30',
    tag: 'Viral 🌟',
    icon: '🎤',
    query: 'artist:"Arijit Singh" Shreya Ghoshal'
  },
  {
    id: 'mg-devotional',
    title: 'Bhakti & Stotrams',
    subtitle: 'Annamayya, Venkateswara & Slokas',
    gradient: 'from-orange-600 via-amber-800 to-slate-950',
    borderColor: 'border-orange-500/30',
    tag: 'Divine 🕉️',
    icon: '🕉️',
    query: 'Telugu Devotional Annamayya Venkateswara'
  },
  {
    id: 'mg-dj-party',
    title: 'DJ & Dance Beats',
    subtitle: 'High-Tempo Club & Bass Mixes',
    gradient: 'from-violet-700 via-purple-900 to-slate-950',
    borderColor: 'border-violet-500/30',
    tag: 'Dance 💃',
    icon: '🎛️',
    query: 'DJ Songs Party Remix Telugu'
  },
  {
    id: 'mg-chill-lofi',
    title: 'Lo-Fi & Late Night',
    subtitle: 'Calm Beats & Sleep Melodies',
    gradient: 'from-blue-800 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/30',
    tag: 'Calm 🌙',
    icon: '🎧',
    query: 'Lo-Fi Chill Telugu Melodies'
  }
];

export function MusicHomePage({ onOpenPinPrompt, onOpenChat, onOpenInvite }) {
  const musicCtx = useMusic() || {};
  const roomCtx = useRoom() || {};
  const { hasPartner = false, partner = null, roomData = null } = roomCtx;
  const {
    currentTrack = null,
    isPlaying = false,
    playTrack = () => {},
    openNowPlaying = () => {},
    queue = [],
    favorites = [],
    isFavorite = () => false,
    toggleFavorite = () => {},
    playlists = [],
    createPlaylist = () => {},
    history = [],
    recentlyPlayed = [],
    clearHistory = () => {},
    duoPartnerPlaying = null,
    duoToast = null,
    setDuoToast = () => {},
    continuePartnerTrack = () => {},
    isDuoSyncEnabled = true,
    toggleDuoSync = () => {}
  } = musicCtx;

  const userHistory = history?.length ? history : (recentlyPlayed || []);
  const userFavorites = favorites || [];
  const userPlaylists = playlists || [];

  // Navigation Tabs:
  // 'home' | 'search' | 'charts' | 'library'
  const [activeMainTab, setActiveMainTab] = useState('home');

  // SoundWave Filter Chip Selection
  const [selectedChip, setSelectedChip] = useState('all');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchArtists, setSearchArtists] = useState([]);
  const [searchAlbums, setSearchAlbums] = useState([]);
  const [searchPlaylists, setSearchPlaylists] = useState([]);
  const [searchMoods, setSearchMoods] = useState([]);
  const [searchTopResult, setSearchTopResult] = useState(null);
  const [searchIntent, setSearchIntent] = useState(null);
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('soundwave_recent_searches') || localStorage.getItem('metrolist_recent_searches');
      return saved ? JSON.parse(saved) : ['The Weeknd', 'Taylor Swift', 'Linkin Park', 'Coldplay', 'Billie Eilish', 'Pushpa 2', 'Sid Sriram'];
    } catch {
      return ['The Weeknd', 'Taylor Swift', 'Linkin Park', 'Coldplay', 'Billie Eilish', 'Pushpa 2', 'Sid Sriram'];
    }
  });

  // Data Collections
  const [allTracks, setAllTracks] = useState([]);
  const [quickPicks, setQuickPicks] = useState([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState([]);
  const [featuredAlbums, setFeaturedAlbums] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [dailyDiscover, setDailyDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // SoundWave Filters, Genres, Languages & Sort
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchLanguageFilter, setSearchLanguageFilter] = useState('');
  const [searchGenreFilter, setSearchGenreFilter] = useState('');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [searchVideos, setSearchVideos] = useState([]);
  const [searchRelatedSongs, setSearchRelatedSongs] = useState([]);
  const [searchLyrics, setSearchLyrics] = useState(null);
  const [languageSongsMap, setLanguageSongsMap] = useState({});
  const [lyricsSearchQuery, setLyricsSearchQuery] = useState('');
  const [lyricsData, setLyricsData] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  // Modals
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [selectedAlbumData, setSelectedAlbumData] = useState(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtistData, setSelectedArtistData] = useState(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedPlaylistData, setSelectedPlaylistData] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const [selectedActionTrack, setSelectedActionTrack] = useState(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // Library Sub-tab
  const [librarySubTab, setLibrarySubTab] = useState('playlists'); // 'playlists' | 'liked' | 'downloads' | 'history'
  const [isCreatingDuoPlaylist, setIsCreatingDuoPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistIsCollab, setNewPlaylistIsCollab] = useState(true);
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [downloadingMap, setDownloadingMap] = useState({});

  // Show Toast
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Initial Load from API
  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [trendRes, artRes, albRes, plRes] = await Promise.allSettled([
        api.getTrendingMusic(),
        api.getArtists(),
        api.getAlbums(),
        api.getCuratedCharts ? api.getCuratedCharts() : Promise.resolve([])
      ]);

      const rawTrend = trendRes.status === 'fulfilled' && trendRes.value ? trendRes.value : [];
      let tracks = [];
      if (Array.isArray(rawTrend)) {
        tracks = rawTrend;
      } else if (rawTrend && typeof rawTrend === 'object') {
        tracks = [
          ...(Array.isArray(rawTrend.trending) ? rawTrend.trending : []),
          ...(Array.isArray(rawTrend.teluguHits) ? rawTrend.teluguHits : []),
          ...(Array.isArray(rawTrend.loveSongs) ? rawTrend.loveSongs : []),
          ...(Array.isArray(rawTrend.massSongs) ? rawTrend.massSongs : []),
          ...(Array.isArray(rawTrend.devotional) ? rawTrend.devotional : []),
          ...(Array.isArray(rawTrend.hindiHits) ? rawTrend.hindiHits : [])
        ];
      }

      const artists = artRes.status === 'fulfilled' ? (Array.isArray(artRes.value) ? artRes.value : (artRes.value?.artists || [])) : [];
      const albums = albRes.status === 'fulfilled' ? (Array.isArray(albRes.value) ? albRes.value : (albRes.value?.albums || [])) : [];
      const playlistsData = plRes.status === 'fulfilled' ? (Array.isArray(plRes.value) ? plRes.value : (plRes.value?.playlists || [])) : [];

      // Ensure only non-empty albums with tracks are shown
      const validAlbums = albums.filter((alb) => alb && (alb.tracksCount > 0 || (alb.tracks && alb.tracks.length > 0) || !('tracks' in alb)));

      setAllTracks(tracks);
      setFeaturedArtists(artists);
      setFeaturedAlbums(validAlbums.length > 0 ? validAlbums : albums);

      // SoundWave Quick Picks: Top 16 tracks for 4-row layout
      setQuickPicks(tracks.slice(0, 16));

      // SoundWave Daily Discover: 10 curated tracks/albums
      setDailyDiscover(tracks.slice(4, 14));

      // Community / Curated Playlists
      if (playlistsData.length > 0) {
        setCuratedPlaylists(playlistsData);
      } else {
        setCuratedPlaylists([
          {
            id: 'chart-telugu-top-50',
            title: 'Tollywood Hotlist',
            subtitle: 'Telugu Top 50 • 2026',
            cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
            tracksCount: 50
          },
          {
            id: 'chart-global-top-50',
            title: 'Global Top 50',
            subtitle: 'Worldwide Chartbusters',
            cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
            tracksCount: 50
          },
          {
            id: 'chart-bollywood-viral',
            title: 'Bollywood Prime Hits',
            subtitle: 'Arijit Singh, Vishal Mishra',
            cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg',
            tracksCount: 40
          },
          {
            id: 'chart-billboard-hot',
            title: 'Billboard Hot 100',
            subtitle: 'Top Streaming Hits',
            cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop',
            tracksCount: 100
          }
        ]);
      }
    } catch (err) {
      console.warn('[SoundWave Home] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
    try {
      const storedDownloads = getDownloadedTracks();
      setDownloadedTracks(storedDownloads);
    } catch {}

    const unsubscribe = subscribeDownloads((updated) => {
      setDownloadedTracks(updated);
    });
    return () => unsubscribe();
  }, []);

  // Fetch songs dynamically when a language chip is clicked if not yet cached
  useEffect(() => {
    const langTabMap = {
      telugu: 'Telugu',
      hindi: 'Hindi',
      english: 'English',
      tamil: 'Tamil',
      malayalam: 'Malayalam',
      kannada: 'Kannada',
      korean: 'Korean'
    };
    const targetLang = langTabMap[selectedChip] || selectedLanguage;
    if (targetLang && !languageSongsMap[targetLang]) {
      api.searchMusic(targetLang, { language: targetLang })
        .then((res) => {
          if (res && res.results && res.results.length > 0) {
            setLanguageSongsMap((prev) => ({ ...prev, [targetLang]: res.results }));
          }
        })
        .catch(() => {});
    }
  }, [selectedChip, selectedLanguage]);

  // Fetch lyrics when currently playing track changes or lyrics tab is selected
  useEffect(() => {
    if (currentTrack?.title) {
      setLyricsLoading(true);
      api.getMusicLyrics(currentTrack.title, currentTrack.artist || '')
        .then((data) => {
          if (data && !data.error) {
            setLyricsData(data);
          } else {
            setLyricsData(null);
          }
        })
        .catch(() => setLyricsData(null))
        .finally(() => setLyricsLoading(false));
    }
  }, [currentTrack?.title, currentTrack?.artist]);

  // Filtered tracks based on SoundWave selected filter chip, language, genre, and sort
  const filteredQuickPicks = useMemo(() => {
    let list = [...allTracks];

    // Language Tab mapping
    const langMap = {
      telugu: 'Telugu',
      hindi: 'Hindi',
      english: 'English',
      tamil: 'Tamil',
      malayalam: 'Malayalam',
      kannada: 'Kannada',
      korean: 'Korean'
    };

    if (langMap[selectedChip]) {
      const targetLang = langMap[selectedChip];
      const cached = languageSongsMap[targetLang];
      if (cached && cached.length > 0) {
        list = cached;
      } else {
        list = allTracks.filter((t) => (t.language || '').toLowerCase() === targetLang.toLowerCase() || (t.category || '').toLowerCase().includes(targetLang.toLowerCase()));
      }
    } else if (selectedChip === 'trending') {
      list = allTracks.filter((t) => t.category?.includes('Trending') || t.views || t.plays).slice(0, 20);
      if (list.length < 10) list = allTracks.slice(0, 20);
    } else if (selectedChip === 'new-releases') {
      list = allTracks.filter((t) => t.year === '2025' || t.year === '2026' || t.year === '2024');
      if (list.length < 5) list = allTracks.slice(0, 16);
    } else if (selectedChip === 'favorites') {
      list = allTracks.filter((t) => isFavorite?.(t.id));
    } else if (selectedChip === 'recent') {
      list = userHistory;
    } else if (selectedChip === 'recommended') {
      list = allTracks.slice(8, 24);
    } else if (selectedChip === 'all') {
      list = quickPicks;
    }

    // Apply secondary language filter if selected
    if (selectedLanguage) {
      const filteredByLang = list.filter((t) =>
        (t.language || '').toLowerCase().includes(selectedLanguage.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(selectedLanguage.toLowerCase())
      );
      if (filteredByLang.length > 0) list = filteredByLang;
    }

    // Apply genre filter if selected
    if (selectedGenre) {
      const filteredByGenre = list.filter((t) =>
        (t.genre || '').toLowerCase().includes(selectedGenre.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(selectedGenre.toLowerCase()) ||
        (t.title || '').toLowerCase().includes(selectedGenre.toLowerCase())
      );
      if (filteredByGenre.length > 0) list = filteredByGenre;
    }

    // Apply sorting
    if (selectedSort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (selectedSort === 'artist') {
      list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
    } else if (selectedSort === 'latest') {
      list.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
    }

    return list;
  }, [selectedChip, quickPicks, allTracks, selectedLanguage, selectedGenre, selectedSort, languageSongsMap, userHistory, isFavorite]);

  // Handle Search Execution
  const executeSearch = async (query, filters = {}) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchArtists([]);
      setSearchAlbums([]);
      setSearchPlaylists([]);
      setSearchVideos([]);
      setSearchRelatedSongs([]);
      setSearchLyrics(null);
      setSearchTopResult(null);
      setSearchIntent(null);
      return;
    }

    const cleanQuery = query.trim();
    const lang = filters.language !== undefined ? filters.language : searchLanguageFilter;
    const gen = filters.genre !== undefined ? filters.genre : searchGenreFilter;

    // Update recent searches
    setRecentSearches((prev) => {
      const updated = [cleanQuery, ...prev.filter((q) => q.toLowerCase() !== cleanQuery.toLowerCase())].slice(0, 10);
      try {
        localStorage.setItem('soundwave_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setLoading(true);
      const [res, lyricsRes] = await Promise.allSettled([
        api.searchMusic(cleanQuery, { language: lang, genre: gen }),
        api.getMusicLyrics(cleanQuery, '')
      ]);

      const data = res.status === 'fulfilled' && res.value ? res.value : {};
      const tracks = data.results || data.songs || [];
      setSearchResults(tracks);
      setSearchArtists(data.artists || []);
      setSearchAlbums(data.albums || []);
      setSearchPlaylists(data.playlists || []);
      setSearchMoods(data.moods || []);

      const vids = (data.videos && data.videos.length > 0)
        ? data.videos
        : tracks.map((t) => ({
            id: t.id || `yt-${t.videoId}`,
            videoId: t.videoId || t.id,
            title: t.title,
            channel: t.artist || t.channel || 'Official Artist',
            artist: t.artist || 'Official Artist',
            duration: t.duration || '3:45',
            thumbnail: t.image || t.thumbnail || `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`,
            views: t.views || '5M+ views'
          }));
      setSearchVideos(vids);
      setSearchRelatedSongs(data.relatedSongs || (tracks.length > 2 ? tracks.slice(1, 7) : []));

      if (lyricsRes.status === 'fulfilled' && lyricsRes.value && !lyricsRes.value.error) {
        setSearchLyrics(lyricsRes.value);
      } else {
        setSearchLyrics(null);
      }

      let normalizedTop = data.topResult;
      if (!normalizedTop && tracks.length > 0) {
        normalizedTop = {
          type: 'song',
          data: tracks[0]
        };
      } else if (normalizedTop && !normalizedTop.data) {
        normalizedTop = {
          type: normalizedTop.type || 'song',
          data: normalizedTop
        };
      }
      setSearchTopResult(normalizedTop || null);
      setSearchIntent(data.intent || null);
    } catch (e) {
      console.warn('[Search] Failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice search is not supported in this browser.');
      return;
    }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'te-IN'; // Telugu + English recognition
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      showToast('🎙️ Listening in Telugu / English...');
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        executeSearch(transcript);
        setActiveMainTab('search');
        showToast(`Searched: "${transcript}"`);
      };
      recognition.onerror = () => {
        showToast('Voice recognition error. Please type search.');
      };
      recognition.start();
    } catch {
      showToast('Could not start voice search.');
    }
  };

  // Open album/artist modals
  const handleOpenAlbum = (albumId, albumData = null) => {
    setSelectedAlbumId(albumId);
    setSelectedAlbumData(albumData);
    setIsAlbumModalOpen(true);
  };

  const handleOpenArtist = (artistId, artistData = null) => {
    setSelectedArtistId(artistId);
    setSelectedArtistData(artistData);
    setIsArtistModalOpen(true);
  };

  const handleOpenPlaylist = (playlistId, playlistData = null) => {
    setSelectedPlaylistId(playlistId);
    setSelectedPlaylistData(playlistData);
    setIsPlaylistModalOpen(true);
  };

  const handleOpenTrackMenu = (track) => {
    setSelectedActionTrack(track);
    setIsActionMenuOpen(true);
  };

  // Download Handler
  const handleDownloadTrack = async (track) => {
    try {
      setDownloadingMap((prev) => ({ ...prev, [track.id]: true }));
      await downloadTrack(track);
      showToast(`Downloaded "${track.title}" for offline playback`);
    } catch (e) {
      showToast('Download failed');
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [track.id]: false }));
    }
  };

  const handlePlayVideo = (vid) => {
    const trackObj = {
      id: vid.id || `yt-${vid.videoId}`,
      videoId: vid.videoId || vid.id,
      title: vid.title,
      artist: vid.channel || vid.artist || 'Official Artist',
      image: vid.thumbnail || `https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`,
      thumbnail: vid.thumbnail || `https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`,
      duration: vid.duration || '3:45',
      streamUrl: `/api/music/audio-stream/${vid.videoId}`
    };
    playTrack(trackObj, [trackObj]);
    openNowPlaying();
  };

  const handleSearchLyrics = async (q) => {
    const term = (q || lyricsSearchQuery || '').trim();
    if (!term) return;
    setLyricsLoading(true);
    try {
      const data = await api.getMusicLyrics(term, '');
      if (data && !data.error) {
        setLyricsData(data);
      } else {
        setLyricsData({ plainLyrics: `No synchronized lyrics found for "${term}".` });
      }
    } catch {
      setLyricsData({ plainLyrics: 'Could not fetch lyrics. Please check your network connection.' });
    } finally {
      setLyricsLoading(false);
    }
  };

  // Format last seen helper
  const formatLastSeen = (dateStr) => {
    if (!dateStr) return 'Offline';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Active just now';
      if (mins < 60) return `Active ${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Active ${hours}h ago`;
      return `Active ${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none pb-32">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* SoundWave App Bar / Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
            <Music className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>SoundWave</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v2026
              </span>
            </h1>
          </div>
        </div>

        {/* Top Header Quick Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadHomeData().then(() => {
                setTimeout(() => setIsRefreshing(false), 500);
                showToast('Refreshed music feeds');
              });
            }}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Refresh feeds"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              setActiveMainTab('search');
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveMainTab('library');
              setLibrarySubTab('history');
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Listening History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs Bar: Home | Search | Charts | Library */}
      <nav className="w-full bg-slate-950 border-b border-slate-800/60 px-4 py-2 flex items-center justify-center sm:justify-start gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'home', label: 'Home', icon: Music },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'charts', label: 'Charts & Explore', icon: TrendingUp },
          { id: 'library', label: 'Library', icon: FolderPlus }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========================================================================= */}
      {/* 1. SOUNDWAVE HOME EXPERIENCE (23 Dynamic Tabs & Categories)               */}
      {/* ========================================================================= */}
      {activeMainTab === 'home' && (
        <div className="space-y-6 pt-2 animate-in fade-in">
          {/* SoundWave Filter Chips Row */}
          <SoundWaveChipsRow
            chips={SOUNDWAVE_FILTER_CHIPS}
            selectedChip={selectedChip}
            onSelectChip={(chipId) => setSelectedChip(chipId)}
          />

          {/* Language & Genre Quick Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {SOUNDWAVE_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-teal-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {SOUNDWAVE_GENRES.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {SOUNDWAVE_SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedLanguage || selectedGenre || selectedSort !== 'popular') && (
              <button
                onClick={() => {
                  setSelectedLanguage('');
                  setSelectedGenre('');
                  setSelectedSort('popular');
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* TAB 1: ALL OVERVIEW */}
          {selectedChip === 'all' && (
            <div className="space-y-6">
              {/* Quick Picks (4-Row LazyHorizontalGrid with Play All) */}
              <section className="space-y-2">
                <SoundWaveNavigationTitle
                  title="Quick picks"
                  label="For You"
                  onPlayAllClick={() => {
                    if (filteredQuickPicks.length > 0) {
                      playTrack(filteredQuickPicks[0], filteredQuickPicks);
                      openNowPlaying();
                      showToast('Playing all quick picks');
                    }
                  }}
                />
                <SoundWaveQuickPicks
                  tracks={filteredQuickPicks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track, queueList) => {
                    playTrack(track, queueList);
                    openNowPlaying();
                  }}
                  onOpenTrackMenu={handleOpenTrackMenu}
                />
              </section>

              {/* Section 3: From the Community / Top Charts */}
              <section className="space-y-2">
                <SoundWaveNavigationTitle
                  title="From the community"
                  label="Playlists"
                  onClick={() => setActiveMainTab('charts')}
                />
                <SoundWaveHorizontalSection
                  items={curatedPlaylists}
                  type="playlist"
                  onItemClick={(pl) => handleOpenPlaylist(pl.id, pl)}
                />
              </section>

              {/* Section 4: Daily Discover */}
              <section className="space-y-2">
                <SoundWaveNavigationTitle
                  title="Daily Discover"
                  label="Updated Today"
                  onPlayAllClick={() => {
                    if (dailyDiscover.length > 0) {
                      playTrack(dailyDiscover[0], dailyDiscover);
                      openNowPlaying();
                    }
                  }}
                />
                <SoundWaveHorizontalSection
                  items={dailyDiscover}
                  type="song"
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onItemClick={(track) => {
                    playTrack(track, dailyDiscover);
                    openNowPlaying();
                  }}
                />
              </section>

              {/* Section 5: Keep Listening (History / Recent) */}
              {userHistory.length > 0 && (
                <section className="space-y-2">
                  <SoundWaveNavigationTitle
                    title="Keep listening"
                    label="Recent Activity"
                    onClick={() => {
                      setActiveMainTab('library');
                      setLibrarySubTab('history');
                    }}
                  />
                  <SoundWaveHorizontalSection
                    items={userHistory.slice(0, 12)}
                    type="song"
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onItemClick={(track) => {
                      playTrack(track, userHistory);
                      openNowPlaying();
                    }}
                  />
                </section>
              )}

              {/* Section 6: Artists for You */}
              {featuredArtists.length > 0 && (
                <section className="space-y-2">
                  <SoundWaveNavigationTitle
                    title="Artists for you"
                    label="Recommendations"
                    onClick={() => {
                      setActiveMainTab('library');
                      setLibrarySubTab('artists');
                    }}
                  />
                  <SoundWaveHorizontalSection
                    items={featuredArtists}
                    type="artist"
                    onItemClick={(art) => handleOpenArtist(art.id, art)}
                  />
                </section>
              )}

              {/* Section 7: Albums for You */}
              {featuredAlbums.length > 0 && (
                <section className="space-y-2">
                  <SoundWaveNavigationTitle
                    title="Albums for you"
                    label="New Releases"
                    onClick={() => {
                      setActiveMainTab('library');
                      setLibrarySubTab('albums');
                    }}
                  />
                  <SoundWaveHorizontalSection
                    items={featuredAlbums}
                    type="album"
                    onItemClick={(alb) => handleOpenAlbum(alb.id, alb)}
                  />
                </section>
              )}

              {/* Section 8: Moods & Genres Explore Hub */}
              <section className="space-y-3 pb-8">
                <SoundWaveNavigationTitle
                  title="Moods and genres"
                  label="Explore"
                  onClick={() => setActiveMainTab('charts')}
                />
                <SoundWaveMoodAndGenres
                  categories={SOUNDWAVE_MOOD_GENRES}
                  onSelectCategory={(cat) => {
                    setSearchQuery(cat.query);
                    executeSearch(cat.query);
                    setActiveMainTab('search');
                  }}
                />
              </section>
            </div>
          )}

          {/* TAB 2: SONGS LIBRARY */}
          {selectedChip === 'songs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <span>Songs Library</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {filteredQuickPicks.length} tracks available • High Fidelity Audio
                  </p>
                </div>
                {filteredQuickPicks.length > 0 && (
                  <button
                    onClick={() => {
                      playTrack(filteredQuickPicks[0], filteredQuickPicks);
                      openNowPlaying();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800/60 bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
                {filteredQuickPicks.map((t, idx) => {
                  const isCur = currentTrack?.id === t.id;
                  const isFav = isFavorite?.(t.id);
                  const isDl = isTrackDownloaded?.(t.id);
                  const isDownloading = downloadingMap[t.id];
                  return (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        playTrack(t, filteredQuickPicks);
                        openNowPlaying();
                      }}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/60 transition-colors group ${
                        isCur ? 'bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:text-emerald-400">
                          {idx + 1}
                        </span>
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          <img
                            src={t.thumbnail || t.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop'}
                            alt={t.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isCur && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCur ? 'text-emerald-400' : 'text-white'}`}>
                            {t.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {t.artist} {t.album ? `• ${t.album}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline pr-2">
                          {t.duration || '3:30'}
                        </span>
                        <button
                          onClick={() => toggleFavorite?.(t)}
                          className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${
                            isFav ? 'text-rose-500' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDownloadTrack(t)}
                          disabled={isDownloading || isDl}
                          className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${
                            isDl ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          ) : isDl ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenTrackMenu(t)}
                          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGE HUBS (Telugu, Hindi, English, Tamil, Malayalam, Kannada, Korean) */}
          {['telugu', 'hindi', 'english', 'tamil', 'malayalam', 'kannada', 'korean'].includes(selectedChip) && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight capitalize flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span>{selectedChip} Music Hub</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Top trending songs, legendary artists, hit albums & playlists
                  </p>
                </div>
                {filteredQuickPicks.length > 0 && (
                  <button
                    onClick={() => {
                      playTrack(filteredQuickPicks[0], filteredQuickPicks);
                      openNowPlaying();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {/* Language Quick Picks (4-Row Grid) */}
              <section className="space-y-2">
                <SoundWaveNavigationTitle title={`Top ${selectedChip.toUpperCase()} Hits`} label="Curated" />
                <SoundWaveQuickPicks
                  tracks={filteredQuickPicks.slice(0, 16)}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track, queueList) => {
                    playTrack(track, queueList);
                    openNowPlaying();
                  }}
                  onOpenTrackMenu={handleOpenTrackMenu}
                />
              </section>

              {/* Language Artists */}
              {featuredArtists.length > 0 && (
                <section className="space-y-2">
                  <SoundWaveNavigationTitle title={`${selectedChip.toUpperCase()} Artists`} label="Explore" />
                  <SoundWaveHorizontalSection
                    items={featuredArtists}
                    type="artist"
                    onItemClick={(art) => handleOpenArtist(art.id, art)}
                  />
                </section>
              )}

              {/* Language Albums */}
              {featuredAlbums.length > 0 && (
                <section className="space-y-2">
                  <SoundWaveNavigationTitle title={`${selectedChip.toUpperCase()} Albums`} label="Soundtracks" />
                  <SoundWaveHorizontalSection
                    items={featuredAlbums}
                    type="album"
                    onItemClick={(alb) => handleOpenAlbum(alb.id, alb)}
                  />
                </section>
              )}
            </div>
          )}

          {/* TAB 4: TRENDING SONGS */}
          {selectedChip === 'trending' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-500" />
                    <span>Trending Songs • SoundWave Top 20</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time global & regional viral chartbusters
                  </p>
                </div>
                {filteredQuickPicks.length > 0 && (
                  <button
                    onClick={() => {
                      playTrack(filteredQuickPicks[0], filteredQuickPicks);
                      openNowPlaying();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredQuickPicks.slice(0, 20).map((t, idx) => {
                  const isCur = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        playTrack(t, filteredQuickPicks);
                        openNowPlaying();
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/70 hover:border-emerald-500/40 cursor-pointer transition-all ${
                        isCur ? 'ring-1 ring-emerald-500/50 bg-emerald-950/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-emerald-400 flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        <img
                          src={t.thumbnail || t.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop'}
                          alt={t.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${isCur ? 'text-emerald-400' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{t.artist}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(t, filteredQuickPicks);
                          openNowPlaying();
                        }}
                        className="w-9 h-9 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: NEW RELEASES */}
          {selectedChip === 'new-releases' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>New Releases (2024 - 2026)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Fresh drops, newly launched tracks & album premieres
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredQuickPicks.slice(0, 15).map((t, idx) => (
                  <div
                    key={t.id || idx}
                    onClick={() => {
                      playTrack(t, filteredQuickPicks);
                      openNowPlaying();
                    }}
                    className="group flex flex-col p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:border-emerald-500/30 cursor-pointer transition-all"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 mb-2.5">
                      <img
                        src={t.thumbnail || t.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop'}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                        NEW
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate">{t.artist}</p>
                    <span className="text-[11px] text-emerald-400 font-medium mt-1">
                      {t.year || '2026'} Release
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TOP CHARTS */}
          {selectedChip === 'charts' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>Top Charts & Rankings</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Daily top 50, viral anthems & global streaming boards
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {curatedPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleOpenPlaylist(pl.id, pl)}
                    className="group p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/90 hover:border-emerald-500/40 cursor-pointer transition-all"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 mb-3 relative">
                      <img
                        src={pl.cover}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                          {pl.tracksCount || 50} Tracks
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{pl.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{pl.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ALBUMS & POPULAR ALBUMS */}
          {(selectedChip === 'albums' || selectedChip === 'popular-albums') && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-teal-400" />
                  <span>{selectedChip === 'popular-albums' ? 'Popular Albums' : 'Albums Catalog'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full original soundtracks, studio LPs & movie collections
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {featuredAlbums.map((alb) => (
                  <div
                    key={alb.id}
                    onClick={() => handleOpenAlbum(alb.id, alb)}
                    className="group p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/90 hover:border-emerald-500/40 cursor-pointer transition-all"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 mb-2.5">
                      <img
                        src={alb.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop'}
                        alt={alb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg">
                          <Disc3 className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{alb.title}</p>
                    <p className="text-xs text-slate-400 truncate">{alb.artist}</p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {alb.tracksCount || (alb.tracks ? alb.tracks.length : 10)} tracks • {alb.year || '2025'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ARTISTS & POPULAR ARTISTS */}
          {(selectedChip === 'artists' || selectedChip === 'popular-artists') && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span>{selectedChip === 'popular-artists' ? 'Popular Artists' : 'Featured Artists'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Singers, composers, music directors & global sensations
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {featuredArtists.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenArtist(art.id, art)}
                    className="group flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800/90 hover:border-emerald-500/40 cursor-pointer transition-all"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-800 mb-3 relative ring-2 ring-slate-800 group-hover:ring-emerald-500/50 transition-all">
                      <img
                        src={art.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop'}
                        alt={art.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm font-bold text-white truncate max-w-full">{art.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-full">
                      {art.role || art.genres?.[0] || 'Artist'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: PLAYLISTS */}
          {selectedChip === 'playlists' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-emerald-400" />
                    <span>Playlists Collection</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Curated sets, party anthems, workout routines & study mixes
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingDuoPlaylist(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Playlist</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* User Playlists */}
                {playlists.map((pl) => (
                  <div
                    key={pl._id || pl.id}
                    onClick={() => handleOpenPlaylist(pl._id || pl.id, pl)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/90 cursor-pointer transition-all"
                  >
                    <div className="aspect-square rounded-xl bg-slate-800 mb-3 overflow-hidden relative flex items-center justify-center">
                      <ListMusic className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{pl.name || pl.title}</h3>
                    <p className="text-xs text-slate-400">{pl.songs?.length || 0} tracks</p>
                  </div>
                ))}

                {/* Curated Community Playlists */}
                {curatedPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleOpenPlaylist(pl.id, pl)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/90 cursor-pointer transition-all"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 mb-3 relative">
                      <img src={pl.cover} alt={pl.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{pl.title}</h3>
                    <p className="text-xs text-slate-400">{pl.tracksCount || 50} tracks</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: MUSIC VIDEOS */}
          {selectedChip === 'videos' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-400" />
                  <span>Music Videos</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Official music videos, 4K lyrical videos & live concerts
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(searchVideos.length > 0 ? searchVideos : filteredQuickPicks.slice(0, 9).map(t => ({
                  id: t.id,
                  videoId: t.videoId || t.id,
                  title: t.title,
                  channel: t.artist,
                  duration: t.duration || '4:15',
                  thumbnail: t.image || t.thumbnail || `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`,
                  views: '12M+ views'
                }))).map((v, idx) => (
                  <div
                    key={v.id || idx}
                    onClick={() => handlePlayVideo(v)}
                    className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 overflow-hidden cursor-pointer transition-all"
                  >
                    <div className="relative aspect-video bg-slate-800 overflow-hidden">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-[11px] text-white">
                        {v.duration}
                      </span>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white truncate">{v.title}</h3>
                      <p className="text-xs text-slate-400 truncate">{v.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: LYRICS STUDIO */}
          {selectedChip === 'lyrics' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Lyrics Studio</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Synchronized & time-stamped lyrics in English, Telugu, Hindi and international languages
                </p>
              </div>

              {/* Lyrics Search Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lyricsSearchQuery}
                  onChange={(e) => setLyricsSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchLyrics(lyricsSearchQuery)}
                  placeholder="Search song name for lyrics (e.g. Samayama, Pushpa Pushpa, Fear Song)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSearchLyrics(lyricsSearchQuery)}
                  disabled={lyricsLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  {lyricsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Find Lyrics</span>
                </button>
              </div>

              {/* Display lyrics for current song or searched song */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative min-h-[300px]">
                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-400">Fetching synchronized lyrics...</p>
                  </div>
                ) : lyricsData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {lyricsData.trackName || currentTrack?.title || lyricsSearchQuery}
                        </h3>
                        <p className="text-xs text-emerald-400">
                          {lyricsData.artistName || currentTrack?.artist || 'Lyrics provided by LRCLIB'}
                        </p>
                      </div>
                      {lyricsData.syncedLyrics && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                          Synchronized ✨
                        </span>
                      )}
                    </div>

                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200 font-sans max-h-[500px] overflow-y-auto no-scrollbar space-y-2">
                      {lyricsData.syncedLyrics
                        ? lyricsData.syncedLyrics.split('\n').map((line, i) => (
                            <p key={i} className="hover:text-emerald-300 transition-colors py-0.5">
                              {line.replace(/^\[\d+:\d+\.\d+\]\s*/, '')}
                            </p>
                          ))
                        : lyricsData.plainLyrics || 'No lyrics available for this song.'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <FileText className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">
                      {currentTrack ? `Ready to fetch lyrics for "${currentTrack.title}"` : 'Search for any song to read lyrics'}
                    </p>
                    {currentTrack && (
                      <button
                        onClick={() => handleSearchLyrics(currentTrack.title)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-slate-700"
                      >
                        Load lyrics for Current Song
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 12: RECOMMENDED SONGS */}
          {selectedChip === 'recommended' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Recommended For You</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Curated tracks tailored to your listening habits
                  </p>
                </div>
                {filteredQuickPicks.length > 0 && (
                  <button
                    onClick={() => {
                      playTrack(filteredQuickPicks[0], filteredQuickPicks);
                      openNowPlaying();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              <SoundWaveQuickPicks
                tracks={filteredQuickPicks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={(track, queueList) => {
                  playTrack(track, queueList);
                  openNowPlaying();
                }}
                onOpenTrackMenu={handleOpenTrackMenu}
              />
            </div>
          )}

          {/* TAB 13: RECENTLY PLAYED */}
          {selectedChip === 'recent' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-sky-400" />
                    <span>Recently Played</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {userHistory.length} songs in your listening history
                  </p>
                </div>
                {userHistory.length > 0 && (
                  <button
                    onClick={() => {
                      playTrack(userHistory[0], userHistory);
                      openNowPlaying();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {userHistory.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                  No recently played songs yet. Start playing your favorite music!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
                  {userHistory.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        playTrack(t, userHistory);
                        openNowPlaying();
                      }}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          <img src={t.thumbnail || t.image} alt={t.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                          <p className="text-xs text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-emerald-400 hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 14: FAVORITES */}
          {selectedChip === 'favorites' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-current" />
                    <span>Your Favorites</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {filteredQuickPicks.length} tracks liked & saved to library
                  </p>
                </div>
                {filteredQuickPicks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playTrack(filteredQuickPicks[0], filteredQuickPicks);
                        openNowPlaying();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play All</span>
                    </button>
                    <button
                      onClick={() => {
                        const shuffled = [...filteredQuickPicks].sort(() => Math.random() - 0.5);
                        playTrack(shuffled[0], shuffled);
                        openNowPlaying();
                      }}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      title="Shuffle Favorites"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {filteredQuickPicks.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                  No favorite songs yet. Tap the heart icon on any song to save it here!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
                  {filteredQuickPicks.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        playTrack(t, filteredQuickPicks);
                        openNowPlaying();
                      }}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          <img src={t.thumbnail || t.image} alt={t.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                          <p className="text-xs text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite?.(t);
                        }}
                        className="p-2 text-rose-500 hover:scale-110 transition-transform"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 15: MOODS & GENRES */}
          {selectedChip === 'genres' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-400" />
                  <span>Moods & Genres Hub</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Explore Tollywood mass, romance, devotional, hip-hop, lo-fi, EDM & classics
                </p>
              </div>

              <SoundWaveMoodAndGenres
                categories={SOUNDWAVE_MOOD_GENRES}
                onSelectCategory={(cat) => {
                  setSearchQuery(cat.query);
                  executeSearch(cat.query);
                  setActiveMainTab('search');
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SOUNDWAVE SEARCH EXPERIENCE                                            */}
      {/* ========================================================================= */}
      {activeMainTab === 'search' && (
        <div className="max-w-6xl w-full mx-auto px-4 py-4 space-y-4 animate-in fade-in">
          {/* Search Input Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  executeSearch(e.target.value);
                }}
                placeholder="Search songs, artists, albums, or genres..."
                autoFocus
                className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchTopResult(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleVoiceSearch}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips: All | Songs | Artists | Albums | Playlists */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'songs', label: 'Songs' },
              { id: 'artists', label: 'Artists' },
              { id: 'albums', label: 'Albums' },
              { id: 'playlists', label: 'Playlists' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSearchCategoryFilter(c.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  searchCategoryFilter === c.id
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Quick Suggestions when input is empty */}
          {!searchQuery && (
            <div className="space-y-6 pt-2">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Recent & Suggested Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(s);
                        executeSearch(s);
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-2 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Mood Shortcuts */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Explore Categories
                </h4>
                <SoundWaveMoodAndGenres
                  categories={SOUNDWAVE_MOOD_GENRES.slice(0, 6)}
                  onSelectCategory={(cat) => {
                    setSearchQuery(cat.query);
                    executeSearch(cat.query);
                  }}
                />
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {searchQuery && (
            <SearchSegmentedView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchCategoryFilter={searchCategoryFilter}
              setSearchCategoryFilter={setSearchCategoryFilter}
              searchResults={searchResults}
              searchArtists={searchArtists}
              searchAlbums={searchAlbums}
              searchPlaylists={searchPlaylists}
              searchMoods={searchMoods}
              searchTopResult={searchTopResult}
              searchIntent={searchIntent}
              searchVideos={searchVideos}
              searchRelatedSongs={searchRelatedSongs}
              searchLyrics={searchLyrics}
              selectedLanguage={searchLanguageFilter}
              setSelectedLanguage={setSearchLanguageFilter}
              selectedGenre={searchGenreFilter}
              setSelectedGenre={setSearchGenreFilter}
              onApplyFilter={({ language, genre }) => {
                setSearchLanguageFilter(language);
                setSearchGenreFilter(genre);
                executeSearch(searchQuery, { language, genre });
              }}
              loading={loading}
              userPlaylists={playlists}
              recentSearches={recentSearches}
              onClearRecentSearches={() => setRecentSearches([])}
              onRemoveRecentSearch={(s) => setRecentSearches((prev) => prev.filter((i) => i !== s))}
              onSelectRecentSearch={(s) => {
                setSearchQuery(s);
                executeSearch(s);
              }}
              onSelectCategoryCard={(cat) => {
                setSearchQuery(cat.query || cat.title);
                executeSearch(cat.query || cat.title);
              }}
              onSearchChipClick={(chip) => {
                setSearchQuery(chip.query);
                executeSearch(chip.query);
              }}
              onPlayTrack={(track, q) => {
                playTrack(track, q || searchResults);
                openNowPlaying();
              }}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              isTrackDownloaded={isTrackDownloaded}
              downloadingMap={downloadingMap}
              onDownload={handleDownloadTrack}
              onOpenAlbum={handleOpenAlbum}
              onOpenArtist={handleOpenArtist}
              onOpenPlaylist={handleOpenPlaylist}
              onOpenTrackMenu={handleOpenTrackMenu}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SOUNDWAVE CHARTS & EXPLORE EXPERIENCE                                  */}
      {/* ========================================================================= */}
      {activeMainTab === 'charts' && (
        <div className="max-w-6xl w-full mx-auto px-4 py-4 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Charts & Trends
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Top streaming rankings, viral anthems & global playlists
            </p>
          </div>

          {/* Curated Top 50 Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => handleOpenPlaylist(pl.id, pl)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={pl.cover || pl.image}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {pl.tracksCount ? `${pl.tracksCount} Songs` : 'Chart'}
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-slate-300/80 line-clamp-1 mt-0.5">
                    {pl.subtitle || pl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Full Moods and Genres */}
          <section className="space-y-3 pt-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              All Moods and Genres
            </h3>
            <SoundWaveMoodAndGenres
              categories={SOUNDWAVE_MOOD_GENRES}
              onSelectCategory={(cat) => {
                setSearchQuery(cat.query);
                executeSearch(cat.query);
                setActiveMainTab('search');
              }}
            />
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SOUNDWAVE LIBRARY EXPERIENCE                                           */}
      {/* ========================================================================= */}
      {activeMainTab === 'library' && (
        <div className="max-w-6xl w-full mx-auto px-4 py-4 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Your Library
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Playlists, Liked Songs, Downloads & Listening History
              </p>
            </div>
          </div>

          {/* Library Sub-navigation Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'playlists', label: `Playlists (${userPlaylists.length})`, icon: ListMusic },
              { id: 'liked', label: `Liked Songs (${userFavorites.length})`, icon: Heart },
              { id: 'downloads', label: `Downloads (${downloadedTracks.length})`, icon: Download },
              { id: 'history', label: `History (${userHistory.length})`, icon: History },
              { id: 'artists', label: `Artists (${featuredArtists.length})`, icon: User },
              { id: 'albums', label: `Albums (${featuredAlbums.length})`, icon: Disc3 }
            ].map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = librarySubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setLibrarySubTab(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSubActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtab Content: Playlists */}
          {librarySubTab === 'playlists' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    All Playlists ({userPlaylists.length})
                  </span>
                </div>
                <button
                  onClick={() => setIsCreatingDuoPlaylist((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-emerald-500/20 hover:from-pink-500/30 hover:to-emerald-500/30 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingDuoPlaylist ? 'Cancel' : 'New Duo Playlist'}</span>
                </button>
              </div>

              {/* Quick Inline Creation Card */}
              {isCreatingDuoPlaylist && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/30 via-slate-900 to-slate-900 border border-pink-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-400" />
                    <h4 className="text-xs font-bold text-white">Create New Joint Playlist</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Late Night Drives, Summer Vibes..."
                      value={newPlaylistTitle}
                      onChange={(e) => setNewPlaylistTitle(e.target.value)}
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-300 px-1 py-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newPlaylistIsCollab}
                        onChange={(e) => setNewPlaylistIsCollab(e.target.checked)}
                        className="rounded accent-pink-500 w-3.5 h-3.5"
                      />
                      <span>Make Collaborative with Partner</span>
                    </label>
                    <button
                      onClick={async () => {
                        if (!newPlaylistTitle.trim()) return;
                        try {
                          const roomId = localStorage.getItem('duocore_room_id');
                          await createPlaylist(
                            newPlaylistTitle.trim(),
                            newPlaylistIsCollab ? 'Joint collaborative playlist created for DuoCore' : '',
                            Boolean(newPlaylistIsCollab && roomId),
                            roomId
                          );
                          setNewPlaylistTitle('');
                          setIsCreatingDuoPlaylist(false);
                          showToast('Created playlist!');
                        } catch (e) {
                          showToast('Failed to create playlist');
                        }
                      }}
                      disabled={!newPlaylistTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-40 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-pink-500/20"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {userPlaylists.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <ListMusic className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No playlists yet</p>
                  <p className="text-xs text-slate-500">
                    Create a collaborative playlist with your partner or save tracks from Search & Queue.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {userPlaylists.map((pl) => {
                    const isCollab = Boolean(pl.is_collaborative);
                    return (
                      <div
                        key={pl.id}
                        onClick={() => handleOpenPlaylist(pl.id, pl)}
                        className={`group rounded-2xl border p-3 cursor-pointer flex flex-col gap-2 transition-all shadow-md ${
                          isCollab
                            ? 'bg-gradient-to-b from-pink-950/20 to-slate-900/90 border-pink-500/30 hover:border-pink-500/60'
                            : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="aspect-square rounded-xl bg-slate-800 overflow-hidden relative">
                          <img
                            src={pl.cover || pl.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
                            alt={pl.title || pl.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isCollab && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-pink-500/90 backdrop-blur-md text-[9px] font-mono font-black text-white shadow-md flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> DUO
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-emerald-400">
                          {pl.title || pl.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{pl.tracks ? `${pl.tracks.length} songs` : `${pl.track_count || 0} songs`}</span>
                          {isCollab && <span className="text-[10px] text-pink-300 font-mono">Joint</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subtab Content: Liked Songs */}
          {librarySubTab === 'liked' && (
            <div className="space-y-3">
              {userFavorites.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No liked songs yet.</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      playTrack(userFavorites[0], userFavorites);
                      openNowPlaying();
                    }}
                    className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 mb-4"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All Liked Songs</span>
                  </button>
                  <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                    {userFavorites.map((track, idx) => (
                      <div
                        key={track.id}
                        onClick={() => {
                          playTrack(track, userFavorites);
                          openNowPlaying();
                        }}
                        className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}</span>
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {track.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track);
                          }}
                          className="p-2 text-rose-500 hover:text-rose-400"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subtab Content: Offline Downloads */}
          {librarySubTab === 'downloads' && (
            <div className="space-y-3">
              {downloadedTracks.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
                  <Download className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No downloaded tracks for offline listening.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                  {downloadedTracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => {
                        playTrack(track, downloadedTracks);
                        openNowPlaying();
                      }}
                      className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                          Offline Ready
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDownloadedTrack(track.id);
                            showToast(`Removed "${track.title}" from downloads`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtab Content: History */}
          {librarySubTab === 'history' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{userHistory.length} recently played songs</span>
                {userHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Clear History
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                {userHistory.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      playTrack(track, userHistory);
                      openNowPlaying();
                    }}
                    className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {track.playedAt ? new Date(track.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab Content: Artists */}
          {librarySubTab === 'artists' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredArtists.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleOpenArtist(art.id, art)}
                  className="group flex flex-col items-center text-center cursor-pointer p-2"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-800 mb-2 border border-slate-800 group-hover:border-emerald-400 transition-all shadow-md group-hover:scale-105">
                    <img
                      src={art?.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'}
                      alt={art?.name || 'Artist'}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-emerald-400">
                    {art?.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{art?.role || 'Artist'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Subtab Content: Albums */}
          {librarySubTab === 'albums' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {featuredAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => handleOpenAlbum(alb.id, alb)}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-3 cursor-pointer flex flex-col gap-2 transition-all shadow-md"
                >
                  <div className="aspect-square rounded-xl bg-slate-800 overflow-hidden relative">
                    <img
                      src={alb?.cover || alb?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
                      alt={alb?.title || 'Album'}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-emerald-400">
                    {alb?.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{alb?.artist}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Album Detail Modal */}
      <AlbumDetailModal
        albumId={selectedAlbumId}
        albumData={selectedAlbumData}
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onOpenArtist={(art) => {
          setIsAlbumModalOpen(false);
          handleOpenArtist(art);
        }}
      />

      {/* Artist Detail Modal */}
      <ArtistDetailModal
        artistId={selectedArtistId}
        artistData={selectedArtistData}
        isOpen={isArtistModalOpen}
        onClose={() => setIsArtistModalOpen(false)}
        onOpenAlbum={(albId, albData) => {
          setIsArtistModalOpen(false);
          handleOpenAlbum(albId, albData);
        }}
      />

      {/* Track Action Menu */}
      <TrackActionMenu
        track={selectedActionTrack}
        isOpen={isActionMenuOpen}
        onClose={() => setIsActionMenuOpen(false)}
        onOpenAlbum={(alb) => handleOpenAlbum(alb)}
        onOpenArtist={(art) => handleOpenArtist(art)}
        onShowToast={showToast}
      />

      {/* Playlist Detail Modal */}
      <PlaylistDetailModal
        playlistId={selectedPlaylistId}
        playlistData={selectedPlaylistData}
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setSelectedPlaylistData(null);
        }}
      />
    </div>
  );
}
