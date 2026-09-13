/**
 * SoundWave Music Experience
 * Settings & Configuration Modal
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import api from '../services/api';
import { Avatar } from './Avatar';
import {
  X,
  User,
  Lock,
  Key,
  Shield,
  Palette,
  Phone,
  Bell,
  Check,
  Smartphone,
  Sparkles,
  Music,
  Sliders,
  Radio,
  Eye,
  VolumeX,
  Volume2,
  AlertCircle,
  Info,
  Database,
  LockKeyhole,
  Download,
  Trash2,
  Upload,
  HardDrive,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { playSound } from '../utils/soundEffects';
import { requestNotificationPermission } from '../utils/notificationService';
import { getDownloadedTracks, clearDownloadedTracks } from '../utils/downloadManager';

const MUSIC_THEMES = [
  { id: 'spotify', name: 'SoundWave Emerald', color: 'from-emerald-500 to-green-600', border: 'border-emerald-500' },
  { id: 'cyber_cyan', name: 'Cyber Cyan', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-500' },
  { id: 'purple_twilight', name: 'Royal Violet', color: 'from-purple-500 to-indigo-600', border: 'border-purple-500' },
  { id: 'neon_pink', name: 'Crimson Rose', color: 'from-rose-500 to-pink-600', border: 'border-rose-500' },
  { id: 'sunset_amber', name: 'Sunset Amber', color: 'from-amber-500 to-orange-600', border: 'border-amber-500' },
  { id: 'amoled', name: 'Pure AMOLED Dark', color: 'from-slate-800 to-black', border: 'border-slate-400' }
];

export function SettingsModal({ isOpen, onClose, initialTab = 'appearance', deferredPrompt }) {
  const { user, updateUser, notificationPreferences = {}, updateNotificationPreferences } = useAuth();
  const {
    appTitle,
    changeAppTitle,
    activeTheme,
    changeTheme,
    volumeNormalization,
    toggleVolumeNormalization,
    playbackSpeed,
    setSpeed,
    activeEqPreset,
    applyEqPreset,
    sliderStyle = 'wavy',
    setSliderStyle,
    autoRadio = true,
    toggleAutoRadio,
    audioQuality = '320',
    setAudioQuality,
    crossfadeSec = 0,
    setCrossfadeSec,
    skipSilence = false,
    setSkipSilence,
    playlists = [],
    favorites = []
  } = useMusic();

  const [activeTab, setActiveTab] = useState(initialTab || 'appearance');
  const [downloadedList, setDownloadedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Account form state
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Vault PIN state
  const [vaultPin, setVaultPin] = useState(localStorage.getItem('duocore_vault_pin') || '1234');
  const [newVaultPin, setNewVaultPin] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      try {
        setDownloadedList(getDownloadedTracks() || []);
      } catch {
        setDownloadedList([]);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all offline downloaded tracks?')) {
      clearDownloadedTracks();
      setDownloadedList([]);
      setMessage('Downloaded tracks cache cleared successfully.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'SoundWave',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      favorites,
      playlists,
      settings: {
        theme: activeTheme,
        sliderStyle,
        volumeNormalization,
        autoRadio,
        audioQuality
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soundwave-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup JSON downloaded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.favorites) {
          localStorage.setItem('soundwave_favorites', JSON.stringify(data.favorites));
        }
        if (data.settings?.sliderStyle && setSliderStyle) {
          setSliderStyle(data.settings.sliderStyle);
        }
        setMessage('Backup data imported! Refresh to view all restored playlists.');
        setTimeout(() => setMessage(''), 4000);
      } catch (err) {
        setError('Invalid backup JSON file');
        setTimeout(() => setError(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.updateProfile({
        username,
        bio,
        phone_number: phoneNumber,
        avatar_url: avatarUrl
      });
      updateUser(res.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="soundwave-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border border-white/10 shadow-2xl flex flex-col text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">SoundWave Settings</h2>
              <p className="text-xs text-slate-400">Customization, Playback & Audio Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0 bg-white/[0.02]">
          {[
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'account', label: 'Account & Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'audio', label: 'Playback & Audio', icon: Music },
            { id: 'cache', label: 'Storage & Cache', icon: HardDrive },
            { id: 'backup', label: 'Backup & Restore', icon: Database },
            { id: 'vault', label: 'Secret Vault', icon: LockKeyhole },
            { id: 'about', label: 'About (GPL-3.0)', icon: Info }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Notifications & Feedback Messages */}
        {message && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Color Themes */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Color Themes & Dynamic Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MUSIC_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeTheme === theme.id
                          ? `${theme.border} bg-white/10 ring-2 ring-emerald-400/40`
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${theme.color} mb-2`} />
                      <span className="text-xs font-bold text-white block">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SoundWave Slider Style */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Player Scrubber Animation Style
                </label>
                <p className="text-[11px] text-slate-400">
                  Select your preferred dynamic progress bar waveform physics.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wavy', label: '🌊 Wavy Waves' },
                    { id: 'squiggly', label: '⚡ Squiggly Sine' },
                    { id: 'linear', label: '📏 Smooth Linear' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSliderStyle && setSliderStyle(style.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        sliderStyle === style.id
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAYBACK & AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Audio Streaming Quality */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Streaming Audio Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '320', label: 'Lossless 320k', sub: 'Audiophile HQ' },
                    { id: '160', label: 'High 160k', sub: 'Balanced' },
                    { id: '96', label: 'Saver 96k', sub: 'Low Data' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setAudioQuality && setAudioQuality(q.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        audioQuality === q.id
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-xs font-bold">{q.label}</p>
                      <p className="text-[10px] text-slate-400">{q.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Normalization (ReplayGain) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Volume Normalization (ReplayGain)</h4>
                  <p className="text-[11px] text-slate-400">Equalize track volume to prevent loud jumps</p>
                </div>
                <button
                  type="button"
                  onClick={toggleVolumeNormalization}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    volumeNormalization ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      volumeNormalization ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Radio Infinite Playback */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto-Radio (Infinite Queue)</h4>
                  <p className="text-[11px] text-slate-400">Keep playing similar tracks when queue finishes</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoRadio}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    autoRadio ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoRadio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Crossfade */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">Crossfade Duration</h4>
                  <span className="text-xs font-mono text-emerald-400">{crossfadeSec}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={crossfadeSec}
                  onChange={(e) => setCrossfadeSec && setCrossfadeSec(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & CACHE */}
          {activeTab === 'cache' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    Offline Downloaded Tracks
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {downloadedList.length} Tracks
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tracks saved directly to your browser's persistent IndexedDB cache for offline listening without internet connection.
                </p>

                {downloadedList.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {downloadedList.map((track) => (
                      <div
                        key={track.id}
                        className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{track.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono shrink-0">Offline Ready</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No downloaded offline tracks yet.</p>
                )}

                <button
                  onClick={handleClearCache}
                  disabled={downloadedList.length === 0}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Offline Cache
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Export & Import SoundWave JSON Backup
                </span>
                <p className="text-[11px] text-slate-400">
                  Safely export your custom playlists, favorites, listening history, and sound configuration into a portable JSON backup file.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="py-3 px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export Backup JSON
                  </button>

                  <label className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                    <Upload className="w-4 h-4" />
                    Import Backup JSON
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <form onSubmit={handleAccountUpdate} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Profile Details
                </h4>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                >
                  Save Profile
                </button>
              </form>

              {/* Dedicated Notification Preferences Toggle in User Profile */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      Notification Preferences
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Toggle sounds, incoming calls ringtone, and message chimes for your account
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      notificationPreferences?.enabled !== false
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {notificationPreferences?.enabled !== false ? 'Active' : 'Muted'}
                  </span>
                </div>

                <div className="space-y-2.5 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                  {/* Master Alert Toggle */}
                  <div className="flex items-center justify-between py-1">
                    <div className="pr-4">
                      <div className="text-xs font-semibold text-white">All Notification Sounds</div>
                      <div className="text-[10px] text-slate-400">Master switch to silence or enable all audible alerts</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ enabled: notificationPreferences?.enabled === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.enabled !== false ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.enabled !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Incoming Calls Ringtone */}
                  <div className="flex items-center justify-between py-1 border-t border-white/5">
                    <div className="pr-4">
                      <div className="text-xs font-semibold text-white">Incoming Call Ringtone</div>
                      <div className="text-[10px] text-slate-400">Harmonic ringtone for incoming video & audio calls</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ calls: notificationPreferences?.calls === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Duo Message Chimes */}
                  <div className="flex items-center justify-between py-1 border-t border-white/5">
                    <div className="pr-4">
                      <div className="text-xs font-semibold text-white">Direct Message Chimes</div>
                      <div className="text-[10px] text-slate-400">Chime alert when your study partner sends a message</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ messages: notificationPreferences?.messages === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sound Effects & UI Audio */}
                  <div className="flex items-center justify-between py-1 border-t border-white/5">
                    <div className="pr-4">
                      <div className="text-xs font-semibold text-white">UI Sound Effects & Feedback</div>
                      <div className="text-[10px] text-slate-400">Audio feedback for quiz answers and button interactions</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ sound: notificationPreferences?.sound === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.sound !== false ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.sound !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Change Password
                </h4>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* DEDICATED NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Audio & Alert Center</h3>
                    <p className="text-[11px] text-slate-400">
                      Customize how DuoCore notifies you of messages, calls, and study sessions
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateNotificationPreferences({ enabled: notificationPreferences?.enabled === false })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    notificationPreferences?.enabled !== false
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                  }`}
                >
                  {notificationPreferences?.enabled !== false ? 'Notifications Active' : 'Sound Muted'}
                </button>
              </div>

              {/* Push Permission Card */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Browser Push Notifications</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Receive background alerts when this tab is minimized or inactive
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestNotificationPermission();
                    if (granted) {
                      setMessage('Desktop notifications successfully enabled!');
                      setTimeout(() => setMessage(''), 3000);
                    } else {
                      setError('Notification permission was blocked or denied in browser settings.');
                      setTimeout(() => setError(''), 4000);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                >
                  Request Permission
                </button>
              </div>

              {/* Granular Toggles */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Audio Tone Preferences
                </h4>

                {/* Incoming Call Ringtone */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Incoming Calls Ringtone
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Plays a 440/480Hz harmonic tone sequence during incoming voice and video calls
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('message')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
                    >
                      Test Chime
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ calls: notificationPreferences?.calls === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Direct Message Chime */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      Direct Message Sounds
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Debounced soft chime when receiving messages in Duo Chat
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('message')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ messages: notificationPreferences?.messages === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Partner Presence */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      Partner Presence & Room Alerts
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Subtle audio notification when study partner joins the room or initiates a session
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ partner: notificationPreferences?.partner === false })}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                      notificationPreferences?.partner !== false && notificationPreferences?.enabled !== false
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationPreferences?.partner !== false && notificationPreferences?.enabled !== false
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* UI Sound Effects */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      UI Sound Effects & Audio Clicks
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Haptic-like audio feedback for quiz answers and controls
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('quiz_correct')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ sound: notificationPreferences?.sound === false })}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        notificationPreferences?.sound !== false ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences?.sound !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VAULT */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <LockKeyhole className="w-4 h-4 text-emerald-400" />
                  Stealth Steganography Vault PIN
                </h4>
                <p className="text-[11px] text-slate-400">
                  Hidden PIN code triggered by double-tapping the soundwave logo to access encrypted private channels.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter new 4-6 digit PIN"
                    value={newVaultPin}
                    onChange={(e) => setNewVaultPin(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (newVaultPin.length >= 4) {
                        localStorage.setItem('duocore_vault_pin', newVaultPin);
                        setVaultPin(newVaultPin);
                        setNewVaultPin('');
                        setMessage('Vault PIN updated successfully!');
                        setTimeout(() => setMessage(''), 3000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
                  >
                    Save PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ABOUT & GPL-3.0 LICENSE */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">SoundWave Music Engine</h3>
                    <p className="text-xs text-slate-400">Version 2.0.0 (GPL-3.0 Licensed)</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                  SoundWave Music Engine is a high-performance open-source streaming platform licensed under the <strong className="text-white">GNU General Public License v3.0</strong>.
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
                  <p>Copyright (C) 2026 SoundWave Contributors.</p>
                  <p>Audio Engine: High-fidelity streaming, LRCLIB Synced Lyrics, Web Audio 10-Band Parametric EQ & AutoEQ Profiles.</p>
                  <p>Free Software Foundation (FSF) GNU GPL-3.0 Notice Preserved.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
