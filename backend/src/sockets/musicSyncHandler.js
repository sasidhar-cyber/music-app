const { db } = require('../db');

function setupMusicSyncHandler(io, socket) {
  // Broadcast active playback state to partner in Duo Room
  socket.on('music:sync_state', (data) => {
    try {
      const { roomId, track, isPlaying, currentTime, action } = data || {};
      if (!roomId) return;

      const payload = {
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        track,
        isPlaying: !!isPlaying,
        currentTime: typeof currentTime === 'number' ? currentTime : 0,
        action: action || 'sync',
        timestamp: Date.now()
      };

      // Broadcast to room members
      socket.to(roomId).emit('music:partner_sync', payload);

      // Also directly notify partner via user-specific socket room
      try {
        const otherMembers = db.prepare(`
          SELECT user_id FROM room_members 
          WHERE room_id = ? AND user_id != ?
        `).all(roomId, socket.user.id);

        for (const m of otherMembers) {
          io.to(`user:${m.user_id}`).emit('music:partner_sync', payload);
        }
      } catch (e) {}
    } catch (err) {
      console.warn('[MusicSync] Error handling sync_state:', err);
    }
  });

  // Request partner's current music state ("What are you listening to right now?")
  socket.on('music:request_sync', ({ roomId }) => {
    try {
      if (!roomId) return;
      socket.to(roomId).emit('music:request_current', {
        fromUserId: socket.user.id,
        fromUsername: socket.user.username,
        roomId
      });
    } catch (err) {
      console.warn('[MusicSync] Error handling request_sync:', err);
    }
  });

  // Respond to partner's request for current music
  socket.on('music:respond_sync', (data) => {
    try {
      const { toUserId, roomId, track, isPlaying, currentTime } = data || {};
      const payload = {
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        track,
        isPlaying: !!isPlaying,
        currentTime: typeof currentTime === 'number' ? currentTime : 0,
        action: 'response',
        timestamp: Date.now()
      };

      if (toUserId) {
        io.to(`user:${toUserId}`).emit('music:partner_sync', payload);
      } else if (roomId) {
        socket.to(roomId).emit('music:partner_sync', payload);
      }
    } catch (err) {
      console.warn('[MusicSync] Error handling respond_sync:', err);
    }
  });

  // Collaborative Queue Real-time Events
  socket.on('music:queue_sync', (data) => {
    try {
      const { roomId, queue, currentIndex, currentTrack } = data || {};
      if (!roomId) return;
      socket.to(roomId).emit('music:queue_updated', {
        queue,
        currentIndex,
        currentTrack,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('[MusicSync] Error handling queue_sync:', err);
    }
  });

  // Live Upvote next song event
  socket.on('music:queue_vote', (data) => {
    try {
      const { roomId, trackId } = data || {};
      if (!roomId || !trackId) return;

      const userId = socket.user.id;
      const username = socket.user.username;
      const now = new Date().toISOString();

      const existingVote = db.prepare(`
        SELECT * FROM room_queue_votes 
        WHERE room_id = ? AND track_id = ? AND user_id = ?
      `).get(roomId, trackId, userId);

      let action = 'voted';
      if (existingVote) {
        db.prepare('DELETE FROM room_queue_votes WHERE room_id = ? AND track_id = ? AND user_id = ?').run(roomId, trackId, userId);
        action = 'unvoted';
      } else {
        db.prepare(`
          INSERT INTO room_queue_votes (room_id, track_id, user_id, created_at)
          VALUES (?, ?, ?, ?)
        `).run(roomId, trackId, userId, now);
        action = 'voted';
      }

      const countRow = db.prepare('SELECT COUNT(*) as total FROM room_queue_votes WHERE room_id = ? AND track_id = ?').get(roomId, trackId);
      const newUpvotes = countRow ? countRow.total : 0;
      db.prepare('UPDATE room_queue SET upvotes = ? WHERE room_id = ? AND track_id = ?').run(newUpvotes, roomId, trackId);

      const payload = {
        roomId,
        trackId,
        upvotes: newUpvotes,
        action,
        voterId: userId,
        voterUsername: username,
        timestamp: Date.now()
      };

      io.to(roomId).emit('music:queue_voted', payload);
    } catch (err) {
      console.warn('[MusicSync] Error handling queue_vote:', err);
    }
  });

  // Live Queue Reorder event
  socket.on('music:queue_reorder', (data) => {
    try {
      const { roomId, trackIds } = data || {};
      if (!roomId || !Array.isArray(trackIds)) return;

      const updateStmt = db.prepare('UPDATE room_queue SET position = ? WHERE room_id = ? AND track_id = ?');
      const updateTx = db.transaction((ids) => {
        ids.forEach((tid, idx) => {
          updateStmt.run(idx, roomId, tid);
        });
      });
      updateTx(trackIds);

      socket.to(roomId).emit('music:queue_reordered', {
        roomId,
        trackIds,
        reorderedBy: socket.user.username,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('[MusicSync] Error handling queue_reorder:', err);
    }
  });
}

module.exports = { setupMusicSyncHandler };
