const express = require('express');
const router = express.Router();
const { getOffsets, createOffset, purchaseOffset, getMyOffsetHistory } = require('../controllers/offsetController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getOffsets);
router.post('/', protect, authorize('admin'), createOffset);
router.post('/purchase', protect, purchaseOffset);
router.get('/my-history', protect, getMyOffsetHistory);

module.exports = router;
