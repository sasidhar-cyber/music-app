/**
 * SoundWave Music Experience
 * Collaborative Duo Queue & Queue Voting
 */

import React, { useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  ListMusic,
  Trash2,
  Play,
  Pause,
  X,
  Sparkles,
  Radio,
  Plus,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  Flame,
  Users,
  Shuffle,
  Vote,
  Music2
} from 'lucide-react';

export function QueueDrawer() {
  const {
    isQueueOpen,
    closeQueue,
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    autoRadio = true,
    toggleAutoRadio,
    openPlaylistModal,
    voteTrack,
    queueVotes,
    queueSortMode,
    toggleQueueSortMode,
    duoQueueToast,
    loadRoomQueue
  } = useMusic();

  const roomId = localStorage.getItem('duocore_room_id');

  // Load room queue on open
  useEffect(() => {
    if (isQueueOpen && roomId) {
      loadRoomQueue(roomId);
    }
  }, [isQueueOpen, roomId, loadRoomQueue]);

  if (!isQueueOpen) return null;

  const moveTrack = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    reorderQueue(fromIdx, toIdx);
  };

  const upcomingCount = Math.max(0, queue.length - 1);

  return (
    <div
      id="soundwave-queue-drawer-backdrop"
      className="fixed inset-0 z-[60] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in select-none"
      onClick={closeQueue}
    >
      <div
        id="soundwave-queue-drawer"
        className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border-l border-white/10 h-full flex flex-col p-4 sm:p-6 shadow-2xl animate-in slide-in-from-right duration-300 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-pink-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white leading-tight">Listening Queue</h3>
                {roomId && (
                  <span className="px-1.5 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/40 text-[10px] font-mono text-pink-300 font-bold flex items-center gap-1">
                    <Users className="w-2.5 h-2.5 text-pink-400" /> Duo Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {queue.length} Tracks • {roomId ? 'Joint Room Sync' : 'Local Queue'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto Radio Switch */}
            <button
              onClick={toggleAutoRadio}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                autoRadio
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Auto-Radio: Automatically append similar songs when queue finishes"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Auto Radio</span>
            </button>

            {/* Clear Queue */}
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={closeQueue}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Duo Toast Alert inside drawer */}
        {duoQueueToast && (
          <div className="my-2 p-2.5 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/40 flex items-center gap-2 text-xs text-pink-200 animate-in fade-in slide-in-from-top-1">
            <Flame className="w-4 h-4 text-pink-400 animate-bounce shrink-0" />
            <span className="font-medium truncate">{duoQueueToast.text}</span>
          </div>
        )}

        {/* Currently Playing Section */}
        {currentTrack && (
          <div className="py-4 border-b border-white/10 shrink-0 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NOW PLAYING
            </span>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40">
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

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md shadow-emerald-500/30"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Up Next Header with Voting Controls */}
        <div className="pt-3 pb-2 flex items-center justify-between px-1 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              UP NEXT ({upcomingCount})
            </span>

            {/* Voting Sort Mode Toggle */}
            {upcomingCount > 1 && (
              <button
                onClick={toggleQueueSortMode}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                  queueSortMode === 'votes'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Toggle queue sorting: By Upvotes or Manual Order"
              >
                <Flame className={`w-3 h-3 ${queueSortMode === 'votes' ? 'text-pink-400 fill-pink-400' : ''}`} />
                <span>{queueSortMode === 'votes' ? 'Top Voted Plays Next' : 'Manual Order'}</span>
              </button>
            )}
          </div>

          {queue.length > 1 && (
            <button
              onClick={() => openPlaylistModal(currentTrack)}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Save Queue
            </button>
          )}
        </div>

        {/* Up Next List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {queue.length <= 1 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Music2 className="w-8 h-8 mx-auto text-slate-700 opacity-60" />
              <p className="text-xs font-medium">No upcoming tracks in queue.</p>
              {autoRadio && (
                <p className="text-[11px] text-emerald-400 font-mono">
                  ✨ Auto Radio will automatically load similar tracks!
                </p>
              )}
            </div>
          ) : (
            queue.map((track, idx) => {
              if (track.id === currentTrack?.id && idx === currentIndex) return null;

              const tid = String(track.id || track.trackId);
              const voteInfo = queueVotes[tid] || {};
              const upvoteCount = voteInfo.upvotes !== undefined ? voteInfo.upvotes : (track.upvotes || 0);
              const hasVoted = voteInfo.hasVoted !== undefined ? voteInfo.hasVoted : (track.hasVoted || false);

              return (
                <div
                  key={`${tid}-${idx}`}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group ${
                    hasVoted
                      ? 'bg-gradient-to-r from-pink-950/20 to-slate-900/80 border-pink-500/30'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
                  }`}
                >
                  {/* Song Info */}
                  <div
                    onClick={() => playTrack(track, queue)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                        {track.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <span>{track.artist}</span>
                        {track.added_by_username && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-pink-300 font-mono">
                            @{track.added_by_username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Upvote Button, Reorder, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Upvote Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voteTrack(tid);
                      }}
                      className={`px-2 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-95 ${
                        hasVoted
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30 ring-1 ring-pink-400'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-pink-300 border border-white/10'
                      }`}
                      title={hasVoted ? 'Remove upvote' : 'Upvote this song to play next (+1)'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                      <span>{upvoteCount > 0 ? upvoteCount : 'Vote'}</span>
                    </button>

                    {/* Reorder Buttons */}
                    <button
                      onClick={() => moveTrack(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveTrack(idx, idx + 1)}
                      disabled={idx === queue.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from Queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
