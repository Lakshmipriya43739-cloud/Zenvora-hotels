// Admin reservation routes for Zenvora luxury management.
//
// GET   /api/admin/reservations         — list all reservations with search & status filters
// GET   /api/admin/reservations/:id     — get full details of a specific reservation
// PATCH /api/admin/reservations/:id/status — update status (Pending, Confirmed, Cancelled, Completed)

const router = require('express').Router();
const controller = require('../controllers/reservations.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require both authentication and admin role
router.use(requireAuth, requireAdmin);

router.get('/', controller.adminListAll);
router.get('/:id', controller.adminGetById);
router.patch('/:id/status', controller.adminUpdateStatus);

module.exports = router;

