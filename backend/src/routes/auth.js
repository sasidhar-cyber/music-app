const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { generateToken, requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { saveUser, findUserByEmailOrUsername, findUserById } = require('../db/persistentStore');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Guest Auto-Login (Collision-free session for 1v1 rooms)
router.post('/guest', (req, res) => {
  try {
    const guestId = 'user-' + uuidv4().slice(0, 8);
    const guestName = 'User_' + uuidv4().slice(0, 6);
    const guestEmail = `${guestName.toLowerCase()}@soundwave.local`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, avatar_url, bio, xp, level, streak, last_active_date, created_at)
      VALUES (?, ?, ?, 'guest_pass', '', 'Duo Chat User', 100, 1, 1, ?, ?)
    `).run(guestId, guestName, guestEmail, now.split('T')[0], now);

    const newUser = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(guestId);
    saveUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (err) {
    console.error('[Auth Guest] Error:', err);
    res.status(500).json({ error: 'Failed to initialize session' });
  }
});

// Register
router.post('/register', authLimiter, (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUsername = String(username).trim();

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@domain.com).' });
  }
  if (cleanUsername.length < 2 || cleanUsername.length > 30) {
    return res.status(400).json({ error: 'Username must be between 2 and 30 characters.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  let existing = db.prepare('SELECT id, username, email FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanUsername.toLowerCase(), cleanEmail);
  if (!existing) {
    const saved = findUserByEmailOrUsername(cleanEmail) || findUserByEmailOrUsername(cleanUsername);
    if (saved) existing = saved;
  }

  if (existing) {
    if (existing.email.toLowerCase() === cleanEmail) {
      return res.status(409).json({ error: 'Email address already registered. Please log in.' });
    }
    return res.status(409).json({ error: 'Username already in use. Please pick another one.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const id = 'user-' + uuidv4().slice(0, 8);
  const now = new Date().toISOString();
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, avatar_url, bio, xp, level, streak, last_active_date, created_at)
    VALUES (?, ?, ?, ?, ?, 'Ready to study with DUOCORE', 100, 1, 1, ?, ?)
  `).run(id, cleanUsername, cleanEmail, hash, avatar, now.split('T')[0], now);

  const newUser = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(id);
  saveUser({
    ...newUser,
    password_hash: hash
  });

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: newUser
  });
});

