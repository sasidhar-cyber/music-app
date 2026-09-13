import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import api from '../services/api';
import { User, X, Check, Edit3, Sparkles, Smile, Bell } from 'lucide-react';
import { playSound } from '../utils/soundEffects';

export function ProfileEditModal({ isOpen, onClose }) {
  const { user, setUser, notificationPreferences = {}, updateNotificationPreferences } = useAuth();
  const { partner } = useRoom();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [partnerNickname, setPartnerNickname] = useState(localStorage.getItem('duocore_partner_nickname') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      playSound('quiz_wrong');
      return;
    }

    setLoading(true);

    try {
      const res = await api.updateProfile({
        username: username.trim(),
        bio: bio.trim()
      });

      setUser(res.user);
      if (partnerNickname.trim()) {
        localStorage.setItem('duocore_partner_nickname', partnerNickname.trim());
      } else {
        localStorage.removeItem('duocore_partner_nickname');
      }

      setSuccess('🎉 Profile & Name updated successfully!');
      playSound('quiz_correct');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      playSound('quiz_wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-pink-500/40 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-150 bg-slate-950/95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-[1.5px] shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                ✏️
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Rename Profile & Nickname</h3>
              <p className="text-xs text-slate-400">Customize your name and your partner's display name</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Your Display Username:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sasi or CyberMaster"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Your Bio / Status:
            </label>
            <input
              type="text"
              placeholder="e.g. Learning Cybersecurity & Linux Together!"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Friend's Custom Nickname (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Bestie, Alex, Buddy"
              value={partnerNickname}
              onChange={(e) => setPartnerNickname(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Sets a custom local nickname for your study partner in chat & presence.
            </span>
          </div>

          {/* Dedicated Profile Notification Preferences Toggle */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-pink-400" />
                Notification Preferences:
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                notificationPreferences?.enabled !== false
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {notificationPreferences?.enabled !== false ? 'Sound On' : 'Muted'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">All Notification Sounds</div>
                  <div className="text-[10px] text-slate-400">Master switch for calls, chats & alerts</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateNotificationPreferences({ enabled: notificationPreferences?.enabled === false })}
                  className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    notificationPreferences?.enabled !== false ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      notificationPreferences?.enabled !== false ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-xs font-semibold text-white">Incoming Call Ringtone</div>
                  <div className="text-[10px] text-slate-400">Harmonic ringtone on audio & video calls</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateNotificationPreferences({ calls: notificationPreferences?.calls === false })}
                  className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      notificationPreferences?.calls !== false && notificationPreferences?.enabled !== false
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-xs font-semibold text-white">Message Chimes</div>
                  <div className="text-[10px] text-slate-400">Sound on incoming messages</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateNotificationPreferences({ messages: notificationPreferences?.messages === false })}
                  className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      notificationPreferences?.messages !== false && notificationPreferences?.enabled !== false
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}
