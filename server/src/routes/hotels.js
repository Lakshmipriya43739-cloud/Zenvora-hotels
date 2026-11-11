const router = require('express').Router();
const controller = require('../controllers/hotels.controller');
const upload = require('../middleware/upload');
const { validateHotelPayload } = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public — anyone (including guests) can browse.
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Protected — only authenticated Admins may create, update, or delete.
router.post('/', requireAuth, requireAdmin, upload.single('image'), validateHotelPayload(true), controller.create);
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), validateHotelPayload(false), controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

module.exports = router;
