const express = require('express');
const router = express.Router();
const { applySiteManager, getRequests, updateRequestStatus } = require('../controllers/siteManagerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin'), getRequests)
    .post(protect, applySiteManager);

router.route('/:id/status')
    .put(protect, authorize('admin'), updateRequestStatus);

module.exports = router;