// Login
router.post('/login', authLimiter, (req, res) => {
  const target = String(req.body.usernameOrEmail || req.body.username || req.body.email || '').trim();
  const password = req.body.password;

  if (!target || !password) {
    return res.status(400).json({ error: 'Please enter your username/email and password.' });
  }

  const cleanTarget = target.toLowerCase();
  let user = db.prepare('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanTarget, cleanTarget);

  // Auto-restore from permanent store if not present in active SQLite DB
  if (!user) {
    const saved = findUserByEmailOrUsername(cleanTarget);
    if (saved) {
      db.prepare(`
        INSERT OR REPLACE INTO users (
          id, username, email, password_hash, avatar_url, bio, xp, level, streak,
          last_active_date, sound_enabled, motion_reduced, theme, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        saved.id, saved.username, saved.email, saved.password_hash,
        saved.avatar_url || '', saved.bio || 'DuoCore Member', saved.xp || 100,
        saved.level || 1, saved.streak || 1, saved.last_active_date || '',
        saved.sound_enabled ?? 1, saved.motion_reduced ?? 0, saved.theme || 'dark',
        saved.created_at || new Date().toISOString()
      );
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(saved.id);
    }
  }

  if (!user) {
    // If the server restarted and the account wasn't found in memory, automatically restore or create it
    if (password && String(password).length >= 6) {
      const isEmail = EMAIL_REGEX.test(cleanTarget);
      const cleanUsername = isEmail ? cleanTarget.split('@')[0] : target.trim();
      const cleanEmail = isEmail ? cleanTarget : `${cleanUsername.toLowerCase()}@duocore.local`;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const id = 'user-' + uuidv4().slice(0, 8);
      const now = new Date().toISOString();
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

      db.prepare(`
        INSERT OR REPLACE INTO users (
          id, username, email, password_hash, avatar_url, bio, xp, level, streak,
          last_active_date, sound_enabled, motion_reduced, theme, created_at
        ) VALUES (?, ?, ?, ?, ?, 'Permanent DuoCore Member', 100, 1, 1, ?, 1, 0, 'dark', ?)
      `).run(id, cleanUsername, cleanEmail, hash, avatar, now.split('T')[0], now);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      saveUser({ ...user, password_hash: hash });
    } else {
      return res.status(401).json({ error: 'User account not found. Please verify username/password or click Create Account.' });
    }
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  const today = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE users SET last_active_date = ? WHERE id = ?').run(today, user.id);

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    bio: user.bio,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    sound_enabled: user.sound_enabled,
    motion_reduced: user.motion_reduced,
    theme: user.theme
  };

  saveUser(user);

  const token = generateToken(safeUser);
  res.json({
    message: 'Logged in successfully',
    token,
    user: safeUser
  });
});

// Demo Login
router.post('/demo-login', (req, res) => {
  const { role } = req.body;
  const targetUsername = role === 'sam' ? 'Sam' : 'Alex';
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(targetUsername);

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found.' });
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    bio: user.bio,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    sound_enabled: user.sound_enabled,
    motion_reduced: user.motion_reduced,
    theme: user.theme
  };

  const token = generateToken(safeUser);
  res.json({
    message: `Logged in as demo user ${targetUsername}`,
    token,
    user: safeUser
  });
});

// Current User Profile
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, phone_number, avatar_url, bio, xp, level, streak,
           sound_enabled, motion_reduced, theme, custom_wallpaper, read_receipts, last_seen_privacy, notification_preferences, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);
  res.json({ user: user || req.user });
});

// Update Profile & WhatsApp-style App Settings
router.patch('/profile', requireAuth, (req, res) => handleProfileUpdate(req, res));
router.put('/profile', requireAuth, (req, res) => handleProfileUpdate(req, res));

function handleProfileUpdate(req, res) {
  const { username, bio, avatar_url, phone_number, theme, custom_wallpaper, read_receipts, last_seen_privacy, sound_enabled, notification_preferences } = req.body;
  
  if (username && (username.trim().length < 2 || username.trim().length > 30)) {
    return res.status(400).json({ error: 'Username must be between 2 and 30 characters.' });
  }

  if (username && username.trim() !== req.user.username) {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(username.trim(), req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken by another user.' });
    }
  }

  const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const newUsername = username ? username.trim() : currentUser.username;
  const newBio = bio !== undefined ? bio.trim() : currentUser.bio;
  const newAvatar = avatar_url || currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUsername)}`;
  const newPhone = phone_number !== undefined ? String(phone_number).trim() : (currentUser.phone_number || '');
  const newTheme = theme || currentUser.theme || 'dark';
  const newWallpaper = custom_wallpaper !== undefined ? custom_wallpaper : (currentUser.custom_wallpaper || '');
  const newReadReceipts = read_receipts !== undefined ? (read_receipts ? 1 : 0) : (currentUser.read_receipts ?? 1);
  const newLastSeenPrivacy = last_seen_privacy || currentUser.last_seen_privacy || 'everyone';
  const newSoundEnabled = sound_enabled !== undefined ? (sound_enabled ? 1 : 0) : (currentUser.sound_enabled ?? 0);
  const newNotifPrefs = notification_preferences !== undefined
    ? (typeof notification_preferences === 'object' ? JSON.stringify(notification_preferences) : String(notification_preferences))
    : (currentUser.notification_preferences || '{"enabled":true,"messages":true,"calls":true,"sound":true}');

  db.prepare(`
    UPDATE users
    SET username = ?, bio = ?, avatar_url = ?, phone_number = ?, theme = ?,
        custom_wallpaper = ?, read_receipts = ?, last_seen_privacy = ?, sound_enabled = ?, notification_preferences = ?
    WHERE id = ?
  `).run(newUsername, newBio, newAvatar, newPhone, newTheme, newWallpaper, newReadReceipts, newLastSeenPrivacy, newSoundEnabled, newNotifPrefs, req.user.id);

  const updatedUser = db.prepare(`
    SELECT id, username, email, phone_number, avatar_url, bio, xp, level, streak,
           sound_enabled, motion_reduced, theme, custom_wallpaper, read_receipts, last_seen_privacy, notification_preferences
    FROM users WHERE id = ?
  `).get(req.user.id);
  
  saveUser(updatedUser);
  const token = generateToken(updatedUser);

  res.json({
    message: 'Profile & Settings updated successfully',
    token,
    user: updatedUser
  });
}

// Change Password
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password does not match.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
  saveUser({
    ...user,
    password_hash: newHash
  });

  res.json({ message: 'Password changed successfully! You can now log in with your new password.' });
});

// Sync / Restore Account from Client Backup (Guarantees permanence)
router.post('/sync-account', (req, res) => {
  try {
    const { id, username, email, password, avatar_url, bio } = req.body || {};
    if (!username && !email) {
      return res.status(400).json({ error: 'Missing account identifiers' });
    }

    const cleanUsername = String(username || email.split('@')[0]).trim();
    const cleanEmail = String(email || `${cleanUsername}@duocore.local`).trim().toLowerCase();

    let user = db.prepare('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanUsername.toLowerCase(), cleanEmail);
    if (!user) {
      const saved = findUserByEmailOrUsername(cleanEmail) || findUserByEmailOrUsername(cleanUsername);
      if (saved) {
        user = saved;
      }
    }

    const now = new Date().toISOString();
    const finalId = user?.id || id || ('user-' + uuidv4().slice(0, 8));
    const finalHash = user?.password_hash || (password ? bcrypt.hashSync(password, 10) : 'synced_account_pass');
    const finalAvatar = avatar_url || user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    db.prepare(`
      INSERT OR REPLACE INTO users (
        id, username, email, password_hash, avatar_url, bio, xp, level, streak,
        last_active_date, sound_enabled, motion_reduced, theme, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finalId, cleanUsername, cleanEmail, finalHash, finalAvatar,
      bio || user?.bio || 'DuoCore Member', user?.xp || 100, user?.level || 1, user?.streak || 1,
      now.split('T')[0], user?.sound_enabled ?? 1, user?.motion_reduced ?? 0, user?.theme || 'dark',
      user?.created_at || now
    );

    const activeUser = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(finalId);
    saveUser({
      ...activeUser,
      password_hash: finalHash
    });

    const token = generateToken(activeUser);
    return res.json({
      success: true,
      token,
      user: activeUser
    });
  } catch (err) {
    console.error('[Auth Sync] Error:', err);
    return res.status(500).json({ error: 'Failed to sync account' });
  }
});

module.exports = router;
