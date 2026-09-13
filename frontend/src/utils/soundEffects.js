let audioCtx = null;
let lastSoundTime = {};
let ringtoneInterval = null;
let ringtoneTimeout = null;
let activeRingtoneNodes = [];
let isRingtoneActive = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Master notification toggle
export function isNotificationSoundEnabled() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('duocore_notifications_enabled') !== 'false';
}

export function isMessageNotificationEnabled() {
  if (!isNotificationSoundEnabled()) return false;
  return localStorage.getItem('duocore_notif_messages') !== 'false';
}

export function isCallNotificationEnabled() {
  if (!isNotificationSoundEnabled()) return false;
  return localStorage.getItem('duocore_notif_calls') !== 'false';
}

export function isSoundEffectsEnabled() {
  return localStorage.getItem('duocore_sound_enabled') !== 'false';
}

export function getNotificationPreferences() {
  if (typeof window === 'undefined') {
    return { enabled: true, messages: true, calls: true, sound: true, partner: true };
  }
  return {
    enabled: localStorage.getItem('duocore_notifications_enabled') !== 'false',
    messages: localStorage.getItem('duocore_notif_messages') !== 'false',
    calls: localStorage.getItem('duocore_notif_calls') !== 'false',
    sound: localStorage.getItem('duocore_sound_enabled') !== 'false',
    partner: localStorage.getItem('duocore_notif_invites') !== 'false'
  };
}

export function setNotificationPreferences(prefs = {}) {
  if (typeof window === 'undefined') return;

  if (typeof prefs.enabled === 'boolean') {
    localStorage.setItem('duocore_notifications_enabled', prefs.enabled ? 'true' : 'false');
    if (!prefs.enabled) {
      stopRingtone();
    }
  }
  if (typeof prefs.messages === 'boolean') {
    localStorage.setItem('duocore_notif_messages', prefs.messages ? 'true' : 'false');
  }
  if (typeof prefs.calls === 'boolean') {
    localStorage.setItem('duocore_notif_calls', prefs.calls ? 'true' : 'false');
    if (!prefs.calls) {
      stopRingtone();
    }
  }
  if (typeof prefs.sound === 'boolean') {
    localStorage.setItem('duocore_sound_enabled', prefs.sound ? 'true' : 'false');
  }
  if (typeof prefs.partner === 'boolean') {
    localStorage.setItem('duocore_notif_invites', prefs.partner ? 'true' : 'false');
  }

  window.dispatchEvent(new CustomEvent('duocore:notif_toggle', { detail: getNotificationPreferences() }));
}

export function setNotificationSoundEnabled(enabled) {
  setNotificationPreferences({ enabled });
}

export function toggleNotificationSound() {
  const current = isNotificationSoundEnabled();
  const next = !current;
  setNotificationPreferences({ enabled: next });
  return next;
}

export function playSound(type = 'click') {
  try {
    // 1. Master notification toggle check
    const masterEnabled = isNotificationSoundEnabled();
    if (!masterEnabled) return;

    if (type === 'message') {
      if (!isMessageNotificationEnabled()) return;

      // Debounce message notification sound: prevent non-stop spam (minimum 1.2s interval)
      const nowMs = Date.now();
      if (lastSoundTime['message'] && nowMs - lastSoundTime['message'] < 1200) {
        return;
      }
      lastSoundTime['message'] = nowMs;
    } else if (type === 'call') {
      if (!isCallNotificationEnabled()) return;
    } else if (type === 'quiz_correct' || type === 'quiz_wrong' || type === 'click' || type === 'send') {
      if (!isSoundEffectsEnabled()) return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'quiz_correct':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        osc.frequency.setValueAtTime(1046.50, now + 0.24);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'quiz_wrong':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'message':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'send':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      default:
        break;
    }
  } catch (err) {}
}

export function startRingtone() {
  // If already ringing, don't restart or create duplicate interval
  if (isRingtoneActive) return stopRingtone;

  // Respect Master & Calls notification settings
  if (!isNotificationSoundEnabled() || !isCallNotificationEnabled()) {
    return () => {};
  }

  const ctx = getAudioContext();
  if (!ctx) return () => {};

  isRingtoneActive = true;

  const playBurst = () => {
    if (!isRingtoneActive || !isNotificationSoundEnabled() || !isCallNotificationEnabled()) {
      stopRingtone();
      return;
    }

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // Classic harmonic dual-tone ring cadence (440Hz + 480Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const burstGain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      burstGain.gain.setValueAtTime(0, now);
      // Ring burst 1 (0 to 0.8s)
      burstGain.gain.linearRampToValueAtTime(0.14, now + 0.05);
      burstGain.gain.setValueAtTime(0.14, now + 0.75);
      burstGain.gain.linearRampToValueAtTime(0, now + 0.8);
      // Ring burst 2 (1.0 to 1.8s)
      burstGain.gain.linearRampToValueAtTime(0.14, now + 1.05);
      burstGain.gain.setValueAtTime(0.14, now + 1.75);
      burstGain.gain.linearRampToValueAtTime(0, now + 1.8);

      osc1.connect(burstGain);
      osc2.connect(burstGain);
      burstGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.85);
      osc2.stop(now + 1.85);

      const nodeRecord = { osc1, osc2, burstGain };
      activeRingtoneNodes.push(nodeRecord);

      const cleanupNode = () => {
        const idx = activeRingtoneNodes.indexOf(nodeRecord);
        if (idx !== -1) activeRingtoneNodes.splice(idx, 1);
      };
      osc1.onended = cleanupNode;
    } catch (e) {}
  };

  playBurst();
  ringtoneInterval = setInterval(playBurst, 3500);

  // Strict safety cutoff: auto-stop after 25 seconds so it can NEVER loop infinitely
  ringtoneTimeout = setTimeout(() => {
    stopRingtone();
  }, 25000);

  return stopRingtone;
}

export function stopRingtone() {
  isRingtoneActive = false;

  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (ringtoneTimeout) {
    clearTimeout(ringtoneTimeout);
    ringtoneTimeout = null;
  }

  // Immediately silence and disconnect all active ringtone nodes
  const nodesToClean = [...activeRingtoneNodes];
  activeRingtoneNodes = [];

  nodesToClean.forEach((item) => {
    try {
      if (item.burstGain) {
        if (audioCtx) {
          item.burstGain.gain.cancelScheduledValues(audioCtx.currentTime);
          item.burstGain.gain.setValueAtTime(0, audioCtx.currentTime);
        }
        item.burstGain.disconnect();
      }
      if (item.osc1) {
        item.osc1.stop();
        item.osc1.disconnect();
      }
      if (item.osc2) {
        item.osc2.stop();
        item.osc2.disconnect();
      }
    } catch (e) {}
  });
}

// Cleanup on tab hide or page close
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopRingtone);
  window.addEventListener('pagehide', stopRingtone);
}
