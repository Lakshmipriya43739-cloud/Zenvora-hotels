// Reservations controller for Zenvora luxury hotel bookings.
// Uses parameterized SQL queries with pg pool (no ORM).

const { q, pool } = require('../db/pool');

/**
 * Generate a unique luxury reservation reference: ZNV-BK-XXXXX
 */
function generateBookingReference() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const suffix = Date.now().toString().slice(-4);
  return `ZNV-BK-${rand}-${suffix}`;
}

/**
 * POST /api/reservations
 * Creates a new reservation for the authenticated user.
 */
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      hotel_id,
      check_in,
      check_out,
      guests = '2 Guests',
      room_type = 'Deluxe Room',
      guest_name,
      guest_email,
      special_requests = '',
    } = req.body;

    // Validate hotel_id
    const parsedHotelId = parseInt(hotel_id, 10);
    if (!parsedHotelId || isNaN(parsedHotelId)) {
      return res.status(400).json({ message: 'A valid hotel is required.' });
    }

    // Validate guest info
    if (!guest_name || typeof guest_name !== 'string' || !guest_name.trim()) {
      return res.status(400).json({ message: 'Guest full name is required.' });
    }
    if (!guest_email || typeof guest_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email.trim())) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    // Validate dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(check_in) || !dateRegex.test(check_out)) {
      return res.status(400).json({ message: 'Check-in and check-out dates must be in YYYY-MM-DD format.' });
    }

    const inDate = new Date(`${check_in}T00:00:00Z`);
    const outDate = new Date(`${check_out}T00:00:00Z`);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return res.status(400).json({ message: 'Invalid reservation dates provided.' });
    }

    const diffDays = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return res.status(400).json({ message: 'Check-out date must be at least one day after check-in date.' });
    }

    // Fetch hotel to verify existence and calculate authoritative server price
    const hotelRows = await q(
      'SELECT id, title, description, price, image_url FROM hotels WHERE id = $1',
      [parsedHotelId]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    const hotel = hotelRows[0];
    const nights = diffDays;
    const totalAmount = (nights * Number(hotel.price)).toFixed(2);

    let bookingReference = generateBookingReference();
    // In rare case of collision, generate new reference
    let attempts = 0;
    while (attempts < 5) {
      const existing = await q('SELECT id FROM reservations WHERE booking_reference = $1', [bookingReference]);
      if (existing.length === 0) break;
      bookingReference = generateBookingReference();
      attempts++;
    }

    const insertSql = `
      INSERT INTO reservations (
        booking_reference,
        user_id,
        hotel_id,
        check_in,
        check_out,
        guests,
        room_type,
        guest_name,
        guest_email,
        total_amount,
        status,
        special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending', $11)
      RETURNING *
    `;

    const values = [
      bookingReference,
      userId,
      hotel.id,
      check_in,
      check_out,
      guests.trim() || '2 Guests',
      room_type.trim() || 'Deluxe Room',
      guest_name.trim(),
      guest_email.trim().toLowerCase(),
      totalAmount,
      special_requests ? special_requests.trim() : null,
    ];

    const result = await q(insertSql, values);
    const reservation = result[0];

    return res.status(201).json({
      message: 'Reservation booked successfully.',
      reservation: {
        ...reservation,
        nights,
        hotel: {
          id: hotel.id,
          title: hotel.title,
          image_url: hotel.image_url,
          description: hotel.description,
          price: hotel.price,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reservations/my
 * Returns all reservations for the logged-in customer.
 */
exports.getMyReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT 
        r.id,
        r.booking_reference,
        r.user_id,
        r.hotel_id,
        r.check_in,
        r.check_out,
        r.guests,
        r.room_type,
        r.guest_name,
        r.guest_email,
        r.total_amount,
        r.status,
        r.special_requests,
        r.created_at,
        r.updated_at,
        h.title AS hotel_title,
        h.image_url AS hotel_image_url,
        h.description AS hotel_description,
        h.price AS hotel_price
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;

    const rows = await q(query, [userId]);
    res.json({ reservations: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reservations/my/:id
 * Returns a single reservation for the logged-in customer.
 */
exports.getMyReservationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reservationId = parseInt(req.params.id, 10);

    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Invalid reservation ID.' });
    }

    const query = `
      SELECT 
        r.id,
        r.booking_reference,
        r.user_id,
        r.hotel_id,
        r.check_in,
        r.check_out,
        r.guests,
        r.room_type,
        r.guest_name,
        r.guest_email,
        r.total_amount,
        r.status,
        r.special_requests,
        r.created_at,
        r.updated_at,
        h.title AS hotel_title,
        h.image_url AS hotel_image_url,
        h.description AS hotel_description,
        h.price AS hotel_price,
        h.latitude AS hotel_latitude,
        h.longitude AS hotel_longitude
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const rows = await q(query, [reservationId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or access denied.' });
    }

    res.json({ reservation: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reservations/my/:id/cancel
 * Cancels a reservation if it belongs to the user and is Pending or Confirmed.
 */
exports.cancelMyReservation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reservationId = parseInt(req.params.id, 10);

    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Invalid reservation ID.' });
    }

    const checkRows = await q(
      'SELECT id, status, booking_reference FROM reservations WHERE id = $1 AND user_id = $2',
      [reservationId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found or access denied.' });
    }

    const booking = checkRows[0];

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'This reservation is already cancelled.' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ message: 'Completed reservations cannot be cancelled.' });
    }

    const updateSql = `
      UPDATE reservations
      SET status = 'Cancelled', updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await q(updateSql, [reservationId, userId]);
    res.json({
      message: 'Reservation cancelled successfully.',
      reservation: result[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/reservations
 * Admin: list all reservations with optional search and status filter.
 */
exports.adminListAll = async (req, res, next) => {
  try {
    const { q: searchTerm, status } = req.query;

    const filters = [];
    const params = [];

    if (searchTerm && searchTerm.trim()) {
      params.push(`%${searchTerm.trim()}%`);
      const pIdx = `$${params.length}`;
      filters.push(`(
        r.booking_reference ILIKE ${pIdx} OR
        r.guest_name ILIKE ${pIdx} OR
        r.guest_email ILIKE ${pIdx} OR
        h.title ILIKE ${pIdx}
      )`);
    }

    if (status && status.trim() && ['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status.trim())) {
      params.push(status.trim());
      filters.push(`r.status = $${params.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT 
        r.id,
        r.booking_reference,
        r.user_id,
        r.hotel_id,
        r.check_in,
        r.check_out,
        r.guests,
        r.room_type,
        r.guest_name,
        r.guest_email,
        r.total_amount,
        r.status,
        r.special_requests,
        r.created_at,
        r.updated_at,
        u.name AS user_name,
        u.email AS user_account_email,
        h.title AS hotel_title,
        h.image_url AS hotel_image_url,
        h.price AS hotel_price
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const rows = await q(query, params);
    res.json({ reservations: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/reservations/:id
 * Admin: get full details of any reservation.
 */
exports.adminGetById = async (req, res, next) => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Invalid reservation ID.' });
    }

    const query = `
      SELECT 
        r.*,
        u.name AS user_name,
        u.email AS user_account_email,
        h.title AS hotel_title,
        h.image_url AS hotel_image_url,
        h.description AS hotel_description,
        h.price AS hotel_price,
        h.latitude AS hotel_latitude,
        h.longitude AS hotel_longitude
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.id = $1
    `;

    const rows = await q(query, [reservationId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.json({ reservation: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/reservations/:id/status
 * Admin: update reservation status.
 */
exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Invalid reservation ID.' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updateSql = `
      UPDATE reservations
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await q(updateSql, [status, reservationId]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.json({
      message: `Reservation status updated to ${status}.`,
      reservation: result[0],
    });
  } catch (err) {
    next(err);
  }
};

