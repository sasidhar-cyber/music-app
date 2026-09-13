import React from 'react';
import { ChevronRight, Play } from 'lucide-react';

/**
 * SoundWave NavigationTitle Component
 * Supports label, title, clickable row with chevron, and optional Play All button.
 */
export function SoundWaveNavigationTitle({
  title,
  label = null,
  thumbnail = null,
  onClick = null,
  onPlayAllClick = null,
  className = ''
}) {
  return (
    <div
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      onClick={onClick || undefined}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {thumbnail && <div className="shrink-0">{thumbnail}</div>}
        <div className="min-w-0">
          {label && (
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block truncate">
              {label}
            </span>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onPlayAllClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAllClick();
            }}
            className="px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play all</span>
          </button>
        )}

        {onClick && (
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  );
}
