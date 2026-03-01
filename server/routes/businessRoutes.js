const express = require('express');
const router = express.Router();
const { getBusinesses, getBusinessById, createBusiness, updateBusiness, deleteBusiness, updateBadgeStatus } = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getBusinesses)
    .post(protect, authorize('business', 'admin'), upload.single('image'), createBusiness);

router.route('/:id')
    .get(getBusinessById)
    .put(protect, authorize('business', 'admin'), upload.single('image'), updateBusiness)
    .delete(protect, authorize('admin'), deleteBusiness);

router.route('/:id/badge')
    .put(protect, authorize('admin'), updateBadgeStatus);

module.exports = router;
