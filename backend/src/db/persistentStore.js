const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Store directory baked inside backend/src/db/store so it ships with the application image
const STORE_DIR = path.join(__dirname, 'store');
if (!fs.existsSync(STORE_DIR)) {
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  } catch (e) {}
}

const FALLBACK_DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(FALLBACK_DATA_DIR)) {
  try {
    fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
  } catch (e) {}
}

const USERS_FILE = path.join(STORE_DIR, 'persistent_users.json');
const ROOMS_FILE = path.join(STORE_DIR, 'persistent_rooms.json');
const MEMBERS_FILE = path.join(STORE_DIR, 'persistent_members.json');
const MESSAGES_FILE = path.join(STORE_DIR, 'persistent_messages.json');

function readJsonFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(`[PersistentStore] Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);

    // Also write a secondary copy to fallback data dir if possible
    try {
      const baseName = path.basename(filePath);
      const fallbackPath = path.join(FALLBACK_DATA_DIR, baseName);
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {}
  } catch (err) {
    console.warn(`[PersistentStore] Error writing ${filePath}:`, err.message);
  }
}

function getInitialUsers() {
  const defaultSalt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('123456', defaultSalt);
  const now = new Date().toISOString();

  return [
    {
      id: 'user-sasidhar-01',
      username: 'sasidhar',
      email: 'chethipattusasidharreddyy@gmail.com',
      password_hash: defaultHash,
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=sasidhar',
      bio: 'Permanent DuoCore Member',
      xp: 250,
      level: 2,
      streak: 5,
      sound_enabled: 1,
      motion_reduced: 0,
      theme: 'dark',
      phone_number: '',
      custom_wallpaper: '',
      read_receipts: 1,
      last_seen_privacy: 'everyone',
      notification_preferences: '{"sound":true,"studyPings":true,"motivational":true,"chat":true,"music":true,"partnerCalls":true}',
      last_active_date: now.split('T')[0],
      created_at: now
    }
  ];
}

function saveUser(user) {
  if (!user || !user.id) return;
  const users = readJsonFile(USERS_FILE, getInitialUsers());
  const index = users.findIndex(u =>
    u.id === user.id ||
    u.email.toLowerCase() === (user.email || '').toLowerCase() ||
    u.username.toLowerCase() === (user.username || '').toLowerCase()
  );

  const record = {
    id: user.id,
    username: user.username,
    email: user.email,
    password_hash: user.password_hash || (index >= 0 ? users[index].password_hash : ''),
    avatar_url: user.avatar_url || '',
    bio: user.bio || 'DuoCore Member',
    xp: user.xp || 100,
    level: user.level || 1,
    streak: user.streak || 1,
    sound_enabled: user.sound_enabled ?? 1,
    motion_reduced: user.motion_reduced ?? 0,
    theme: user.theme || 'dark',
    phone_number: user.phone_number || '',
    custom_wallpaper: user.custom_wallpaper || '',
    read_receipts: user.read_receipts ?? 1,
    last_seen_privacy: user.last_seen_privacy || 'everyone',
    notification_preferences: typeof user.notification_preferences === 'object'
      ? JSON.stringify(user.notification_preferences)
      : (user.notification_preferences || '{}'),
    last_active_date: user.last_active_date || new Date().toISOString().split('T')[0],
    created_at: user.created_at || new Date().toISOString()
  };

  if (index >= 0) {
    users[index] = { ...users[index], ...record };
  } else {
    users.push(record);
  }
  writeJsonFile(USERS_FILE, users);
}

function findUserByEmailOrUsername(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();
  const users = readJsonFile(USERS_FILE, getInitialUsers());
  return users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) || null;
}

function findUserById(id) {
  if (!id) return null;
  const users = readJsonFile(USERS_FILE, getInitialUsers());
  return users.find(u => u.id === id) || null;
}

function saveRoom(room) {
  if (!room || !room.id) return;
  const rooms = readJsonFile(ROOMS_FILE, []);
  const idx = rooms.findIndex(r => r.id === room.id || r.code === room.code);
  const record = {
    id: room.id,
    code: room.code,
    name: room.name || 'Duo Room',
    passcode_hash: room.passcode_hash || '',
    created_by: room.created_by || '',
    is_active: room.is_active ?? 1,
    created_at: room.created_at || new Date().toISOString()
  };

  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], ...record };
  } else {
    rooms.push(record);
  }
  writeJsonFile(ROOMS_FILE, rooms);
}

function findRoomByCodeOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toUpperCase();
  const rooms = readJsonFile(ROOMS_FILE, []);
  return rooms.find(r => r.id === identifier || r.code.toUpperCase() === clean) || null;
}

function saveRoomMember(member) {
  if (!member || !member.room_id || !member.user_id) return;
  const members = readJsonFile(MEMBERS_FILE, []);
  const idx = members.findIndex(m => m.room_id === member.room_id && m.user_id === member.user_id);
  const record = {
    id: member.id || `rm-${member.room_id.slice(-4)}-${member.user_id.slice(-4)}`,
    room_id: member.room_id,
    user_id: member.user_id,
    role: member.role || 'member',
    joined_at: member.joined_at || new Date().toISOString(),
    last_seen: member.last_seen || new Date().toISOString(),
    current_subject: member.current_subject || 'General',
    current_topic: member.current_topic || 'Duo Chat',
    is_studying: member.is_studying || 0,
    study_started_at: member.study_started_at || ''
  };

  if (idx >= 0) {
    members[idx] = { ...members[idx], ...record };
  } else {
    members.push(record);
  }
  writeJsonFile(MEMBERS_FILE, members);
}

function findRoomMembers(roomId) {
  if (!roomId) return [];
  const members = readJsonFile(MEMBERS_FILE, []);
  return members.filter(m => m.room_id === roomId);
}

function removeRoomMember(userId, roomId) {
  let members = readJsonFile(MEMBERS_FILE, []);
  if (roomId) {
    members = members.filter(m => !(m.user_id === userId && m.room_id === roomId));
  } else {
    members = members.filter(m => m.user_id !== userId);
  }
  writeJsonFile(MEMBERS_FILE, members);
}

function saveMessage(msg) {
  if (!msg || !msg.id || !msg.room_id) return;
  const messages = readJsonFile(MESSAGES_FILE, []);
  const idx = messages.findIndex(m => m.id === msg.id);
  const record = {
    id: msg.id,
    room_id: msg.room_id,
    sender_id: msg.sender_id,
    username: msg.username || '',
    avatar_url: msg.avatar_url || '',
    text: msg.text || '',
    type: msg.type || 'text',
    channel_type: msg.channel_type || 'normal',
    metadata: typeof msg.metadata === 'object' ? JSON.stringify(msg.metadata) : (msg.metadata || '{}'),
    reply_to_id: msg.reply_to_id || null,
    is_read: msg.is_read || 0,
    is_deleted: msg.is_deleted || 0,
    created_at: msg.created_at || new Date().toISOString()
  };

  if (idx >= 0) {
    messages[idx] = { ...messages[idx], ...record };
  } else {
    messages.push(record);
  }

  // Keep last 1000 messages total to prevent unbounded growth
  if (messages.length > 1000) {
    messages.splice(0, messages.length - 1000);
  }

  writeJsonFile(MESSAGES_FILE, messages);
}

function getRoomMessages(roomId, channel = 'normal') {
  if (!roomId) return [];
  const messages = readJsonFile(MESSAGES_FILE, []);
  return messages.filter(m => m.room_id === roomId && (m.channel_type || 'normal') === channel && !m.is_deleted);
}

function restoreAllToDb(db) {
  try {
    // 1. Restore Users
    const users = readJsonFile(USERS_FILE, getInitialUsers());
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (
        id, username, email, password_hash, avatar_url, bio, xp, level, streak,
        last_active_date, sound_enabled, motion_reduced, theme, phone_number,
        custom_wallpaper, read_receipts, last_seen_privacy, notification_preferences, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of users) {
      insertUser.run(
        u.id,
        u.username,
        u.email,
        u.password_hash,
        u.avatar_url || '',
        u.bio || 'DuoCore Member',
        u.xp || 100,
        u.level || 1,
        u.streak || 1,
        u.last_active_date || '',
        u.sound_enabled ?? 1,
        u.motion_reduced ?? 0,
        u.theme || 'dark',
        u.phone_number || '',
        u.custom_wallpaper || '',
        u.read_receipts ?? 1,
        u.last_seen_privacy || 'everyone',
        typeof u.notification_preferences === 'object' ? JSON.stringify(u.notification_preferences) : (u.notification_preferences || '{}'),
        u.created_at || new Date().toISOString()
      );
    }
    console.log(`[PersistentStore] Restored ${users.length} permanent user accounts to SQLite.`);

    // 2. Restore Rooms
    const rooms = readJsonFile(ROOMS_FILE, []);
    const insertRoom = db.prepare(`
      INSERT OR REPLACE INTO rooms (id, code, name, passcode_hash, created_by, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of rooms) {
      insertRoom.run(
        r.id,
        r.code,
        r.name,
        r.passcode_hash || '',
        r.created_by,
        r.is_active ?? 1,
        r.created_at || new Date().toISOString()
      );
    }

    // 3. Restore Members
    const members = readJsonFile(MEMBERS_FILE, []);
    const insertMember = db.prepare(`
      INSERT OR REPLACE INTO room_members (id, room_id, user_id, role, joined_at, last_seen, current_subject, current_topic, is_studying, study_started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of members) {
      insertMember.run(
        m.id || `rm-${m.room_id.slice(-4)}-${m.user_id.slice(-4)}`,
        m.room_id,
        m.user_id,
        m.role || 'member',
        m.joined_at || new Date().toISOString(),
        m.last_seen || new Date().toISOString(),
        m.current_subject || 'General',
        m.current_topic || 'Duo Chat',
        m.is_studying || 0,
        m.study_started_at || ''
      );
    }

    // 4. Restore Messages
    const messages = readJsonFile(MESSAGES_FILE, []);
    const insertMsg = db.prepare(`
      INSERT OR REPLACE INTO messages (
        id, room_id, sender_id, text, type, channel_type, metadata, reply_to_id, is_read, is_deleted, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const msg of messages) {
      insertMsg.run(
        msg.id,
        msg.room_id,
        msg.sender_id,
        msg.text || '',
        msg.type || 'text',
        msg.channel_type || 'normal',
        typeof msg.metadata === 'object' ? JSON.stringify(msg.metadata) : (msg.metadata || '{}'),
        msg.reply_to_id || null,
        msg.is_read || 0,
        msg.is_deleted || 0,
        msg.created_at || new Date().toISOString()
      );
    }
    console.log(`[PersistentStore] Restored ${messages.length} permanent messages to SQLite.`);
  } catch (err) {
    console.error('[PersistentStore] Error restoring data:', err);
  }
}

module.exports = {
  saveUser,
  findUserByEmailOrUsername,
  findUserById,
  saveRoom,
  findRoomByCodeOrId,
  saveRoomMember,
  findRoomMembers,
  removeRoomMember,
  saveMessage,
  getRoomMessages,
  restoreAllToDb
};
