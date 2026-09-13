import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Video, Mic, Volume2, VolumeX } from 'lucide-react';
import { startRingtone, stopRingtone, isNotificationSoundEnabled, setNotificationPreferences } from '../utils/soundEffects';

export function IncomingCallModal({ incomingCall, onAccept, onDecline }) {
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [isRingingMuted, setIsRingingMuted] = useState(!isNotificationSoundEnabled());
  const onDeclineRef = useRef(onDecline);
  const onAcceptRef = useRef(onAccept);
  onDeclineRef.current = onDecline;
  onAcceptRef.current = onAccept;

  const callId = incomingCall?.roomId || incomingCall?.caller?.id || 'incoming';

  useEffect(() => {
    if (!incomingCall) return;

    if (!isRingingMuted) {
      startRingtone();
    }

    // Auto-decline call after 25 seconds if unattended to prevent infinite ringing
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopRingtone();
          if (onDeclineRef.current) onDeclineRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopRingtone();
    };
  }, [callId, isRingingMuted]);

  const handleToggleMuteRinging = () => {
    if (isRingingMuted) {
      setIsRingingMuted(false);
      startRingtone();
    } else {
      setIsRingingMuted(true);
      stopRingtone();
    }
  };

  if (!incomingCall) return null;

  const { caller, callType } = incomingCall;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm glass-panel p-6 sm:p-8 rounded-3xl border border-pink-500/50 shadow-2xl text-center space-y-6 bg-slate-950/95 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />

        {/* Quick Silence / Mute Ringtone Button */}
        <button
          onClick={handleToggleMuteRinging}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isRingingMuted ? 'Unmute Ringing' : 'Silence Ringing'}
        >
          {isRingingMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <div className="relative space-y-3">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
            <img
              src={caller.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=caller'}
              alt={caller.username}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-500/60 shadow-2xl relative z-10"
            />
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{caller.username}</h3>
            <p className="text-xs text-pink-300 font-bold flex items-center justify-center gap-1.5 mt-1">
              {callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>Incoming {callType === 'video' ? 'HD Video Call' : 'Audio Call'}... ({secondsLeft}s)</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Accept & Decline */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                stopRingtone();
                onDecline();
              }}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95 hover:scale-110"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[11px] font-bold text-slate-400">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                stopRingtone();
                onAccept();
              }}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 hover:scale-110 animate-bounce"
              title="Accept Call"
            >
              <Phone className="w-6 h-6 fill-current" />
            </button>
            <span className="text-[11px] font-bold text-emerald-400">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
