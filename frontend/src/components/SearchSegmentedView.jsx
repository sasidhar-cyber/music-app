import React from 'react';
import {
  Search,
  Play,
  Download,
  Heart,
  Sparkles,
  Flame,
  Disc3,
  History,
  Check,
  Plus,
  User,
  MoreVertical,
  ArrowRight,
  ListMusic,
  Loader2,
  Music,
  Volume2,
  Video,
  FileText,
  Filter,
  Globe,
  Radio,
  Layers
} from 'lucide-react';

export const SEARCH_LANGUAGES = [
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

export const SEARCH_GENRES = [
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

const SPOTIFY_SEARCH_CHIPS = [
  { label: '🌟 The Weeknd', query: 'The Weeknd' },
  { label: '✨ Taylor Swift', query: 'Taylor Swift' },
  { label: '⚡ Linkin Park', query: 'Linkin Park' },
  { label: '🎤 Billie Eilish', query: 'Billie Eilish' },
  { label: '🎶 Coldplay', query: 'Coldplay' },
  { label: '🎸 Imagine Dragons', query: 'Imagine Dragons' },
  { label: '🔥 Pushpa 2', query: 'Pushpa 2' },
  { label: '👑 Sid Sriram', query: 'Sid Sriram' },
  { label: '🌟 Arijit Singh', query: 'Arijit Singh' },
  { label: '⚡ Devara', query: 'Devara' },
  { label: '🎸 Anirudh', query: 'Anirudh' },
  { label: '🕊️ Shreya Ghoshal', query: 'Shreya Ghoshal' }
];

const SPOTIFY_BROWSE_CATEGORIES = [
  {
    id: 'cat-global-pop',
    title: 'Global Pop & English',
    subtitle: 'Billboard Hot 100 & Worldwide Anthems',
    gradient: 'from-violet-600 via-indigo-700 to-slate-900',
    borderColor: 'border-violet-500/40',
    tag: 'Global 🌍',
    query: 'Global Pop Hits',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop'
  },
  {
    id: 'cat-todays-top-hits',
    title: "Today's Top Hits",
    subtitle: 'Ed Sheeran, The Weeknd, Taylor Swift & Billie',
    gradient: 'from-sky-600 via-blue-700 to-slate-900',
    borderColor: 'border-sky-500/40',
    tag: 'Chartbusters ✨',
    query: 'Ed Sheeran Taylor Swift The Weeknd',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop'
  },
  {
    id: 'cat-rock-anthems',
    title: 'Rock & Alt Anthems',
    subtitle: 'Imagine Dragons, Coldplay & Linkin Park',
    gradient: 'from-rose-600 via-red-700 to-slate-900',
    borderColor: 'border-rose-500/40',
    tag: 'Rock ⚡',
    query: 'Imagine Dragons Coldplay Linkin Park',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop'
  },
  {
    id: 'cat-telugu-hits',
    title: 'Telugu Hits',
    subtitle: 'Tollywood Top 50 & Blockbusters',
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    borderColor: 'border-emerald-500/40',
    tag: 'Trending 🔥',
    query: 'Telugu Hits',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg'
  },
  {
    id: 'cat-tollywood-mass',
    title: 'Tollywood Mass',
    subtitle: 'High Voltage Dance & Whistle Beats',
    gradient: 'from-amber-600 via-orange-700 to-slate-900',
    borderColor: 'border-amber-500/40',
    tag: 'Dance ⚡',
    query: 'Pushpa 2 Devara',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg'
  },
  {
    id: 'cat-bollywood-hits',
    title: 'Bollywood Hits',
    subtitle: 'Hindi Blockbusters & Viral Tracks',
    gradient: 'from-amber-500 via-yellow-600 to-slate-900',
    borderColor: 'border-yellow-500/40',
    tag: 'Bollywood 🌟',
    query: 'Bollywood Hits Hindi',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg'
  }
];

export function SearchSegmentedView({
  searchQuery,
  setSearchQuery,
  searchCategoryFilter,
  setSearchCategoryFilter,
  searchResults = [],
  searchVideos = [],
  searchArtists = [],
  searchAlbums = [],
  searchPlaylists = [],
  searchRelatedSongs = [],
  searchLyrics = null,
  searchMoods = [],
  searchTopResult = null,
  searchIntent = null,
  selectedLanguage = '',
  setSelectedLanguage,
  selectedGenre = '',
  setSelectedGenre,
  onApplyFilter,
  loading = false,
  userPlaylists = [],
  recentSearches = [],
  onClearRecentSearches,
  onRemoveRecentSearch,
  onSelectRecentSearch,
  onSelectCategoryCard,
  onSearchChipClick,
  onPlayTrack,
  currentTrack,
  isPlaying,
  isFavorite,
  toggleFavorite,
  isTrackDownloaded,
  downloadingMap = {},
  onDownload,
  onOpenAlbum,
  onOpenArtist,
  onOpenPlaylist,
  onOpenTrackMenu,
  showToast
}) {
  // Matching user custom playlists
  const matchingUserPlaylists = React.useMemo(() => {
    if (!searchQuery.trim()) return userPlaylists;
    const q = searchQuery.toLowerCase().trim();
    return userPlaylists.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [userPlaylists, searchQuery]);

  const totalPlaylistCount = (searchPlaylists?.length || 0) + (matchingUserPlaylists?.length || 0);

  // Video UI Card Component
  const renderVideoCard = (video, queue = searchVideos, index = 0) => {
    const isThisTrack = currentTrack?.id === video.id || currentTrack?.videoId === video.videoId;
    return (
      <div
        key={`video-card-${video.id || video.videoId || index}`}
        id={`search-video-${video.id || video.videoId || index}`}
        onClick={() => onPlayTrack(video, queue.length > 0 ? queue : [video])}
        className={`group relative p-3 rounded-2xl transition-all duration-200 cursor-pointer border flex flex-col justify-between gap-2.5 ${
          isThisTrack
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40'
            : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-rose-500/40'
        }`}
      >
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
          <img
            src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
            alt={video.title}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=480&h=270&fit=crop';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600/90 text-white font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
            <Video className="w-2.5 h-2.5" />
            <span>VIDEO</span>
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
              {video.duration}
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="truncate">{video.channel || video.artist || 'Official Music Video'}</span>
            {video.views && <span className="shrink-0 text-[10px] font-mono">{video.views}</span>}
          </div>
        </div>
      </div>
    );
  };

  // Lyrics UI Card Component
  const renderLyricsCard = (lyricsData) => {
    if (!lyricsData) return null;
    const lyricsLines = lyricsData.lyrics || lyricsData.plainLyrics || lyricsData.syncedLyrics || '';
    const displaySnippet = typeof lyricsLines === 'string'
      ? lyricsLines.split('\n').filter(Boolean).slice(0, 14).join('\n')
      : 'Synced lyrics available for this song.';

    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                {lyricsData.syncedLyrics ? 'Synced Lyrics' : 'Official Lyrics'}
              </span>
              <h4 className="text-base font-black text-white">
                {lyricsData.trackName || lyricsData.title || searchQuery}
              </h4>
              <p className="text-xs text-slate-400">
                {lyricsData.artistName || lyricsData.artist || 'Verified LRCLIB Provider'}
              </p>
            </div>
          </div>
          {searchResults.length > 0 && (
            <button
              onClick={() => onPlayTrack(searchResults[0], searchResults)}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Song</span>
            </button>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20 font-mono text-xs sm:text-sm text-purple-200/90 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
          {displaySnippet}
        </div>
      </div>
    );
  };

  // 1. Song UI Card Component
  const renderSongCard = (track, queue = searchResults, index = 0) => {
    const isThisTrack = currentTrack?.id === track.id;
    const isThisPlaying = isThisTrack && isPlaying;
    const isFav = isFavorite?.(track.id);
    const isDownloaded = isTrackDownloaded?.(track.id);
    const isDownloading = downloadingMap[track.id];

    return (
      <div
        key={`search-song-${track.id}-${index}`}
        id={`search-song-card-${track.id}`}
        onClick={() => onPlayTrack(track, queue)}
        className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border flex items-center justify-between gap-3 ${
          isThisTrack
            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
            : 'bg-slate-900/75 hover:bg-slate-850 border-slate-800/80 hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Cover Art + Dynamic Audio Wave / Play Overlay */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
            <img
              src={
                track.thumbnail ||
                track.cover ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop'
              }
              alt={track.title}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop';
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isThisPlaying ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
                <span className="w-1 h-3.5 bg-emerald-400 animate-pulse rounded-full" />
                <span className="w-1 h-5 bg-emerald-400 animate-bounce rounded-full" />
                <span className="w-1 h-2.5 bg-emerald-400 animate-pulse rounded-full" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Song Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                  isThisTrack ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'
                }`}
              >
                {track.title}
              </h4>
              {track.language && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0 hidden sm:inline-block">
                  {track.language}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              <span className="truncate hover:text-slate-200 transition-colors font-medium">
                {track.artist}
              </span>
              {track.album && (
                <>
                  <span className="text-slate-600 font-bold">•</span>
                  <span className="truncate text-slate-500 hidden sm:inline">{track.album}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {track.duration && (
            <span className="text-[11px] font-mono text-slate-500 hidden md:inline-block mr-1">
              {track.duration}
            </span>
          )}

          {/* Offline Download */}
          <button
            id={`download-track-${track.id}`}
            onClick={(e) => onDownload?.(track, e)}
            disabled={isDownloading || isDownloaded}
            className={`p-2 rounded-xl transition-all ${
              isDownloaded
                ? 'text-emerald-400 bg-emerald-500/10'
                : isDownloading
                ? 'text-amber-400 animate-pulse bg-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isDownloaded ? 'Saved Offline' : 'Download for Offline'}
          >
            {isDownloaded ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            ) : isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Favorite Heart */}
          <button
            id={`fav-track-${track.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite?.(track);
              showToast?.(isFav ? 'Removed from Liked Songs' : 'Saved to Liked Songs');
            }}
            className={`p-2 rounded-xl transition-all ${
              isFav ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
            title={isFav ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          {/* More Options */}
          <button
            id={`menu-track-${track.id}`}
            onClick={(e) => onOpenTrackMenu?.(track, e)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Options"
          >
            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  // 2. Album UI Card Component
  const renderAlbumCard = (alb) => {
    return (
      <div
        key={`album-card-${alb.id}`}
        id={`search-album-${alb.id}`}
        onClick={() => onOpenAlbum?.(alb.id, alb)}
        className="group relative p-3.5 sm:p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-950/20"
      >
        <div>
          {/* Vinyl Disc Sleeve Effect on Hover */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3.5 bg-slate-800 shadow-md">
            {/* Vinyl Disc Peak Graphic */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-950 border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>

            <img
              src={
                alb.cover ||
                alb.thumbnail ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'
              }
              alt={alb.title}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Album Tag */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-[9px] font-mono font-bold text-amber-400">
              ALBUM
            </div>

            {/* Quick Play Hover Button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenAlbum?.(alb.id, alb);
              }}
              className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl shadow-amber-500/30 transition-all translate-y-2 group-hover:translate-y-0 active:scale-95"
              title="Open & Play Album"
            >
              <Play className="w-4 h-4 fill-current ml-0.5 text-slate-950" />
            </div>
          </div>

          {/* Album Meta */}
          <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-amber-300 transition-colors leading-tight">
            {alb.title}
          </h4>
          <p className="text-xs font-medium text-slate-400 truncate mt-1">
            {alb.artist || 'Original Soundtrack'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-amber-400/90 font-mono text-[10px]">
            {alb.year || 'Soundtrack'}
          </span>
          <span className="flex items-center gap-1 text-slate-400 group-hover:text-amber-400 transition-colors">
            <span>{alb.songCount || alb.tracks?.length ? `${alb.songCount || alb.tracks?.length} tracks` : 'View'}</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  };

  // 3. Artist UI Card Component
  const renderArtistCard = (art) => {
    if (!art) return null;
    const artId = art.id || art.artistId || Math.random().toString(36);
    const artImg =
      art.image ||
      art.avatar ||
      art.picture ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
    const artName = art.name || art.title || 'Artist';

    return (
      <div
        key={`artist-card-${artId}`}
        id={`search-artist-${artId}`}
        onClick={() => onOpenArtist?.(artId, art)}
        className="group relative p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:shadow-cyan-950/20"
      >
        {/* Circular Avatar with Glowing Ring */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3.5 bg-slate-800 p-1 border-2 border-slate-700/80 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-500">
          <img
            src={artImg}
            alt={artName}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
            }}
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* Quick Play Hover Button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenArtist?.(artId, art);
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5 text-slate-950" />
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider inline-block mb-1">
            {art.role || 'Artist'}
          </span>
          <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-cyan-300 transition-colors leading-tight">
            {art.name}
          </h4>
          <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
            {art.subtitle || 'Verified Discography'}
          </p>
        </div>

        <div className="w-full pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-center">
          <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
            <span>Explore Discography</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  };

  // 4. Playlist UI Card Component
  const renderPlaylistCard = (pl) => {
    const isUser = pl.isUser || pl.type === 'custom' || !pl.curator;
    return (
      <div
        key={`playlist-card-${pl.id}`}
        id={`search-playlist-${pl.id}`}
        onClick={() => onOpenPlaylist?.(pl.id, pl)}
        className="group relative p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-950/20"
      >
        <div>
          {/* Layered Cover Artwork */}
          <div className="relative w-full aspect-video sm:aspect-square rounded-2xl overflow-hidden mb-3.5 bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center border border-indigo-500/20">
            {pl.thumbnail || pl.cover ? (
              <img
                src={pl.thumbnail || pl.cover}
                alt={pl.name || pl.title}
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-indigo-400 gap-2">
                <ListMusic className="w-10 h-10" />
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-300">
                  Playlist
                </span>
              </div>
            )}

            {/* Playlist Tag */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-indigo-500/30 text-[9px] font-mono font-bold text-indigo-400">
              {isUser ? 'YOUR PLAYLIST' : 'CURATED'}
            </div>

            {/* Quick Play Hover Button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenPlaylist?.(pl.id, pl);
              }}
              className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl shadow-indigo-500/30 transition-all translate-y-2 group-hover:translate-y-0 active:scale-95"
              title="Open Playlist"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>

          {/* Playlist Meta */}
          <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-indigo-300 transition-colors leading-tight">
            {pl.name || pl.title}
          </h4>
          <p className="text-xs font-medium text-slate-400 truncate mt-1">
            {pl.description || (isUser ? 'Custom Collection' : 'Curated by SoundWave')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-indigo-400/90 font-mono text-[10px]">
            {pl.songCount || pl.songs?.length || 0} Tracks
          </span>
          <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors">
            <span>Open</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7 animate-in fade-in" id="search-segmented-root">
      {/* 1. Category Filter Segment Tabs (Always accessible when query is present) */}
      {searchQuery && (
        <div className="space-y-3">
          {/* Language and Genre Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold px-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filters:</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <select
                id="search-language-select"
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage?.(e.target.value);
                  onApplyFilter?.({ language: e.target.value, genre: selectedGenre });
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:border-emerald-500 focus:outline-none focus:border-emerald-400"
              >
                {SEARCH_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <select
                id="search-genre-select"
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre?.(e.target.value);
                  onApplyFilter?.({ language: selectedLanguage, genre: e.target.value });
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:border-purple-500 focus:outline-none focus:border-purple-400"
              >
                {SEARCH_GENRES.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {(selectedLanguage || selectedGenre) && (
              <button
                onClick={() => {
                  setSelectedLanguage?.('');
                  setSelectedGenre?.('');
                  onApplyFilter?.({ language: '', genre: '' });
                }}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 ml-auto px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Segment Tabs Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              {
                id: 'all',
                label: 'All',
                icon: Sparkles,
                count:
                  searchResults.length +
                  searchAlbums.length +
                  searchArtists.length +
                  totalPlaylistCount +
                  searchVideos.length
              },
              { id: 'songs', label: 'Songs', icon: Music, count: searchResults.length },
              { id: 'albums', label: 'Albums', icon: Disc3, count: searchAlbums.length },
              { id: 'artists', label: 'Artists', icon: User, count: searchArtists.length },
              { id: 'playlists', label: 'Playlists', icon: ListMusic, count: totalPlaylistCount },
              { id: 'videos', label: 'Music Videos', icon: Video, count: searchVideos.length },
              { id: 'related', label: 'Related Songs', icon: Sparkles, count: searchRelatedSongs.length },
              { id: 'lyrics', label: 'Lyrics', icon: FileText, count: searchLyrics ? 1 : 0 }
            ].map((pill) => {
              const isSelected = searchCategoryFilter === pill.id;
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  id={`search-tab-${pill.id}`}
                  onClick={() => setSearchCategoryFilter(pill.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105 font-black'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{pill.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading Indicator banner */}
          {loading && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold w-fit animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching across songs, albums, artists, videos & lyrics...</span>
            </div>
          )}
        </div>
      )}

      {/* 2. When NO Search Query: Browse Grid & Search History */}
      {!searchQuery ? (
        <div className="space-y-8 animate-in fade-in" id="search-empty-browse">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Recent searches</span>
                </h3>
                <button
                  onClick={onClearRecentSearches}
                  className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectRecentSearch?.(item)}
                    className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all shadow-sm"
                  >
                    <History className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                    <span>{item}</span>
                    <button
                      onClick={(e) => onRemoveRecentSearch?.(item, e)}
                      className="p-0.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Chips */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Trending & Popular Searches</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {SPOTIFY_SEARCH_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearchChipClick?.(chip)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-all active:scale-95 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories Bento Grid */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-white">Browse All Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {SPOTIFY_BROWSE_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategoryCard?.(cat)}
                  className={`relative p-4 rounded-3xl bg-gradient-to-br ${cat.gradient} border ${cat.borderColor} hover:scale-[1.02] cursor-pointer transition-all duration-300 overflow-hidden min-h-[140px] flex flex-col justify-between shadow-xl group`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 font-bold">
                      {cat.tag}
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5">
                      {cat.title}
                    </h4>
                  </div>

                  <div className="absolute -bottom-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all translate-y-2 group-hover:translate-y-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-slate-950" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 3. When Search Query IS Present: Segmented Spotify Experience */
        <div className="space-y-8 animate-in fade-in" id="search-results-container">
          {/* Intent / Mood Banner */}
          {(searchIntent?.mood || searchMoods.length > 0) && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Curated Search Match
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white capitalize">
                    {searchIntent?.mood || searchQuery} Collection
                  </h3>
                  <p className="text-xs text-slate-300">
                    Smart ranked results for your query
                  </p>
                </div>
              </div>

              {searchResults.length > 0 && (
                <button
                  onClick={() => onPlayTrack(searchResults[0], searchResults)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Mix ({searchResults.length})</span>
                </button>
              )}
            </div>
          )}

          {/* SKELETON LOADING STATE */}
          {loading && searchResults.length === 0 && (
            <div className="space-y-6 animate-pulse" id="search-skeleton-loader">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 h-72 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between">
                  <div className="w-28 h-28 rounded-2xl bg-slate-800" />
                  <div className="space-y-2">
                    <div className="w-3/4 h-6 rounded-lg bg-slate-800" />
                    <div className="w-1/2 h-4 rounded-lg bg-slate-800" />
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-3">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 p-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="w-1/2 h-4 rounded bg-slate-800" />
                        <div className="w-1/3 h-3 rounded bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW A: ALL SEGMENT (Top Match + Songs + Albums + Artists + Playlists) */}
          {searchCategoryFilter === 'all' && (
            <div className="space-y-9" id="search-all-view">
              {!loading && searchResults.length === 0 && searchArtists.length === 0 && searchAlbums.length === 0 && !searchTopResult && (
                <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-md mx-auto my-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">No results found for "{searchQuery}"</h4>
                  <p className="text-xs text-slate-400">
                    Check your spelling or try searching for a different song title, artist name, or album.
                  </p>
                </div>
              )}

              {/* Top Result Signature Box + Top 4 Songs */}
              {(searchTopResult || searchResults.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left: Top Match Adaptive Card */}
                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900 to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between shadow-2xl relative group">
                    {(() => {
                      const isArtistMatch =
                        searchTopResult?.type === 'artist' &&
                        (searchTopResult?.data || searchTopResult?.name || searchTopResult?.title);
                      const isAlbumMatch =
                        searchTopResult?.type === 'album' &&
                        (searchTopResult?.data || searchTopResult?.title);

                      if (isArtistMatch) {
                        const artistData = searchTopResult?.data || searchTopResult || {};
                        const artistImg =
                          artistData.image ||
                          artistData.avatar ||
                          artistData.picture ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
                        const artistName = artistData.name || artistData.title || 'Featured Artist';
                        const artistRole = artistData.role || artistData.badge || 'Featured Artist';
                        const artistSubtitle =
                          artistData.subtitle || artistData.bio || 'Artist • Verified Discography';
                        const artistId = artistData.id || artistData.artistId || '';

                        return (
                          <>
                            <div>
                              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl mb-4 border-2 border-cyan-400/40 group-hover:border-cyan-400 group-hover:scale-105 transition-all duration-500 bg-slate-800">
                                <img
                                  src={artistImg}
                                  alt={artistName}
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                                  TOP ARTIST
                                </div>
                              </div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                                {artistRole}
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1 line-clamp-1">
                                {artistName}
                              </h2>
                              <p className="text-xs font-medium text-slate-300 mt-1">
                                {artistSubtitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                              <button
                                onClick={() => onOpenArtist?.(artistId, artistData)}
                                className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
                              >
                                <User className="w-4 h-4" />
                                <span>View Artist</span>
                              </button>
                              {searchResults.length > 0 && (
                                <button
                                  onClick={() => onPlayTrack(searchResults[0], searchResults)}
                                  className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 shrink-0"
                                  title="Play Top Songs"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              )}
                            </div>
                          </>
                        );
                      }

                      if (isAlbumMatch) {
                        const albumData = searchTopResult?.data || searchTopResult || {};
                        const albumCover =
                          albumData.cover ||
                          albumData.thumbnail ||
                          albumData.image ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                        const albumTitle = albumData.title || albumData.name || 'Featured Album';
                        const albumYear = albumData.year || 'Soundtrack';
                        const albumArtist = albumData.artist || 'Various Artists';
                        const albumId = albumData.id || albumData.albumId || '';

                        return (
                          <>
                            <div>
                              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl mb-4 border border-white/10 group-hover:scale-105 transition-transform duration-500 bg-slate-800">
                                <img
                                  src={albumCover}
                                  alt={albumTitle}
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-400 border border-amber-500/30">
                                  TOP ALBUM
                                </div>
                              </div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                                Album • {albumYear}
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1 line-clamp-1">
                                {albumTitle}
                              </h2>
                              <p className="text-xs sm:text-sm font-bold text-slate-300 mt-0.5 truncate">
                                {albumArtist}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                              <button
                                onClick={() => onOpenAlbum?.(albumId, albumData)}
                                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
                              >
                                <Disc3 className="w-4 h-4" />
                                <span>View Album</span>
                              </button>
                              {searchResults.length > 0 && (
                                <button
                                  onClick={() => onPlayTrack(searchResults[0], searchResults)}
                                  className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 shrink-0"
                                  title="Play Album"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              )}
                            </div>
                          </>
                        );
                      }

                      // Top Song Match fallback
                      const songData =
                        searchTopResult?.data ||
                        (searchTopResult?.title ? searchTopResult : null) ||
                        searchResults[0] ||
                        {};
                      const songThumb =
                        songData.thumbnail ||
                        songData.cover ||
                        songData.image ||
                        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop';
                      const songTitle = songData.title || 'Featured Song';
                      const songArtist = songData.artist || 'SoundWave Music';
                      const songLanguage = songData.language || 'Featured Song';

                      return (
                        <>
                          <div>
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl mb-4 border border-white/10 group-hover:scale-105 transition-transform duration-500 bg-slate-800">
                              <img
                                src={songThumb}
                                alt={songTitle}
                                onError={(e) => {
                                  e.target.src =
                                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                                TOP MATCH
                              </div>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                              {songLanguage}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1 line-clamp-1">
                              {songTitle}
                            </h2>
                            <p className="text-xs sm:text-sm font-bold text-slate-300 mt-0.5 truncate">
                              {songArtist}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 pt-4">
                            <button
                              onClick={() => onPlayTrack(songData, searchResults)}
                              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>Play Now</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Right: Top 4 Song Tracks Preview */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-emerald-400" />
                        <span>Songs</span>
                      </h3>
                      {searchResults.length > 4 && (
                        <button
                          onClick={() => setSearchCategoryFilter('songs')}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          <span>See all ({searchResults.length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {searchResults.slice(0, 4).map((track, idx) => renderSongCard(track, searchResults, idx))}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Matching Albums */}
              {searchAlbums.length > 0 && (
                <div className="space-y-4" id="search-section-albums">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Disc3 className="w-5 h-5 text-amber-400" />
                      <span>Albums</span>
                    </h3>
                    {searchAlbums.length > 4 && (
                      <button
                        onClick={() => setSearchCategoryFilter('albums')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <span>See all ({searchAlbums.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchAlbums.slice(0, 4).map(renderAlbumCard)}
                  </div>
                </div>
              )}

              {/* Section 3: Matching Artists */}
              {searchArtists.length > 0 && (
                <div className="space-y-4" id="search-section-artists">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-400" />
                      <span>Artists</span>
                    </h3>
                    {searchArtists.length > 4 && (
                      <button
                        onClick={() => setSearchCategoryFilter('artists')}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <span>See all ({searchArtists.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchArtists.slice(0, 4).map(renderArtistCard)}
                  </div>
                </div>
              )}

              {/* Section 4: Matching Playlists */}
              {totalPlaylistCount > 0 && (
                <div className="space-y-4" id="search-section-playlists">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <ListMusic className="w-5 h-5 text-indigo-400" />
                      <span>Playlists</span>
                    </h3>
                    {totalPlaylistCount > 3 && (
                      <button
                        onClick={() => setSearchCategoryFilter('playlists')}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        <span>See all ({totalPlaylistCount})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      ...searchPlaylists.map((pl) => ({ ...pl, isUser: false })),
                      ...matchingUserPlaylists.map((pl) => ({ ...pl, isUser: true }))
                    ]
                      .slice(0, 3)
                      .map(renderPlaylistCard)}
                  </div>
                </div>
              )}

              {/* Section 5: All Matching Songs Grid (Remaining) */}
              {searchResults.length > 4 && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-emerald-400" />
                      <span>More Songs for "{searchQuery}"</span>
                    </h3>
                    <button
                      onClick={() => onPlayTrack(searchResults[0], searchResults)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play All ({searchResults.length})</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {searchResults.slice(4).map((track, idx) =>
                      renderSongCard(track, searchResults, idx + 4)
                    )}
                  </div>
                </div>
              )}

              {/* Section 6: Music Videos */}
              {searchVideos.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80" id="search-section-videos">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Video className="w-5 h-5 text-rose-500" />
                      <span>Music Videos</span>
                    </h3>
                    {searchVideos.length > 4 && (
                      <button
                        onClick={() => setSearchCategoryFilter('videos')}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        <span>See all ({searchVideos.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchVideos.slice(0, 4).map((video, idx) => renderVideoCard(video, searchVideos, idx))}
                  </div>
                </div>
              )}

              {/* Section 7: Related Songs */}
              {searchRelatedSongs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80" id="search-section-related">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Related Songs</span>
                    </h3>
                    {searchRelatedSongs.length > 4 && (
                      <button
                        onClick={() => setSearchCategoryFilter('related')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <span>See all ({searchRelatedSongs.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {searchRelatedSongs.slice(0, 6).map((track, idx) =>
                      renderSongCard(track, searchRelatedSongs, idx)
                    )}
                  </div>
                </div>
              )}

              {/* Section 8: Lyrics */}
              {searchLyrics && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80" id="search-section-lyrics">
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Lyrics</span>
                  </h3>
                  {renderLyricsCard(searchLyrics)}
                </div>
              )}
            </div>
          )}

          {/* VIEW B: SONGS ONLY SEGMENT */}
          {searchCategoryFilter === 'songs' && (
            <div className="space-y-5" id="search-songs-view">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <span>Songs matching "{searchQuery}"</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchResults.length} {searchResults.length === 1 ? 'track' : 'tracks'} found
                  </p>
                </div>

                {searchResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayTrack(searchResults[0], searchResults)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play All</span>
                    </button>
                  </div>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <Music className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No songs found</h4>
                  <p className="text-xs text-slate-400">Try searching for a different track title or artist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((track, idx) => renderSongCard(track, searchResults, idx))}
                </div>
              )}
            </div>
          )}

          {/* VIEW C: ALBUMS ONLY SEGMENT */}
          {searchCategoryFilter === 'albums' && (
            <div className="space-y-5" id="search-albums-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-amber-400" />
                  <span>Albums matching "{searchQuery}"</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchAlbums.length} {searchAlbums.length === 1 ? 'album' : 'albums'} found
                </p>
              </div>

              {searchAlbums.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <Disc3 className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No albums found</h4>
                  <p className="text-xs text-slate-400">Try searching by movie or album name.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchAlbums.map(renderAlbumCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW D: ARTISTS ONLY SEGMENT */}
          {searchCategoryFilter === 'artists' && (
            <div className="space-y-5" id="search-artists-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>Artists matching "{searchQuery}"</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchArtists.length} {searchArtists.length === 1 ? 'artist' : 'artists'} found
                </p>
              </div>

              {searchArtists.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <User className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No artists found</h4>
                  <p className="text-xs text-slate-400">Try searching for a singer or composer name.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchArtists.map(renderArtistCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW E: PLAYLISTS ONLY SEGMENT */}
          {searchCategoryFilter === 'playlists' && (
            <div className="space-y-5" id="search-playlists-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-indigo-400" />
                    <span>Playlists matching "{searchQuery}"</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {totalPlaylistCount} playlists available
                  </p>
                </div>
              </div>

              {totalPlaylistCount === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <ListMusic className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No playlists found</h4>
                  <p className="text-xs text-slate-400">Try searching for different keywords or genres.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    ...searchPlaylists.map((pl) => ({ ...pl, isUser: false })),
                    ...matchingUserPlaylists.map((pl) => ({ ...pl, isUser: true }))
                  ].map(renderPlaylistCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW F: VIDEOS ONLY SEGMENT */}
          {searchCategoryFilter === 'videos' && (
            <div className="space-y-5" id="search-videos-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-rose-500" />
                    <span>Music Videos matching "{searchQuery}"</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchVideos.length} videos available
                  </p>
                </div>
              </div>

              {searchVideos.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <Video className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No music videos found</h4>
                  <p className="text-xs text-slate-400">Try searching for the song title or artist name.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchVideos.map((video, idx) => renderVideoCard(video, searchVideos, idx))}
                </div>
              )}
            </div>
          )}

          {/* VIEW G: RELATED SONGS SEGMENT */}
          {searchCategoryFilter === 'related' && (
            <div className="space-y-5" id="search-related-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Songs Related to "{searchQuery}"</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchRelatedSongs.length} recommended tracks
                  </p>
                </div>
                {searchRelatedSongs.length > 0 && (
                  <button
                    onClick={() => onPlayTrack(searchRelatedSongs[0], searchRelatedSongs)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {searchRelatedSongs.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No related songs found</h4>
                  <p className="text-xs text-slate-400">Play any song to discover recommendations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchRelatedSongs.map((track, idx) => renderSongCard(track, searchRelatedSongs, idx))}
                </div>
              )}
            </div>
          )}

          {/* VIEW H: LYRICS SEGMENT */}
          {searchCategoryFilter === 'lyrics' && (
            <div className="space-y-5" id="search-lyrics-view">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Lyrics for "{searchQuery}"</span>
                </h3>
              </div>

              {searchLyrics ? (
                renderLyricsCard(searchLyrics)
              ) : (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No lyrics found</h4>
                  <p className="text-xs text-slate-400">Try searching for the exact song title and singer name.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
