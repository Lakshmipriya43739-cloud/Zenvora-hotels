// Auth routes: register, login, and /me (token refresh / session restore)
//
// POST /api/auth/register — creates a new 'client' account
// POST /api/auth/login    — authenticates any user and returns a JWT
// GET  /api/auth/me       — returns the current user (requires valid token)

const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 12;
const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Mint a JWT containing the user's public fields. */
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/** Strips sensitive fields before sending a user object to the client. */
function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    const errors = {};
    if (!name || name.trim().length < 2)       errors.name     = 'Name must be at least 2 characters.';
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email    = 'A valid email is required.';
    if (!password || password.length < 6)       errors.password = 'Password must be at least 6 characters.';
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed.', errors });
    }

    // Duplicate check
    const dup = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'client')
       RETURNING id, name, email, role`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = rows[0];

    // Automatically enroll new client into Zenvora Privilege Circle membership
    const membershipId = `ZNV-${new Date().getFullYear()}-${1000 + user.id}`;
    await pool.query(
      `INSERT INTO memberships (user_id, membership_id, membership_type, status)
       VALUES ($1, $2, 'Emerald Privilege', 'Active')
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, membershipId]
    );

    const token = signToken(user);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Email and password are required.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ── Me (session restore) ─────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) {
      return res.status(401).json({ message: 'User account not found.' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
