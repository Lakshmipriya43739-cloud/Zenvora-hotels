// Customer reservation routes for Zenvora hotel bookings.
//
// POST  /api/reservations          — create a new booking (requires auth)
// GET   /api/reservations/my       — list logged-in customer's bookings
// GET   /api/reservations/my/:id   — get details of a specific booking
// PATCH /api/reservations/my/:id/cancel — cancel a booking

const router = require('express').Router();
const controller = require('../controllers/reservations.controller');
const { requireAuth } = require('../middleware/auth');

// All customer reservation routes require authentication
router.post('/', requireAuth, controller.create);
router.get('/my', requireAuth, controller.getMyReservations);
router.get('/my/:id', requireAuth, controller.getMyReservationById);
router.patch('/my/:id/cancel', requireAuth, controller.cancelMyReservation);

module.exports = router;

