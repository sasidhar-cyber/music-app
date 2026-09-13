import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  FolderPlus,
  Plus,
  Check,
  X,
  Music,
  ListPlus,
  Sparkles,
  Users,
  Heart
} from 'lucide-react';
import { playSound } from '../utils/soundEffects';

export function PlaylistModal() {
  const {
    isPlaylistModalOpen,
    closePlaylistModal,
    playlistTrackToAdd,
    playlists,
    createPlaylist,
    addSongToPlaylist
  } = useMusic();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  const roomId = localStorage.getItem('duocore_room_id');

  if (!isPlaylistModalOpen || !playlistTrackToAdd) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      const pl = await createPlaylist(
        newPlaylistName.trim(),
        isCollaborative ? 'Joint collaborative playlist created for DuoCore' : '',
        Boolean(isCollaborative && roomId),
        roomId
      );
      if (pl?.id) {
        await addSongToPlaylist(pl.id, playlistTrackToAdd);
        setAddedMap((prev) => ({ ...prev, [pl.id]: true }));
      }
      setNewPlaylistName('');
      playSound('quiz_correct');
    } catch (err) {
      alert('Could not create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleAddToExisting = async (plId) => {
    try {
      await addSongToPlaylist(plId, playlistTrackToAdd);
      setAddedMap((prev) => ({ ...prev, [plId]: true }));
      playSound('quiz_correct');
      setTimeout(() => closePlaylistModal(), 1200);
    } catch (err) {
      alert('Could not add song to playlist');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in select-none p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-emerald-500/30 shadow-2xl bg-slate-950/95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">Add to Playlist</h3>
          </div>
          <button
            onClick={closePlaylistModal}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Track Preview */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <img
            src={playlistTrackToAdd.thumbnail}
            alt={playlistTrackToAdd.title}
            className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{playlistTrackToAdd.title}</h4>
            <p className="text-[10px] text-slate-400 truncate">{playlistTrackToAdd.artist}</p>
          </div>
        </div>

        {/* Existing Playlists List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block px-1">
            SELECT PLAYLIST
          </span>

          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No custom playlists created yet.</p>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedMap[pl.id];
              const isCollab = Boolean(pl.is_collaborative);

              return (
                <div
                  key={pl.id}
                  onClick={() => handleAddToExisting(pl.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isAdded
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold truncate">{pl.name}</h5>
                      {isCollab && (
                        <span className="px-1.5 py-0.2 text-[9px] rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/40 font-mono font-bold flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" /> Duo Joint
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {pl.track_count || 0} tracks {isCollab ? '• Both can edit' : ''}
                    </p>
                  </div>

                  {isAdded ? (
                    <span className="p-1.5 rounded-full bg-emerald-500 text-slate-950">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1.5 rounded-full bg-slate-800 text-slate-400 group-hover:text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Form */}
        <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block px-1">
            OR CREATE NEW PLAYLIST
          </span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Our Summer Anthems"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={creating || !newPlaylistName.trim()}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-transform active:scale-95 disabled:opacity-40 shrink-0"
            >
              {creating ? '...' : '+ Create'}
            </button>
          </div>

          {/* Collaborative Duo Option */}
          {roomId && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-pink-950/20 border border-pink-500/20 p-2.5 rounded-xl">
              <input
                type="checkbox"
                checked={isCollaborative}
                onChange={(e) => setIsCollaborative(e.target.checked)}
                className="rounded accent-pink-500 w-4 h-4 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-semibold text-pink-200">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Collaborative Duo Playlist</span>
                </div>
                <p className="text-[10px] text-slate-400">Both partners can add, remove, and reorder tracks</p>
              </div>
            </label>
          )}
        </form>
      </div>
    </div>
  );
}
