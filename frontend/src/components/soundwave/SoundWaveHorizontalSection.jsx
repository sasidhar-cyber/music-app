import React from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * SoundWave Horizontal Section
 * Handles horizontal carousel for Albums, Artists, Playlists, and Songs.
 */
export function SoundWaveHorizontalSection({
  items = [],
  type = 'album', // 'album' | 'artist' | 'playlist' | 'song'
  currentTrack = null,
  isPlaying = false,
  onItemClick,
  className = ''
}) {
  if (!items || items.length === 0) return null;

  const isArtist = type === 'artist';

  return (
    <div className={`w-full overflow-x-auto no-scrollbar px-4 select-none ${className}`}>
      <div className="flex gap-4 min-w-max pb-3">
        {items.map((item) => {
          const isItemActive = currentTrack && (currentTrack.id === item.id || currentTrack.title === item.title);
          const isItemPlaying = isItemActive && isPlaying;

          return (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className="w-36 sm:w-44 flex flex-col gap-2 shrink-0 group cursor-pointer"
            >
              {/* Image Container */}
              <div
                className={`relative aspect-square overflow-hidden bg-slate-900 border transition-all duration-300 group-hover:scale-[1.03] shadow-md group-hover:shadow-xl ${
                  isArtist
                    ? 'rounded-full border-slate-800 group-hover:border-emerald-500/50'
                    : 'rounded-2xl border-slate-800/80 group-hover:border-emerald-500/40'
                } ${isItemActive ? 'border-emerald-500 ring-2 ring-emerald-500/30' : ''}`}
              >
                <img
                  src={item.image || item.cover || item.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
                  alt={item.title || item.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    {isItemPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Badge if available */}
                {item.badge && !isArtist && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/10">
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className={`${isArtist ? 'text-center' : 'text-left'} px-1 min-w-0`}>
                <h4
                  className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    isItemActive ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'
                  }`}
                >
                  {item.title || item.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                  {item.artist || item.subtitle || item.role || (item.tracksCount ? `${item.tracksCount} songs` : item.year || (isArtist ? 'Artist' : ''))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
