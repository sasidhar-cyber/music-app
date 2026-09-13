import React from 'react';

/**
 * SoundWave MoodAndGenres Section
 * Colorful tiles for exploration.
 */
export function SoundWaveMoodAndGenres({
  categories = [],
  onSelectCategory,
  className = ''
}) {
  return (
    <div className={`px-4 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className={`group relative h-24 sm:h-28 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between cursor-pointer select-none bg-gradient-to-br ${
              cat.gradient || 'from-emerald-700 to-slate-900'
            } border ${cat.borderColor || 'border-white/10'} hover:scale-[1.02] shadow-md hover:shadow-xl transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl drop-shadow">{cat.icon || '🎵'}</span>
              {cat.tag && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10">
                  {cat.tag}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-200 transition-colors drop-shadow">
                {cat.title}
              </h4>
              <p className="text-[10px] text-white/80 truncate font-medium drop-shadow">
                {cat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
