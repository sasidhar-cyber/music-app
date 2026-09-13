const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { isUserOnline, getUserLastSeen } = require('../sockets/presenceHandler');
const { saveRoom, saveRoomMember, removeRoomMember, findRoomByCodeOrId, findRoomMembers } = require('../db/persistentStore');

const router = express.Router();

// Get Current Active Study Room & Squad Members
router.get('/current', requireAuth, (req, res) => {
  const userId = req.user.id;
  const requestedRoomId = req.query.roomId;
  const now = new Date().toISOString();

  // 1. Find user's active room from room_members & rooms (prefer requestedRoomId if valid)
  let memberRecord = null;
  if (requestedRoomId) {
    memberRecord = db.prepare(`
      SELECT rm.room_id, r.code as room_code, r.name as room_name, r.is_active as room_active, r.created_at
      FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.user_id = ? AND rm.room_id = ?
      LIMIT 1
    `).get(userId, requestedRoomId);
  }

  if (!memberRecord) {
    memberRecord = db.prepare(`
      SELECT rm.room_id, r.code as room_code, r.name as room_name, r.is_active as room_active, r.created_at
      FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.user_id = ?
      ORDER BY r.is_active DESC, rm.joined_at DESC
      LIMIT 1
    `).get(userId);
  }

  // Auto-restore from permanent store if room was cleared from SQLite
  if (!memberRecord && requestedRoomId) {
    const savedRoom = findRoomByCodeOrId(requestedRoomId);
    if (savedRoom) {
      db.prepare(`
        INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).run(savedRoom.id, savedRoom.code, savedRoom.name, savedRoom.passcode_hash || '', savedRoom.created_by, savedRoom.created_at || now);

      db.prepare(`
        INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
        VALUES (?, ?, ?, 'member', ?, ?, 'General', 'Duo Chat', 0, '')
      `).run('rm-' + uuidv4().slice(0, 8), savedRoom.id, userId, now, now);

      memberRecord = {
        room_id: savedRoom.id,
        room_code: savedRoom.code,
        room_name: savedRoom.name,
        room_active: 1,
        created_at: savedRoom.created_at
      };
    }
  }

  if (!memberRecord) {
    return res.json({
      hasPartner: false,
      hasRoom: false,
      room: null,
      partner: null,
      members: [],
      memberCount: 0,
      goals: []
    });
  }

  const roomId = memberRecord.room_id;
  // Ensure room stays marked active
  try {
    db.prepare('UPDATE rooms SET is_active = 1 WHERE id = ?').run(roomId);
  } catch (e) {}

  // Fetch all members in this room squad
  const rawMembers = db.prepare(`
    SELECT u.id, u.username, u.email, u.phone_number, u.avatar_url, u.bio, u.xp, u.level, u.streak,
           rm.role, rm.current_subject, rm.current_topic, rm.is_studying, rm.last_seen, rm.joined_at
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = ?
    ORDER BY rm.joined_at ASC
  `).all(roomId);

  const members = rawMembers.map(m => ({
    ...m,
    is_online: isUserOnline(m.id),
    last_seen: isUserOnline(m.id) ? 'now' : (getUserLastSeen(m.id) || m.last_seen)
  }));

  const otherMembers = members.filter(m => m.id !== userId);
  const primaryPartner = otherMembers.length > 0 ? otherMembers[0] : null;

  const goals = db.prepare(`
    SELECT * FROM goals WHERE room_id = ? ORDER BY created_at ASC
  `).all(roomId);

  return res.json({
    hasPartner: members.length > 1,
    hasRoom: true,
    room: {
      id: roomId,
      code: memberRecord.room_code,
      name: memberRecord.room_name
    },
    partner: primaryPartner,
    members,
    memberCount: members.length,
    goals
  });
});

// Explicitly Create a New 1v1 Room (Option: "Create Room")
router.post('/create-room', requireAuth, (req, res) => {
  const userId = req.user.id;
  const now = new Date().toISOString();

  // Clear any existing solo rooms for this user first
  db.prepare(`
    DELETE FROM room_members 
    WHERE user_id = ? AND room_id IN (
      SELECT r.id FROM rooms r 
      WHERE (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) <= 1
    )
  `).run(userId);

  const roomId = 'room-duo-' + uuidv4().slice(0, 8);
  let code = `DUO-${Math.floor(100 + Math.random() * 900)}`;

  let attempts = 0;
  while (attempts < 15) {
    const clash = db.prepare('SELECT id FROM rooms WHERE code = ?').get(code);
    if (!clash) break;
    code = `DUO-${Math.floor(100 + Math.random() * 900)}`;
    attempts++;
  }

  db.prepare(`
    INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
    VALUES (?, ?, ?, '', ?, 1, ?)
  `).run(roomId, code, `${req.user.username}'s Duo Room`, userId, now);

  db.prepare(`
    INSERT OR IGNORE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
    VALUES (?, ?, ?, 'creator', ?, ?, 'General', 'Duo Chat', 0, '')
  `).run('rm-' + uuidv4().slice(0, 8), roomId, userId, now, now);

  const newRoom = {
    id: roomId,
    code,
    name: `${req.user.username}'s Duo Room`,
    created_by: userId,
    is_active: 1,
    created_at: now
  };
  saveRoom(newRoom);
  saveRoomMember({ room_id: roomId, user_id: userId, role: 'creator' });

  res.json({
    success: true,
    room: newRoom
  });
});

// Explicitly Join Room via Code (Option: "Join Room")
router.post('/join-room', requireAuth, (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  if (!code) {
    return res.status(400).json({ error: 'Please enter a room code.' });
  }

  try {
    const rawClean = String(code).trim().toUpperCase();
    const digitsOnly = rawClean.replace(/[^0-9]/g, '');
    const fullDuoCode = digitsOnly ? `DUO-${digitsOnly}` : rawClean;
    const now = new Date().toISOString();

    // 1. Check existing rooms table first using exact match
    let room = db.prepare(`
      SELECT * FROM rooms 
      WHERE code = ? OR code = ? OR code = ?
      ORDER BY is_active DESC, created_at DESC
      LIMIT 1
    `).get(rawClean, fullDuoCode, digitsOnly || rawClean);

    let roomId;
    let hostId;

    if (room) {
      roomId = room.id;
      hostId = room.created_by;
      db.prepare('UPDATE rooms SET is_active = 1 WHERE id = ?').run(roomId);
    } else {
      // 2. Also check duo_invites table using exact match
      const invite = db.prepare(`
        SELECT di.*, u.username as sender_username
        FROM duo_invites di
        JOIN users u ON di.sender_id = u.id
        WHERE di.code = ? OR di.code = ? OR di.code = ?
        ORDER BY di.created_at DESC
        LIMIT 1
      `).get(rawClean, fullDuoCode, digitsOnly || rawClean);

      if (invite) {
        hostId = invite.sender_id;
        const existingHostRoom = db.prepare(`
          SELECT r.* FROM rooms r
          JOIN room_members rm ON rm.room_id = r.id
          WHERE rm.user_id = ?
          ORDER BY r.is_active DESC, rm.joined_at DESC
          LIMIT 1
        `).get(hostId);

        if (existingHostRoom) {
          room = existingHostRoom;
          roomId = room.id;
          db.prepare('UPDATE rooms SET is_active = 1 WHERE id = ?').run(roomId);
        } else {
          roomId = 'room-duo-' + uuidv4().slice(0, 8);
          db.prepare(`
            INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
            VALUES (?, ?, ?, '', ?, 1, ?)
          `).run(roomId, invite.code, `${invite.sender_username}'s Duo Room`, hostId, now);

          db.prepare(`
            INSERT OR IGNORE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
            VALUES (?, ?, ?, 'creator', ?, ?, 'General', 'Duo Chat', 0, '')
          `).run('rm-' + uuidv4().slice(0, 8), roomId, hostId, now, now);

          room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
        }
      } else {
        const savedRoom = findRoomByCodeOrId(rawClean) || findRoomByCodeOrId(fullDuoCode) || findRoomByCodeOrId(digitsOnly);
        if (savedRoom) {
          roomId = savedRoom.id;
          hostId = savedRoom.created_by;
          db.prepare(`
            INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)
          `).run(savedRoom.id, savedRoom.code, savedRoom.name, savedRoom.passcode_hash || '', hostId, savedRoom.created_at || now);
          room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
        } else {
          return res.status(404).json({
            error: `Room code "${code}" not found. Please verify the code with your friend or tap Create Room.`
          });
        }
      }
    }

    // Clear user's other solo rooms
    try {
      db.prepare(`
        DELETE FROM room_members 
        WHERE user_id = ? AND room_id != ? AND room_id IN (
          SELECT r.id FROM rooms r 
          WHERE (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) <= 1
        )
      `).run(userId, roomId);
    } catch (err) {}

    // Ensure host is in room_members
    if (hostId) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
          VALUES (?, ?, ?, 'creator', ?, ?, 'General', 'Duo Chat', 0, '')
        `).run('rm-' + uuidv4().slice(0, 8), roomId, hostId, now, now);
      } catch (err) {}
    }

    // Add current user to room
    db.prepare(`
      INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
      VALUES (?, ?, ?, 'member', ?, ?, 'General', 'Duo Chat', 0, '')
    `).run('rm-' + uuidv4().slice(0, 8), roomId, userId, now, now);

    // Save room and members in persistent store
    saveRoom(room);
    saveRoomMember({ room_id: roomId, user_id: userId, role: 'member' });
    if (hostId) {
      saveRoomMember({ room_id: roomId, user_id: hostId, role: 'creator' });
    }

    // Link permanent partnership
    if (hostId && hostId !== userId) {
      try {
        db.prepare(`
          INSERT OR REPLACE INTO duo_partnerships (id, user_a_id, user_b_id, room_id, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'active', ?, ?)
        `).run('part-' + uuidv4().slice(0, 8), hostId, userId, roomId, now, now);
      } catch (err) {}
    }

    // Get all members
    const members = db.prepare(`
      SELECT u.id, u.username, u.email, u.avatar_url, u.bio, u.xp, u.level, u.streak
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ?
    `).all(roomId);

    // Broadcast live event on WebSocket ONLY to targeted room & personal user channels - NO global broadcast!
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('room:member_joined', { roomId, user: req.user });
      io.to(roomId).emit('duo:connected', { roomId, room, partner: req.user });
      if (hostId) {
        io.to(`user:${hostId}`).emit('room:member_joined', { roomId, user: req.user });
        io.to(`user:${hostId}`).emit('duo:connected', { roomId, room, partner: req.user });
      }
      io.to(`user:${userId}`).emit('duo:connected', { roomId, room, partner: { id: hostId } });
    }

    return res.json({
      success: true,
      message: 'Connected to Duo Room successfully!',
      room,
      members
    });
  } catch (err) {
    console.error('[Join Room] Error:', err);
    return res.status(500).json({ error: 'Failed to join room. Please check code and try again.' });
  }
});

// Leave / Reset Room (Reliable Disconnect)
router.post('/remove', requireAuth, (req, res) => {
  const userId = req.user.id;

  // Find all rooms this user is in
  const memberRecords = db.prepare(`
    SELECT room_id FROM room_members WHERE user_id = ?
  `).all(userId);

  const roomIds = memberRecords.map(r => r.room_id);

  // Remove user from room members
  db.prepare('DELETE FROM room_members WHERE user_id = ?').run(userId);
  removeRoomMember(userId);

  // Remove duo partnerships
  try {
    db.prepare('DELETE FROM duo_partnerships WHERE user_a_id = ? OR user_b_id = ?').run(userId, userId);
  } catch (err) {}

  const io = req.app.get('io');

  // Deactivate empty or solo rooms and notify
  roomIds.forEach(roomId => {
    const remaining = db.prepare('SELECT COUNT(*) as count FROM room_members WHERE room_id = ?').get(roomId).count;
    if (remaining <= 1) {
      db.prepare('UPDATE rooms SET is_active = 0 WHERE id = ?').run(roomId);
    }
    if (io) {
      io.to(roomId).emit('duo:partner_removed');
    }
  });

  if (io) {
    io.to(`user:${userId}`).emit('duo:partner_removed');
  }

  res.json({ success: true, message: 'Disconnected from room successfully' });
});

// Restore / Sync Room from Client Backup (Guarantees room never disconnects)
router.post('/sync-room', requireAuth, (req, res) => {
  try {
    const { roomId, roomCode, roomName, hostId, partnerId } = req.body || {};
    const userId = req.user.id;
    if (!roomId) {
      return res.status(400).json({ error: 'Missing roomId' });
    }

    const now = new Date().toISOString();
    const finalCode = roomCode || `DUO-${uuidv4().slice(0, 4).toUpperCase()}`;
    const finalName = roomName || 'Duo Room';
    const finalHost = hostId || userId;

    db.prepare(`
      INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
      VALUES (?, ?, ?, '', ?, 1, ?)
    `).run(roomId, finalCode, finalName, finalHost, now);

    db.prepare(`
      INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
      VALUES (?, ?, ?, 'member', ?, ?, 'General', 'Duo Chat', 0, '')
    `).run('rm-' + uuidv4().slice(0, 8), roomId, userId, now, now);

    if (partnerId && partnerId !== userId) {
      db.prepare(`
        INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
        VALUES (?, ?, ?, 'member', ?, ?, 'General', 'Duo Chat', 0, '')
      `).run('rm-' + uuidv4().slice(0, 8), roomId, partnerId, now, now);

      saveRoomMember({ room_id: roomId, user_id: partnerId, role: 'member' });
    }

    saveRoom({ id: roomId, code: finalCode, name: finalName, created_by: finalHost, is_active: 1, created_at: now });
    saveRoomMember({ room_id: roomId, user_id: userId, role: 'member' });

    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    return res.json({ success: true, room });
  } catch (err) {
    console.error('[Sync Room] Error:', err);
    return res.status(500).json({ error: 'Failed to sync room' });
  }
});

module.exports = router;
