const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { findUserById, findUserByEmailOrUsername } = require('../db/persistentStore');

const JWT_SECRET = process.env.JWT_SECRET || 'duocore_jwt_super_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  let user = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(decoded.id);
  if (!user) {
    // Try to auto-restore from persistent store
    const saved = findUserById(decoded.id) || (decoded.email ? findUserByEmailOrUsername(decoded.email) : null) || (decoded.username ? findUserByEmailOrUsername(decoded.username) : null);
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
      user = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(saved.id);
    } else if (decoded.username && decoded.email) {
      // Re-seed from JWT claims
      const now = new Date().toISOString();
      db.prepare(`
        INSERT OR IGNORE INTO users (id, username, email, password_hash, avatar_url, bio, xp, level, streak, last_active_date, created_at)
        VALUES (?, ?, ?, 'restored_session_hash', ?, 'DuoCore Member', 100, 1, 1, ?, ?)
      `).run(
        decoded.id, decoded.username, decoded.email,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(decoded.username)}`,
        now.split('T')[0], now
      );
      user = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(decoded.id);
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found in system.' });
  }

  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    req.user = null;
    return next();
  }

  const user = db.prepare('SELECT id, username, email, avatar_url, bio, xp, level, streak, sound_enabled, motion_reduced, theme FROM users WHERE id = ?').get(decoded.id);
  req.user = user || null;
  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth
};
