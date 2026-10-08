const express = require('express');
const router = express.Router();
const recyclingController = require('../controllers/recyclingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET all nearby centers or filtered centers
router.get('/', recyclingController.getCenters);

// POST a new center (Optional utility)
router.post('/', protect, authorize('admin'), recyclingController.createCenter);

module.exports = router;
