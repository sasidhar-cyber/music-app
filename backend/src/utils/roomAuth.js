const { db } = require('../db');
const { findRoomMembers, findRoomByCodeOrId } = require('../db/persistentStore');

function isRoomMember(roomId, userId) {
  if (!roomId || !userId) return false;
  const row = db.prepare(
    'SELECT id FROM room_members WHERE room_id = ? AND user_id = ?'
  ).get(roomId, userId);
  if (row) return true;
  const room = db.prepare(
    'SELECT id FROM rooms WHERE id = ? AND created_by = ?'
  ).get(roomId, userId);
  if (room) return true;

  // Check persistent store
  try {
    const savedMembers = findRoomMembers(roomId);
    const found = savedMembers.find(m => m.user_id === userId);
    if (found) {
      db.prepare(`
        INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(found.id, found.room_id, found.user_id, found.role || 'member', found.joined_at, found.last_seen, found.current_subject || 'General', found.current_topic || 'Duo Chat', found.is_studying || 0, found.study_started_at || '');
      return true;
    }
    const savedRoom = findRoomByCodeOrId(roomId);
    if (savedRoom && (savedRoom.created_by === userId || savedRoom.id === roomId)) {
      db.prepare(`
        INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
        VALUES (?, ?, ?, 'member', ?, ?, 'General', 'Duo Chat', 0, '')
      `).run('rm-' + Date.now().toString(36), roomId, userId, new Date().toISOString(), new Date().toISOString());
      return true;
    }
  } catch (e) {}

  return false;
}

function assertRoomMember(roomId, userId) {
  return isRoomMember(roomId, userId);
}

module.exports = { isRoomMember, assertRoomMember };
