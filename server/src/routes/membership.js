// Membership routes for Zenvora Privilege Circle
//
// GET /api/membership/me — retrieves the authenticated client's own membership card and benefits

const router = require('express').Router();
const { pool } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const MEMBERSHIP_BENEFITS = [
  {
    icon: '👑',
    title: 'Complimentary Room Upgrades',
    desc: 'Automatic upgrade to the next suite category upon arrival, subject to availability.',
  },
  {
    icon: '⏰',
    title: 'Flexible Arrival & Late Check-out',
    desc: 'Priority early check-in from 10:00 AM and relaxed late check-out until 4:00 PM.',
  },
  {
    icon: '✨',
    title: 'Signature Jiva Spa Savings',
    desc: '20% privilege savings on traditional Ayurvedic wellness, hydrotherapy, and massages.',
  },
  {
    icon: '🍷',
    title: 'Curated Fine Dining Privileges',
    desc: 'Preferred dining reservations with 15% savings across all signature Zenvora restaurants.',
  },
  {
    icon: '🚘',
    title: 'Chauffeured Airport Transfers',
    desc: 'Complimentary one-way luxury limousine transfer on reservations of 2 or more nights.',
  },
  {
    icon: '🛎️',
    title: 'Dedicated 24/7 Royal Concierge',
    desc: 'Direct hotline to your personal concierge for bespoke city excursions and private dining.',
  },
];

/**
 * Ensures a membership record exists for the user and returns it.
 */
async function getOrCreateMembership(userId, userRole) {
  const query = `
    SELECT m.id, m.user_id, m.membership_id, m.membership_type, m.status, m.joined_at,
           u.name AS member_name, u.email
    FROM memberships m
    JOIN users u ON u.id = m.user_id
    WHERE m.user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  if (rows.length > 0) {
    return rows[0];
  }

  // Safe fallback if user registered before membership table was added
  const defaultType = userRole === 'admin' ? 'Royal Sovereign' : 'Emerald Privilege';
  const newMembershipId = `ZNV-${new Date().getFullYear()}-${1000 + Number(userId)}`;

  const insertQuery = `
    INSERT INTO memberships (user_id, membership_id, membership_type, status)
    VALUES ($1, $2, $3, 'Active')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id, user_id, membership_id, membership_type, status, joined_at
  `;
  await pool.query(insertQuery, [userId, newMembershipId, defaultType]);

  const refreshed = await pool.query(query, [userId]);
  return refreshed.rows[0];
}

// ── GET /api/membership/me ──────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const membership = await getOrCreateMembership(req.user.id, req.user.role);
    if (!membership) {
      return res.status(404).json({ message: 'Membership record not found.' });
    }

    res.json({
      membership: {
        ...membership,
        benefits: MEMBERSHIP_BENEFITS,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

