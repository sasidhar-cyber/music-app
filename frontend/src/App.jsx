import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoomProvider, useRoom } from './context/RoomContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Navbar } from './components/Navbar';
import { MusicHomePage } from './pages/MusicHomePage';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { NowPlayingModal } from './components/NowPlayingModal';
import { LyricsModal } from './components/LyricsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { PlaylistModal } from './components/PlaylistModal';
import { StatsModal } from './components/StatsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ChatView } from './components/ChatView';
import { InviteModal } from './components/InviteModal';
import { PinUnlockModal } from './components/PinUnlockModal';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { IncomingCallModal } from './components/IncomingCallModal';
import { VideoCallModal } from './components/VideoCallModal';
import { AudioCallModal } from './components/AudioCallModal';
import { AuthPage } from './pages/AuthPage';
import { Heart } from 'lucide-react';
import api from './services/api';

function AppContent() {
  const { user, loading } = useAuth();
  const {
    refreshPartnerState,
    incomingCall,
    activeCallModal,
    isCallInitiator,
    acceptIncomingCall,
    declineIncomingCall,
    endActiveCall
  } = useRoom();
  const { isNowPlayingOpen, closeNowPlaying, playTrack, openNowPlaying, currentTrack, duoToast, setDuoToast } = useMusic();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('music'); // 'music' | 'chat'
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Auto-dismiss duoToast after 3.5 seconds
  useEffect(() => {
    if (duoToast) {
      const timer = setTimeout(() => {
        setDuoToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [duoToast, setDuoToast]);

  // Check URL query parameters for 1-Click invite links & direct song deep links
  useEffect(() => {
    const handleUrlActions = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const inviteCode = params.get('invite');
        const songId = params.get('song');
        const action = params.get('action');

        const roomCode = params.get('invite') || params.get('room');
        if (roomCode) {
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            let activeToken = localStorage.getItem('duocore_token');
            if (!activeToken) {
              const guestRes = await api.guestLogin();
              localStorage.setItem('duocore_token', guestRes.token);
            }
            await api.joinDuoRoom(roomCode);
            await refreshPartnerState();
            setIsPinPromptOpen(false);
            setActiveTab('chat');
          } catch (e) {
            console.warn('[Auto Invite Join] Error:', e);
          }
        }

        if (songId) {
          api.searchMusic(songId)
            .then((res) => {
              if (res.results && res.results.length > 0) {
                playTrack(res.results[0]);
              }
            })
            .catch(() => {});
        }

        if (action === 'chat') {
          setIsPinPromptOpen(true);
        }
      } catch (e) {}
    };

    if (!loading) {
      handleUrlActions();
    }
  }, [loading, refreshPartnerState]);

  // Global Keyboard Panic / Back to Music key (Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPinPromptOpen) setIsPinPromptOpen(false);
        if (activeTab === 'chat') setActiveTab('music');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isPinPromptOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/icons/icon-192x192.png"
            alt="SoundWave"
            className="w-16 h-16 rounded-3xl object-cover ring-2 ring-emerald-500/40 shadow-2xl animate-pulse"
          />
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-400 font-bold">
            DuoCore Starting...
          </span>
        </div>
      </div>
    );
  }

  // LOGIN-FIRST EXPERIENCE: Show AuthPage if not authenticated
  if (!user) {
    return <AuthPage onAuthenticated={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-white relative">
      {/* Offline / Online Network Indicator */}
      <NetworkStatusBanner />

      {/* PWA Mobile Install Prompt */}
      <PWAInstallPrompt />

      {/* 💬 CHAT TAB: FULL SCREEN 1v1 DUO CHAT */}
      {activeTab === 'chat' ? (
        <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col p-0 sm:p-4 select-none relative overflow-hidden">
          <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto flex flex-col">
            <ChatView
              onBack={() => setActiveTab('music')}
              onOpenInvite={() => setInviteModalOpen(true)}
            />
          </div>

          <InviteModal
            isOpen={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
          />
        </div>
      ) : (
        /* 🎵 MUSIC TAB: 100% INNOCENT PURE MUSIC STREAMING HOME */
        <>
          {/* Top Navbar with Stealth Triple-Tap Logo Trigger & Direct Duo Chat Access */}
          <Navbar
            onOpenAuth={() => setAuthOpen(true)}
            onOpenPinPrompt={() => setIsPinPromptOpen(true)}
            onOpenChat={() => setActiveTab('chat')}
          />

          <main className="flex-1 pb-24">
            <MusicHomePage
              onOpenPinPrompt={() => setIsPinPromptOpen(true)}
              onOpenChat={() => setActiveTab('chat')}
              onOpenInvite={() => setInviteModalOpen(true)}
            />
          </main>

          {/* Global Bottom Sticky Music Player */}
          <MusicPlayerBar />
        </>
      )}

      {/* Full Screen Now Playing View */}
      <NowPlayingModal
        isOpen={isNowPlayingOpen}
        onClose={closeNowPlaying}
      />

      {/* Synchronized Karaoke Lyrics Modal */}
      <LyricsModal />

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Playlist Add / Create Modal */}
      <PlaylistModal />

      {/* Listening Analytics & Stats Modal */}
      <StatsModal />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal />

      {/* Stealth 4-Digit PIN Unlock Modal */}
      <PinUnlockModal
        isOpen={isPinPromptOpen}
        onClose={() => setIsPinPromptOpen(false)}
        onUnlockSuccess={() => {
          setIsPinPromptOpen(false);
          setActiveTab('chat');
        }}
      />

      {/* Global Incoming WebRTC Ringing Modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptIncomingCall}
          onDecline={declineIncomingCall}
        />
      )}

      {/* Global Video Call Modal */}
      {activeCallModal === 'video' && (
        <VideoCallModal
          isOpen={true}
          isInitiator={isCallInitiator}
          onClose={endActiveCall}
        />
      )}

      {/* Global Audio Call Modal */}
      {activeCallModal === 'audio' && (
        <AudioCallModal
          isOpen={true}
          isInitiator={isCallInitiator}
          onClose={endActiveCall}
        />
      )}

      {/* Global Duo Music Toast Banner */}
      {duoToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-pink-500/40 text-white shadow-2xl shadow-pink-500/25 backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-sm w-[90vw] pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 fill-pink-500 text-pink-400 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-pink-300 truncate">{duoToast.title}</p>
            <p className="text-[11px] text-slate-300 truncate">{duoToast.song} • {duoToast.artist}</p>
          </div>
          {duoToast.track && !duoToast.sent && (
            <button
              onClick={() => {
                playTrack(duoToast.track);
                openNowPlaying();
                setDuoToast(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-white text-[10px] font-bold shrink-0 transition-colors"
            >
              Play
            </button>
          )}
          <button
            onClick={() => setDuoToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </RoomProvider>
    </AuthProvider>
  );
}
