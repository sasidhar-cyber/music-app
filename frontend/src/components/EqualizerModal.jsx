/**
 * SoundWave Music Experience
 * 10-Band Parametric Equalizer & Web Audio Engine
 */

import React, { useState } from 'react';
import { useMusic, EQ_BANDS } from '../context/MusicContext';
import {
  Sliders,
  X,
  Volume2,
  Headphones,
  Sparkles,
  RotateCcw,
  Zap,
  Check,
  Disc
} from 'lucide-react';

const EQ_FREQUENCIES = [
  { freq: '32Hz', key: 'f32', label: 'Sub-Bass' },
  { freq: '64Hz', key: 'f64', label: 'Bass' },
  { freq: '125Hz', key: 'f125', label: 'Upper Bass' },
  { freq: '250Hz', key: 'f250', label: 'Low-Mid' },
  { freq: '500Hz', key: 'f500', label: 'Mid' },
  { freq: '1kHz', key: 'f1k', label: 'Upper-Mid' },
  { freq: '2kHz', key: 'f2k', label: 'Presence' },
  { freq: '4kHz', key: 'f4k', label: 'Clarity' },
  { freq: '8kHz', key: 'f8k', label: 'Treble' },
  { freq: '16kHz', key: 'f16k', label: 'Brilliance' }
];

const AUTOEQ_PROFILES = [
  { id: 'custom', name: 'Custom Profile', description: 'Manual user adjustment' },
  { id: 'airpods_pro', name: 'Apple AirPods Pro 2', description: 'Harman target curve compensation' },
  { id: 'sony_wh1000xm5', name: 'Sony WH-1000XM5', description: 'Bass tamer & vocal clarity lift' },
  { id: 'sennheiser_hd650', name: 'Sennheiser HD 650', description: 'Sub-bass extension & neutral highs' },
  { id: 'galaxy_buds', name: 'Samsung Galaxy Buds 2 Pro', description: 'Harman in-ear target profile' },
  { id: 'bose_qc45', name: 'Bose QuietComfort 45', description: 'Warm balance & reduced treble peak' }
];

export function EqualizerModal({ isOpen, onClose }) {
  const {
    activeEqPreset,
    applyEqPreset,
    customEqValues,
    setCustomEqBand,
    playbackSpeed,
    setSpeed,
    volumeNormalization,
    setVolumeNormalization
  } = useMusic();

  const [selectedAutoEq, setSelectedAutoEq] = useState('custom');
  const [bassBoost, setBassBoost] = useState(0);
  const [virtualizer, setVirtualizer] = useState(0);

  if (!isOpen) return null;

  const handleBandChange = (key, val) => {
    setCustomEqBand(key, Number(val));
  };

  const handleReset = () => {
    applyEqPreset('Flat');
    setBassBoost(0);
    setVirtualizer(0);
    setSelectedAutoEq('custom');
  };

  return (
    <div
      id="soundwave-equalizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border border-white/10 shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">SoundWave Audio Equalizer</h2>
              <p className="text-xs text-slate-400">10-Band Parametric Web Audio EQ & Presets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Reset EQ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Genre Presets */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            EQ Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {['Flat', 'Bass Boost', 'Treble Boost', 'Vocal Boost', 'Balanced', 'Rock', 'Pop', 'Electronic', 'Jazz'].map((preset) => (
              <button
                key={preset}
                onClick={() => applyEqPreset(preset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeEqPreset === preset
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-semibold scale-105'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Band Graphic EQ Visualizer Sliders */}
        <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              10-Band Precision Controls (+12dB / -12dB)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              Profile: {activeEqPreset}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-end pt-4 pb-2">
            {EQ_FREQUENCIES.map(({ freq, key, label }) => {
              const val = customEqValues[key] !== undefined ? customEqValues[key] : 0;
              return (
                <div key={key} className="flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-emerald-400">
                    {val > 0 ? `+${val}` : val}
                  </span>
                  <div className="h-32 flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={val}
                      onChange={(e) => handleBandChange(key, e.target.value)}
                      className="h-28 w-1.5 appearance-none bg-slate-800 rounded-full cursor-pointer accent-emerald-400 [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-slate-200 block">{freq}</span>
                    <span className="text-[9px] text-slate-500 block truncate max-w-[48px]">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sound Effects & Audio Enhancements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Bass Boost & 3D Spatial */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-emerald-400" />
                Bass Boost
              </span>
              <span className="text-xs font-mono text-emerald-400">{bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bassBoost}
              onChange={(e) => {
                setBassBoost(Number(e.target.value));
                setCustomEqBand('bass', Number(e.target.value) / 10);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Virtualizer (3D Surround)
              </span>
              <span className="text-xs font-mono text-cyan-400">{virtualizer}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={virtualizer}
              onChange={(e) => setVirtualizer(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* AutoEQ Headphone Profile */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-purple-400" />
              AutoEQ Headphone Target
            </span>
            <select
              value={selectedAutoEq}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedAutoEq(id);
                if (id === 'airpods_pro') applyEqPreset('Balanced');
                else if (id === 'sony_wh1000xm5') applyEqPreset('Vocal');
                else if (id === 'sennheiser_hd650') applyEqPreset('Flat');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {AUTOEQ_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {AUTOEQ_PROFILES.find((p) => p.id === selectedAutoEq)?.description}
            </p>

            {/* Volume Normalization Switch */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-xs text-slate-300">Volume Normalization (ReplayGain)</span>
              <button
                type="button"
                onClick={() => setVolumeNormalization(!volumeNormalization)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  volumeNormalization ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    volumeNormalization ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
