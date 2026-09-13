import React from 'react';
import { Play, Pause, MoreVertical, Heart } from 'lucide-react';

/**
 * SoundWave QuickPicks Component
 * 4 rows of SongListItem with smooth horizontal scrolling.
 * Features track artwork, title, artist, active waveform, play/pause, and more action button.
 */
export function SoundWaveQuickPicks({
  tracks = [],
  currentTrack = null,
  isPlaying = false,
  onPlayTrack,
  onOpenTrackMenu,
  className = ''
}) {
  if (!tracks || tracks.length === 0) return null;

  // Split items into chunks of 4 rows for clean horizontal columns
  const chunkSize = 4;
  const columns = [];
  for (let i = 0; i < tracks.length; i += chunkSize) {
    columns.push(tracks.slice(i, i + chunkSize));
  }

  return (
    <div className={`w-full overflow-x-auto no-scrollbar px-4 select-none ${className}`}>
      <div className="flex gap-4 min-w-max pb-2">
        {columns.map((column, colIdx) => (
          <div key={colIdx} className="w-72 sm:w-80 flex flex-col gap-2 shrink-0">
            {column.map((track) => {
              const isCurrent = currentTrack && (currentTrack.id === track.id || currentTrack.title === track.title);
              const isTrackPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, tracks)}
                  className={`group relative flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-850/90 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Thumbnail + Play overlay */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-sm">
                      <img
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop'}
                        alt={track.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />

                      {/* Equalizer or Play button overlay */}
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <div className="flex items-end gap-0.5 h-3 justify-center">
                            <div className="w-1 h-full bg-emerald-400 rounded-full animate-pulse" />
                            <div className="w-1 h-2/3 bg-emerald-400 rounded-full animate-pulse delay-75" />
                            <div className="w-1 h-4/5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-emerald-400 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'
                        }`}
                      >
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Menu) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onOpenTrackMenu && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTrackMenu(track);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
