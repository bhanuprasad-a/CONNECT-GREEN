const express = require('express');
const router = express.Router();
const { getSites, createSite, updateVisitorCount } = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSites)
    .post(protect, authorize('siteManager', 'admin'), createSite);

router.route('/:id/visitors')
    .put(protect, authorize('siteManager', 'admin'), updateVisitorCount);

module.exports = router;
