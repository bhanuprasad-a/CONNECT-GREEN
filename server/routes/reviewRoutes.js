const express = require('express');
const router = express.Router();
const { getReviewsByBusiness, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview);

router.route('/:businessId')
    .get(getReviewsByBusiness);

router.route('/:id')
    .delete(protect, deleteReview);

module.exports = router;
