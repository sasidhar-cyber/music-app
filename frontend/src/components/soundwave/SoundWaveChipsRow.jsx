import React from 'react';

/**
 * SoundWave ChipsRow
 * Implements smooth horizontal scrolling filter chips
 */
export function SoundWaveChipsRow({
  chips = [],
  selectedChip,
  onSelectChip,
  className = ''
}) {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-2 select-none ${className}`}>
      {chips.map((chip) => {
        const isSelected = selectedChip === chip.id;
        return (
          <button
            key={chip.id}
            onClick={() => onSelectChip(chip.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all shrink-0 ${
              isSelected
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
