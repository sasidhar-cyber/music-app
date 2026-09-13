import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { playSound, stopRingtone } from '../utils/soundEffects';
import { showBrowserNotification } from '../utils/notificationService';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const { user } = useAuth();

  const [hasPartner, setHasPartner] = useState(false);
  const [hasRoom, setHasRoom] = useState(false);
  const [partnership, setPartnership] = useState(null);
  const [partner, setPartner] = useState(null);
  const [members, setMembers] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);

  // Helper to load messages from localStorage
  const getCachedMessages = (roomId, channel = 'normal') => {
    if (!roomId) return [];
    try {
      const raw = localStorage.getItem(`duocore_msgs_${roomId}_${channel}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper to save messages to localStorage
  const cacheMessages = (roomId, channel, msgs) => {
    if (!roomId || !Array.isArray(msgs)) return;
    try {
      localStorage.setItem(`duocore_msgs_${roomId}_${channel}`, JSON.stringify(msgs));
    } catch (e) {}
  };

  // Realtime Chat & Vault Messages with instant cache loading
  const [normalMessages, setNormalMessages] = useState(() => {
    try {
      const rid = localStorage.getItem('duocore_room_id');
      if (rid) {
        const raw = localStorage.getItem(`duocore_msgs_${rid}_normal`);
        return raw ? JSON.parse(raw) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [privateMessages, setPrivateMessages] = useState(() => {
    try {
      const rid = localStorage.getItem('duocore_room_id');
      if (rid) {
        const raw = localStorage.getItem(`duocore_msgs_${rid}_private`);
        return raw ? JSON.parse(raw) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [activeChannel, setActiveChannel] = useState('normal'); // 'normal' | 'private'
  const [partnerTyping, setPartnerTyping] = useState({ normal: false, private: false });

  // Goals & Timer
  const [goals, setGoals] = useState([]);
  const [timerState, setTimerState] = useState(null);

  // Global WebRTC Calling State (Accessible across whole app)
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCallModal, setActiveCallModal] = useState(null); // 'video' | 'audio' | null
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  const currentRoomIdRef = useRef(null);

  // Load active squad / room state from backend with auto-healing persistence
  const refreshPartnerState = useCallback(async (preferredRoomId) => {
    const activeToken = localStorage.getItem('duocore_token');
    if (!activeToken) {
      setHasPartner(false);
      setHasRoom(false);
      setPartnership(null);
      setPartner(null);
      setMembers([]);
      setRoomData(null);
      setGoals([]);
      setPendingInvite(null);
      return;
    }

    try {
      const savedRoomRaw = localStorage.getItem('duocore_active_room_data');
      let savedRoomObj = null;
      try {
        if (savedRoomRaw) savedRoomObj = JSON.parse(savedRoomRaw);
      } catch (e) {}

      const targetRoomId = preferredRoomId || currentRoomIdRef.current || localStorage.getItem('duocore_room_id') || savedRoomObj?.id;

      // Pre-load local cached messages immediately so they appear in 0ms
      if (targetRoomId) {
        const cachedNormal = getCachedMessages(targetRoomId, 'normal');
        if (cachedNormal.length > 0) setNormalMessages(cachedNormal);
        const cachedPrivate = getCachedMessages(targetRoomId, 'private');
        if (cachedPrivate.length > 0) setPrivateMessages(cachedPrivate);
      }

      let res = await api.getCurrentPartner(targetRoomId);

      // If backend restarted and lost room in memory, automatically heal and restore from local backup!
      if (!res?.hasRoom && (targetRoomId || savedRoomObj)) {
        try {
          console.log('[RoomContext] Auto-healing permanent duo room to server:', targetRoomId || savedRoomObj?.id);
          const syncRes = await api.syncRoom({
            roomId: targetRoomId || savedRoomObj?.id,
            roomCode: savedRoomObj?.code,
            roomName: savedRoomObj?.name || 'Duo Room',
            partnerId: savedRoomObj?.partner?.id
          });
          if (syncRes?.room) {
            res = await api.getCurrentPartner(syncRes.room.id);
          }
        } catch (syncErr) {
          console.warn('[RoomContext] syncRoom error:', syncErr.message);
        }
      }

      if (res?.hasRoom && res.room) {
        setHasRoom(true);
        setHasPartner(res.hasPartner);
        setPartnership(res.partnership || null);
        setPartner(res.partner);
        setMembers(res.members || []);
        setRoomData(res.room);
        setGoals(res.goals || []);
        setPendingInvite(null);
        currentRoomIdRef.current = res.room.id;
        try {
          localStorage.setItem('duocore_room_id', res.room.id);
          localStorage.setItem('duocore_active_room_data', JSON.stringify({
            id: res.room.id,
            code: res.room.code,
            name: res.room.name,
            partner: res.partner,
            members: res.members
          }));
        } catch (e) {}

        // Join socket room
        const s = getSocket();
        if (s) {
          if (!s.connected) s.connect();
          s.emit('room:join', { roomId: res.room.id });
        }

        // Fetch normal messages and merge with persistent local cache
        api.getRoomMessages(res.room.id, 'normal')
          .then((msgRes) => {
            const serverMsgs = msgRes.messages || [];
            const cached = getCachedMessages(res.room.id, 'normal');
            const map = new Map();
            cached.forEach(m => map.set(m.id, m));
            serverMsgs.forEach(m => map.set(m.id, m));
            const merged = Array.from(map.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setNormalMessages(merged);
            cacheMessages(res.room.id, 'normal', merged);

            // If server restart lost messages, push cached messages back to server
            if (serverMsgs.length === 0 && cached.length > 0) {
              api.syncMessages(res.room.id, cached).catch(() => {});
            }
          })
          .catch(() => {});

        // Fetch private messages and merge with persistent local cache
        api.getRoomMessages(res.room.id, 'private')
          .then((msgRes) => {
            const serverMsgs = msgRes.messages || [];
            const cached = getCachedMessages(res.room.id, 'private');
            const map = new Map();
            cached.forEach(m => map.set(m.id, m));
            serverMsgs.forEach(m => map.set(m.id, m));
            const merged = Array.from(map.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setPrivateMessages(merged);
            cacheMessages(res.room.id, 'private', merged);

            if (serverMsgs.length === 0 && cached.length > 0) {
              api.syncMessages(res.room.id, cached).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        // Only if user truly has never joined a room do we clear
        if (!targetRoomId && !savedRoomObj) {
          setHasPartner(false);
          setHasRoom(false);
          setPartnership(null);
          setPartner(null);
          setMembers([]);
          setRoomData(null);
          setGoals([]);
          setPendingInvite(res?.pendingInvite || null);
          currentRoomIdRef.current = null;
        }
      }
    } catch (err) {
      console.error('[RoomContext] Failed to load room state:', err);
    }
  }, [user?.id]);

  // Initial load on user login/auth change
  useEffect(() => {
    refreshPartnerState();
  }, [refreshPartnerState]);

  // Background Auto-Sync (fallback interval only; real-time updates happen via Socket.io)
  useEffect(() => {
    const interval = setInterval(async () => {
      const activeToken = localStorage.getItem('duocore_token');
      if (!activeToken) return;

      if (currentRoomIdRef.current) {
        try {
          const msgRes = await api.getRoomMessages(currentRoomIdRef.current, activeChannel);
          if (msgRes.messages && Array.isArray(msgRes.messages)) {
            if (activeChannel === 'private') {
              setPrivateMessages((prev) => {
                if (prev.length === msgRes.messages.length && prev[prev.length - 1]?.id === msgRes.messages[msgRes.messages.length - 1]?.id) {
                  return prev;
                }
                return msgRes.messages;
              });
            } else {
              setNormalMessages((prev) => {
                if (prev.length === msgRes.messages.length && prev[prev.length - 1]?.id === msgRes.messages[msgRes.messages.length - 1]?.id) {
                  return prev;
                }
                return msgRes.messages;
              });
            }
          }
          if (!hasPartner) {
            const partnerRes = await api.getCurrentPartner();
            if (partnerRes.hasPartner) {
              setHasPartner(true);
              setPartner(partnerRes.partner);
              setMembers(partnerRes.members || []);
            }
          }
        } catch (e) {}
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [activeChannel, hasPartner]);

  const typingResetTimerRef = useRef(null);

  // Handle App Foreground / Visibility Change & Network Online on mobile
  useEffect(() => {
    const handleForeground = () => {
      if (document.visibilityState === 'visible') {
        const s = getSocket();
        if (s && !s.connected) {
          s.connect();
        }
        if (currentRoomIdRef.current && s && s.connected) {
          s.emit('room:join', { roomId: currentRoomIdRef.current });
        }
        refreshPartnerState();
      }
    };

    const handleOnline = () => {
      const s = getSocket();
      if (s) {
        if (!s.connected) s.connect();
        if (currentRoomIdRef.current) {
          s.emit('room:join', { roomId: currentRoomIdRef.current });
        }
      }
      refreshPartnerState();
    };

    document.addEventListener('visibilitychange', handleForeground);
    window.addEventListener('focus', handleForeground);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleForeground);
      window.removeEventListener('focus', handleForeground);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshPartnerState]);

  // Socket event listeners
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const handleNewMessage = (msg) => {
      const activeRoom = currentRoomIdRef.current || localStorage.getItem('duocore_room_id');
      if (!activeRoom || msg.room_id === activeRoom) {
        if (msg.channel_type === 'private') {
          setPrivateMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const updated = [...prev, msg];
            cacheMessages(msg.room_id || activeRoom, 'private', updated);
            return updated;
          });
        } else {
          setNormalMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const updated = [...prev, msg];
            cacheMessages(msg.room_id || activeRoom, 'normal', updated);
            return updated;
          });
        }
      }

      if (msg.sender_id !== user?.id) {
        if (localStorage.getItem('duocore_notif_messages') !== 'false') {
          playSound('message');
          showBrowserNotification(msg.username || 'DuoCore Message', {
            body: msg.text || 'Sent you an attachment',
            tag: `duocore-${msg.room_id}`
          });
        }
      }
    };

    const handlePartnerTyping = ({ channel = 'normal', isTyping }) => {
      const ch = channel || 'normal';
      setPartnerTyping((prev) => ({
        ...prev,
        [ch]: !!isTyping
      }));

      if (typingResetTimerRef.current) clearTimeout(typingResetTimerRef.current);
      if (isTyping) {
        typingResetTimerRef.current = setTimeout(() => {
          setPartnerTyping((prev) => ({
            ...prev,
            [ch]: false
          }));
        }, 4000);
      }
    };

    const handlePartnerStatus = (data) => {
      setPartner((prev) => (prev ? { ...prev, ...data } : data));
      setMembers((prev) => prev.map(m => m.id === data.userId ? { ...m, ...data } : m));
    };

    const handlePartnerJoined = (data) => {
      if (data?.roomId && currentRoomIdRef.current && data.roomId !== currentRoomIdRef.current) {
        return;
      }
      if (data.userId !== user?.id) {
        if (localStorage.getItem('duocore_notif_invites') !== 'false') {
          playSound('quiz_correct');
          if (document.hidden) {
            showBrowserNotification('Duo Partner Connected', {
              body: `${data.username || 'Your friend'} has joined your private room!`,
              tag: 'duocore-partner'
            });
          }
        }
        refreshPartnerState(data?.roomId);
      }
    };

    const handleMemberJoined = (data) => {
      if (data?.roomId && currentRoomIdRef.current && data.roomId !== currentRoomIdRef.current) {
        return;
      }
      if (localStorage.getItem('duocore_notif_invites') !== 'false') {
        playSound('quiz_correct');
      }
      refreshPartnerState(data?.roomId);
    };

    const handlePartnerLeft = (data) => {
      if (data?.roomId && currentRoomIdRef.current && data.roomId !== currentRoomIdRef.current) {
        return;
      }
      if (data.userId !== user?.id) {
        setPartner((prev) => (prev ? { ...prev, is_online: false } : prev));
        setMembers((prev) => prev.map(m => m.id === data.userId ? { ...m, is_online: false } : m));
      }
    };

    const handleDuoConnected = (data) => {
      if (data?.roomId && currentRoomIdRef.current && data.roomId !== currentRoomIdRef.current) {
        return;
      }
      playSound('quiz_correct');
      refreshPartnerState(data?.roomId);
    };

    const handleDuoPartnerRemoved = (data) => {
      if (data?.roomId && currentRoomIdRef.current && data.roomId !== currentRoomIdRef.current) {
        return;
      }
      setHasPartner(false);
      setPartner(null);
      setPartnership(null);
      playSound('quiz_wrong');
      refreshPartnerState();
    };

    const handleTimerSync = (state) => {
      setTimerState(state);
    };

    const handleUserStatusChange = ({ userId, isOnline, lastSeen }) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === userId ? { ...m, is_online: isOnline, last_seen: isOnline ? 'now' : lastSeen } : m
        )
      );
      setPartner((prev) =>
        prev && prev.id === userId ? { ...prev, is_online: isOnline, last_seen: isOnline ? 'now' : lastSeen } : prev
      );
    };

    const handleRoomStatuses = ({ statuses }) => {
      if (!Array.isArray(statuses)) return;
      const statusMap = new Map(statuses.map((s) => [s.userId, s]));
      setMembers((prev) =>
        prev.map((m) => {
          const stat = statusMap.get(m.id);
          return stat ? { ...m, is_online: stat.isOnline, last_seen: stat.lastSeen } : m;
        })
      );
      setPartner((prev) => {
        if (!prev) return prev;
        const stat = statusMap.get(prev.id);
        return stat ? { ...prev, is_online: stat.isOnline, last_seen: stat.lastSeen } : prev;
      });
    };

    const handleSocketConnect = () => {
      if (currentRoomIdRef.current) {
        s.emit('room:join', { roomId: currentRoomIdRef.current });
      }
    };

    const handleReaction = ({ messageId, userId, emoji, action }) => {
      const isMe = String(userId) === String(user?.id);
      if (isMe) {
        // Local user's reaction was already applied optimistically; skip echo to avoid desync
        return;
      }
      const updateList = (list) =>
        list.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions || {}) };
          const myReactions = new Set(m.my_reactions || []);
          if (action === 'added') {
            reactions[emoji] = (reactions[emoji] || 0) + 1;
          } else {
            reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
            if (reactions[emoji] === 0) delete reactions[emoji];
          }
          return { ...m, reactions, my_reactions: Array.from(myReactions) };
        });

      setNormalMessages(updateList);
      setPrivateMessages(updateList);
    };

    const handleMessageDeleted = ({ messageId, channel = 'normal' }) => {
      const filterDeleted = (list) => list.filter((m) => m.id !== messageId);
      if (channel.startsWith('dm:') || channel.startsWith('private:')) {
        setPrivateMessages(filterDeleted);
      } else {
        setNormalMessages(filterDeleted);
      }
    };

    const handleRoomCleared = ({ roomId, channel = 'normal' }) => {
      if (roomId === currentRoomIdRef.current) {
        if (channel.startsWith('dm:') || channel.startsWith('private:')) {
          setPrivateMessages([]);
        } else {
          setNormalMessages([]);
        }
      }
    };

    const handleMessagesRead = ({ roomId, channel = 'normal', readBy }) => {
      const markRead = (list) =>
        list.map((m) => (m.sender_id !== readBy ? { ...m, is_read: 1 } : m));

      if (channel.startsWith('dm:') || channel.startsWith('private:')) {
        setPrivateMessages(markRead);
      } else {
        setNormalMessages(markRead);
      }
    };

    const handleIncomingRing = (callData) => {
      if (callData.caller?.id === user?.id) return;
      setIncomingCall(callData);
      if (localStorage.getItem('duocore_notif_calls') !== 'false') {
        if (document.hidden) {
          showBrowserNotification(`Incoming ${callData.callType === 'video' ? 'HD Video' : 'Audio'} Call`, {
            body: `${callData.caller?.username || 'Duo Partner'} is calling you on DuoCore...`,
            tag: 'duocore-call'
          });
        }
      }
    };

    const handleCallDeclined = (data) => {
      stopRingtone();
      console.log(`[Call] Call declined by ${data?.username || 'partner'}`);
      setActiveCallModal(null);
      setIncomingCall(null);
    };

    const handleCallCancelled = () => {
      stopRingtone();
      setIncomingCall(null);
    };

    s.on('connect', handleSocketConnect);
    s.on('chat:new_message', handleNewMessage);
    s.on('chat:message_deleted', handleMessageDeleted);
    s.on('chat:messages_read', handleMessagesRead);
    s.on('chat:partner_typing', handlePartnerTyping);
    s.on('presence:partner_status', handlePartnerStatus);
    s.on('presence:user_status_change', handleUserStatusChange);
    s.on('presence:room_statuses', handleRoomStatuses);
    s.on('room:partner_joined', handlePartnerJoined);
    s.on('room:member_joined', handleMemberJoined);
    s.on('room:partner_left', handlePartnerLeft);
    s.on('duo:connected', handleDuoConnected);
    s.on('duo:partner_removed', handleDuoPartnerRemoved);
    s.on('timer:state_sync', handleTimerSync);
    s.on('chat:reaction_updated', handleReaction);
    s.on('chat:room_cleared', handleRoomCleared);
    s.on('call:incoming_ring', handleIncomingRing);
    s.on('call:declined', handleCallDeclined);
    s.on('call:cancelled', handleCallCancelled);

    return () => {
      s.off('connect', handleSocketConnect);
      s.off('chat:new_message', handleNewMessage);
      s.off('chat:message_deleted', handleMessageDeleted);
      s.off('chat:messages_read', handleMessagesRead);
      s.off('chat:partner_typing', handlePartnerTyping);
      s.off('presence:partner_status', handlePartnerStatus);
      s.off('presence:user_status_change', handleUserStatusChange);
      s.off('presence:room_statuses', handleRoomStatuses);
      s.off('room:partner_joined', handlePartnerJoined);
      s.off('room:member_joined', handleMemberJoined);
      s.off('room:partner_left', handlePartnerLeft);
      s.off('duo:connected', handleDuoConnected);
      s.off('duo:partner_removed', handleDuoPartnerRemoved);
      s.off('timer:state_sync', handleTimerSync);
      s.off('chat:reaction_updated', handleReaction);
      s.off('chat:room_cleared', handleRoomCleared);
      s.off('call:incoming_ring', handleIncomingRing);
      s.off('call:declined', handleCallDeclined);
      s.off('call:cancelled', handleCallCancelled);
    };
  }, [user?.id, refreshPartnerState]);

  // Periodic heartbeat
  useEffect(() => {
    if (!roomData?.id) return;
    const interval = setInterval(() => {
      const s = getSocket();
      if (s && s.connected) {
        s.emit('presence:heartbeat', { roomId: roomData.id });
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [roomData?.id]);

  // Actions
  const createRoom = async () => {
    const res = await api.createDuoRoom();
    if (res?.room?.id) {
      currentRoomIdRef.current = res.room.id;
      try {
        localStorage.setItem('duocore_room_id', res.room.id);
      } catch (e) {}
      const s = getSocket();
      if (s) {
        if (!s.connected) s.connect();
        s.emit('room:join', { roomId: res.room.id });
      }
    }
    await refreshPartnerState(res?.room?.id);
    return res;
  };

  const joinRoom = async (code) => {
    const res = await api.joinDuoRoom(code);
    if (res?.room?.id) {
      currentRoomIdRef.current = res.room.id;
      try {
        localStorage.setItem('duocore_room_id', res.room.id);
      } catch (e) {}
      const s = getSocket();
      if (s) {
        if (!s.connected) s.connect();
        s.emit('room:join', { roomId: res.room.id });
      }
    }
    await refreshPartnerState(res?.room?.id);
    return res;
  };

  const createInvite = async () => {
    const res = await api.createInvite();
    setPendingInvite(res.invite);
    return res.invite;
  };

  const cancelInvite = async () => {
    await api.cancelInvite();
    setPendingInvite(null);
  };

  const acceptInvite = async (code) => {
    const res = await api.acceptInvite(code);
    await refreshPartnerState();
    return res;
  };

  const removePartner = async () => {
    try {
      localStorage.removeItem('duocore_room_id');
      localStorage.removeItem('duocore_active_room_data');
    } catch (e) {}
    const res = await api.removePartner();
    await refreshPartnerState();
    return res;
  };

  const sendMessage = async ({ text, channel = activeChannel, metadata = {}, replyTo = null, fileUrl = null, fileType = null }) => {
    if (!roomData) return;

    try {
      const res = await api.sendRoomMessage(roomData.id, {
        text: text || '',
        channel_type: channel || 'normal',
        metadata: typeof metadata === 'object' ? metadata : {},
        reply_to_id: replyTo?.id || null,
        file_url: fileUrl,
        file_type: fileType
      });
      const savedMsg = res.message || res.data;
      if (savedMsg) {
        const targetRoom = roomData.id;
        if (channel === 'private') {
          setPrivateMessages((prev) => {
            if (prev.some((m) => m.id === savedMsg.id)) return prev;
            const updated = [...prev, savedMsg];
            cacheMessages(targetRoom, 'private', updated);
            return updated;
          });
        } else {
          setNormalMessages((prev) => {
            if (prev.some((m) => m.id === savedMsg.id)) return prev;
            const updated = [...prev, savedMsg];
            cacheMessages(targetRoom, 'normal', updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('[SendMessage REST] Fallback error:', err);
    }
  };

  const sendTyping = (arg1 = true, arg2 = 'normal') => {
    if (!roomData?.id) return;
    let isTyping = true;
    let channel = 'normal';
    if (typeof arg1 === 'boolean') {
      isTyping = arg1;
      channel = typeof arg2 === 'string' ? arg2 : 'normal';
    } else if (typeof arg1 === 'string') {
      channel = arg1;
      isTyping = typeof arg2 === 'boolean' ? arg2 : true;
    }
    const s = getSocket();
    if (s && s.connected) {
      s.emit('chat:typing', { roomId: roomData.id, channel: channel || 'normal', isTyping: !!isTyping });
    }
  };

  const clearChatMessages = async (channel = 'normal') => {
    if (!roomData?.id) return;
    try {
      await api.clearRoomMessages(roomData.id, channel);
      if (channel.startsWith('dm:') || channel.startsWith('private:')) {
        setPrivateMessages([]);
      } else {
        setNormalMessages([]);
      }
    } catch (err) {
      console.error('[RoomContext] Clear chat error:', err);
      throw err;
    }
  };

  const panicClearMessages = async (channel = 'normal') => {
    if (!roomData?.id) return;
    try {
      await api.panicClearRoomMessages(roomData.id);
      setNormalMessages([]);
      setPrivateMessages([]);
    } catch (err) {
      console.error('[RoomContext] Panic clear error:', err);
      throw err;
    }
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!roomData?.id || !messageId || !emoji) return;

    // 1. Instant optimistic update so UI never disappears ("vellipothundhi") on mobile
    const applyOptimistic = (targetMsgId, targetEmoji) => {
      let isAdding = true;
      const updateList = (list) =>
        list.map((m) => {
          if (m.id !== targetMsgId) return m;
          const reactions = { ...(m.reactions || {}) };
          const myReactions = new Set(m.my_reactions || []);
          if (myReactions.has(targetEmoji)) {
            // User is removing this reaction
            isAdding = false;
            myReactions.delete(targetEmoji);
            reactions[targetEmoji] = Math.max(0, (reactions[targetEmoji] || 1) - 1);
            if (reactions[targetEmoji] === 0) delete reactions[targetEmoji];
          } else {
            // User is adding this reaction
            isAdding = true;
            myReactions.add(targetEmoji);
            reactions[targetEmoji] = (reactions[targetEmoji] || 0) + 1;
          }
          return { ...m, reactions, my_reactions: Array.from(myReactions) };
        });

      setNormalMessages(updateList);
      setPrivateMessages(updateList);
      return isAdding;
    };

    applyOptimistic(messageId, emoji);

    // 2. Transmit via WebSocket if connected, otherwise fallback to REST API
    const s = getSocket();
    if (s && s.connected) {
      s.emit('chat:react', { roomId: roomData.id, messageId, emoji });
    } else {
      try {
        api.reactToMessage(roomData.id, messageId, emoji).catch((err) => {
          console.warn('[RoomContext] React API fallback error:', err);
        });
      } catch (err) {
        console.warn('[RoomContext] Toggle reaction dispatch error:', err);
      }
    }
  };

  const deleteSingleMessage = async (messageId, channel = 'normal') => {
    if (!roomData?.id) return;
    try {
      await api.deleteMessage(roomData.id, messageId);
      const filterMsg = (list) => list.filter((m) => m.id !== messageId);
      if (channel.startsWith('dm:') || channel.startsWith('private:')) {
        setPrivateMessages(filterMsg);
      } else {
        setNormalMessages(filterMsg);
      }
    } catch (err) {
      console.error('[RoomContext] Delete message error:', err);
      throw err;
    }
  };

  const startOutgoingCall = useCallback((callType = 'video') => {
    if (!roomData?.id) return;
    const target = partner || members.find((m) => m.id !== user?.id);
    const s = getSocket();
    if (s && s.connected) {
      s.emit('call:start_call', {
        targetUserId: target?.id,
        roomId: roomData.id,
        callType
      });
    }
    setIsCallInitiator(true);
    setActiveCallModal(callType);
  }, [roomData?.id, partner, members, user?.id]);

  const acceptIncomingCall = useCallback(() => {
    stopRingtone();
    if (!incomingCall) return;
    const type = incomingCall.callType || 'video';
    setIncomingCall(null);
    setIsCallInitiator(false);
    setActiveCallModal(type);
  }, [incomingCall]);

  const declineIncomingCall = useCallback(() => {
    stopRingtone();
    if (!incomingCall) return;
    const s = getSocket();
    if (s && s.connected) {
      s.emit('call:decline_call', {
        callerSocketId: incomingCall.caller?.socketId,
        targetUserId: incomingCall.caller?.id,
        roomId: incomingCall.roomId || roomData?.id
      });
    }
    setIncomingCall(null);
  }, [incomingCall, roomData?.id]);

  const endActiveCall = useCallback(() => {
    stopRingtone();
    const s = getSocket();
    if (s && s.connected && roomData?.id) {
      s.emit('call:leave', { roomId: roomData.id });
      const target = partner || members.find((m) => m.id !== user?.id);
      s.emit('call:cancel_call', {
        targetUserId: target?.id,
        roomId: roomData.id
      });
    }
    setActiveCallModal(null);
    setIncomingCall(null);
  }, [roomData?.id, partner, members, user?.id]);

  return (
    <RoomContext.Provider
      value={{
        hasPartner,
        hasRoom,
        partnership,
        partner,
        members,
        roomData,
        pendingInvite,
        normalMessages,
        privateMessages,
        activeChannel,
        partnerTyping,
        goals,
        timerState,
        incomingCall,
        activeCallModal,
        isCallInitiator,
        refreshPartnerState,
        createRoom,
        joinRoom,
        createInvite,
        cancelInvite,
        acceptInvite,
        removePartner,
        sendMessage,
        sendTyping,
        toggleReaction,
        clearChatMessages,
        panicClearMessages,
        deleteSingleMessage,
        startOutgoingCall,
        acceptIncomingCall,
        declineIncomingCall,
        endActiveCall,
        setActiveCallModal,
        setActiveChannel
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
