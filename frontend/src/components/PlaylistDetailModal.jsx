import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Shuffle,
  ListPlus,
  ListMusic,
  Trash2,
  Music,
  Clock,
  Sparkles,
  Heart,
  Download,
  Check,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import api from '../services/api';
import { downloadTrack, isTrackDownloaded } from '../utils/downloadManager';

export function PlaylistDetailModal({ playlistId, playlistData = null, isOpen, onClose }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    addToQueue,
    isFavorite,
    toggleFavorite,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
    deletePlaylist,
    fetchPlaylists,
    openNowPlaying
  } = useMusic();

  const [playlist, setPlaylist] = useState(playlistData || null);
  const [loading, setLoading] = useState(false);
  const [downloadingMap, setDownloadingMap] = useState({});
  const [downloadedMap, setDownloadedMap] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  const isUserCreated = playlist?.user_id || (typeof playlist?.id === 'string' && playlist.id.startsWith('pl-'));
  const isCollab = Boolean(playlist?.is_collaborative);

  const loadPlaylist = async () => {
    if (!playlistId) return;
    setLoading(true);
    try {
      const res = await api.getPlaylist(playlistId);
      if (res?.playlist || res) {
        const pl = res.playlist || res;
        setPlaylist((prev) => ({
          ...prev,
          ...pl,
          title: pl.title || pl.name || prev?.title || prev?.name || 'Playlist Details',
          name: pl.name || pl.title || prev?.name || prev?.title || 'Playlist Details',
          cover: pl.cover || pl.thumbnail || prev?.cover || prev?.thumbnail || ''
        }));
        const dMap = {};
        (pl.tracks || pl.songs || []).forEach((t) => {
          const tid = t.id || t.track_id;
          if (tid && isTrackDownloaded(tid)) dMap[tid] = true;
        });
        setDownloadedMap(dMap);
      }
    } catch (err) {
      console.warn('Playlist API call failed, using fallback:', err);
      if (playlistData) {
        setPlaylist(playlistData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && playlistId) {
      if (playlistData) {
        setPlaylist(playlistData);
      }
      loadPlaylist();
    } else {
      setPlaylist(null);
    }
  }, [isOpen, playlistId, playlistData]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const tracks = playlist?.tracks || playlist?.songs || playlistData?.tracks || playlistData?.songs || [];

  const handlePlayAll = (shuffle = false) => {
    if (tracks.length === 0) return;
    const formattedTracks = tracks.map((t) => ({
      ...t,
      id: t.id || t.track_id
    }));
    let list = [...formattedTracks];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
    }
    playTrack(list[0], list);
    openNowPlaying();
    showToast(shuffle ? '🔀 Shuffling playlist...' : '▶ Playing playlist...');
  };

  const handleQueuePlaylist = () => {
    if (tracks.length === 0) return;
    const formattedTracks = tracks.map((t) => ({
      ...t,
      id: t.id || t.track_id
    }));
    addToQueue(formattedTracks);
    showToast(`Added ${formattedTracks.length} songs to queue!`);
  };

  const handleRemoveTrack = async (trackId, e) => {
    e?.stopPropagation?.();
    if (!playlistId || !trackId) return;
    try {
      await removeSongFromPlaylist(playlistId, trackId);
      setPlaylist((prev) => {
        if (!prev) return prev;
        const remaining = (prev.tracks || prev.songs || []).filter(
          (t) => (t.id || t.track_id) !== trackId
        );
        return { ...prev, tracks: remaining, songs: remaining, songCount: remaining.length };
      });
      showToast('Removed song from playlist');
    } catch (err) {
      showToast('Failed to remove song');
    }
  };

  const handleMoveTrack = async (fromIdx, toIdx, e) => {
    e?.stopPropagation?.();
    if (toIdx < 0 || toIdx >= tracks.length) return;
    const updated = [...tracks];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPlaylist((prev) => ({ ...prev, tracks: updated, songs: updated }));

    const songIds = updated.map((t) => t.id || t.track_id);
    try {
      if (reorderPlaylistSongs) {
        await reorderPlaylistSongs(playlistId, songIds);
      }
      showToast('Track reordered');
    } catch (err) {
      console.warn('Reorder error:', err);
    }
  };

  const handleDelete = async () => {
    if (!playlistId) return;
    try {
      await deletePlaylist(playlistId);
      showToast('Playlist deleted');
      onClose();
    } catch (err) {
      showToast('Failed to delete playlist');
    }
  };

  const handleDownloadTrack = async (track, e) => {
    e?.stopPropagation?.();
    const tid = track.id || track.track_id;
    if (!tid || downloadingMap[tid]) return;

    setDownloadingMap((prev) => ({ ...prev, [tid]: true }));
    showToast(`⬇ Downloading "${track.title}"...`);

    try {
      await downloadTrack(track);
      setDownloadedMap((prev) => ({ ...prev, [tid]: true }));
      showToast(`✓ Saved "${track.title}" for offline listening!`);
    } catch (err) {
      showToast(`❌ Download failed: ${err.message || 'Stream error'}`);
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [tid]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 animate-in fade-in slide-in-from-top-2">
            {toastMsg}
          </div>
        )}

        {/* Close Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-md transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Hero Banner */}
          <div
            className={`flex flex-col sm:flex-row items-center sm:items-end gap-5 p-4 sm:p-6 rounded-2xl border ${
              isCollab
                ? 'bg-gradient-to-b from-pink-950/40 via-purple-950/30 to-slate-900 border-pink-500/30'
                : 'bg-gradient-to-b from-emerald-950/40 via-slate-900/60 to-slate-900 border-emerald-500/20'
            }`}
          >
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex items-center justify-center border border-emerald-500/30 group">
              {/* Hero Image */}
              {playlist?.cover || (tracks.length > 0 && tracks[0].thumbnail) ? (
                <img
                  src={playlist?.cover || tracks[0].thumbnail}
                  alt={playlist?.name || playlist?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Music className="w-16 h-16 text-emerald-400" />
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-mono font-bold text-emerald-400 border border-white/10">
                {isCollab ? 'DUO PLAYLIST 💖' : 'PLAYLIST 🎵'}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isCollab ? 'text-pink-400' : 'text-emerald-400'
                  }`}
                >
                  {isCollab
                    ? 'Collaborative Duo Playlist'
                    : isUserCreated
                    ? 'Custom Collection'
                    : 'Curated Playlist'}
                </span>
                {isCollab && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-mono flex items-center gap-1">
                    <Users className="w-3 h-3" /> Joint with Partner
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1 truncate">
                {playlist?.name || playlist?.title || 'Playlist Details'}
              </h2>
              {playlist?.description && (
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{playlist.description}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono mt-2">
                <span>{tracks.length} Tracks</span>
                {isCollab && <span>• Both partners can add, remove & reorder</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                <button
                  onClick={() => handlePlayAll(false)}
                  disabled={tracks.length === 0}
                  className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => handlePlayAll(true)}
                  disabled={tracks.length === 0}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-emerald-400" />
                  <span>Shuffle</span>
                </button>
                <button
                  onClick={handleQueuePlaylist}
                  disabled={tracks.length === 0}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                >
                  <ListPlus className="w-4 h-4 text-cyan-400" />
                  <span>Add to Queue</span>
                </button>
                {(isUserCreated || isCollab) && (
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all active:scale-95"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tracklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              <span># &nbsp; Title</span>
              <span>
                Actions &nbsp; <Clock className="w-3.5 h-3.5 inline ml-1" />
              </span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 rounded-2xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-mono space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6">
                <Music className="w-8 h-8 text-slate-700 mx-auto" />
                <p>This playlist has no songs yet.</p>
                <p className="text-[11px] text-slate-600">
                  {isCollab
                    ? 'Both partners can add tracks anytime using the + icon on any song!'
                    : 'Search for songs on Home/Explore and tap the + icon to add them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {tracks.map((track, idx) => {
                  const tid = track.id || track.track_id;
                  const isCurrent = currentTrack?.id === tid;
                  const isThisPlaying = isCurrent && isPlaying;
                  const liked = isFavorite(tid);
                  const isDl = downloadedMap[tid];
                  const isDlLoading = downloadingMap[tid];
                  const formattedTrack = { ...track, id: tid };

                  return (
                    <div
                      key={tid || idx}
                      onClick={() => {
                        playTrack(formattedTrack, tracks.map((t) => ({ ...t, id: t.id || t.track_id })));
                        openNowPlaying();
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs font-mono font-bold text-slate-500 group-hover:text-emerald-400">
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 text-emerald-400 fill-current" />
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <img
                          src={track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop'}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />

                        <div className="min-w-0">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isCurrent ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                            <span>{track.artist}</span>
                            {track.added_by_username && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-pink-300 font-mono">
                                + @{track.added_by_username}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reorder Buttons (for user/collab playlists) */}
                        {(isUserCreated || isCollab) && tracks.length > 1 && (
                          <div className="flex items-center">
                            <button
                              onClick={(e) => handleMoveTrack(idx, idx - 1, e)}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleMoveTrack(idx, idx + 1, e)}
                              disabled={idx === tracks.length - 1}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Download button */}
                        <button
                          onClick={(e) => handleDownloadTrack(formattedTrack, e)}
                          disabled={isDlLoading}
                          className={`p-1.5 rounded-xl transition-all ${
                            isDl
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : isDlLoading
                              ? 'text-cyan-400 animate-pulse'
                              : 'text-slate-500 hover:text-white hover:bg-slate-800'
                          }`}
                          title={isDl ? 'Downloaded' : 'Download'}
                        >
                          {isDl ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        </button>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(formattedTrack);
                          }}
                          className={`p-1.5 rounded-xl transition-transform active:scale-90 ${
                            liked ? 'text-rose-500' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                        </button>

                        {/* Remove from playlist (User or Collab Playlists) */}
                        {(isUserCreated || isCollab) && (
                          <button
                            onClick={(e) => handleRemoveTrack(tid, e)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Remove from Playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
