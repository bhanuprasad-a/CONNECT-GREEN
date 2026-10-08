const mongoose = require('mongoose');
const Review = require('../models/Review');
const Business = require('../models/Business');
const { respondWithApiError } = require('../utils/apiError');

// Helper to compute average rating inside MongoDB via aggregation (no full collection memory dump)
const updateBusinessAverageRating = async (businessId) => {
    try {
        const stats = await Review.aggregate([
            { $match: { business: new mongoose.Types.ObjectId(businessId) } },
            {
                $group: {
                    _id: '$business',
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 5;
        await Business.findByIdAndUpdate(businessId, { avgRating });
    } catch (err) {
        console.error('Error updating business rating average:', err);
    }
};

const getReviewsByBusiness = async (req, res) => {
    try {
        const reviews = await Review.find({ business: req.params.businessId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json(reviews);
    } catch (error) {
        respondWithApiError(res, error, 'review.list');
    }
};

const createReview = async (req, res) => {
    try {
        const { businessId, rating, comment } = req.body;
        const business = businessId;
        if (!mongoose.isValidObjectId(business)) {
            return res.status(400).json({ message: 'Invalid business ID' });
        }
        if (!await Business.exists({ _id: business })) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            business
        }).lean();

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this business' });
        }

        const review = new Review({
            user: req.user._id,
            business,
            rating,
            comment
        });

        await review.save();

        // Update Business Average Rating via fast MongoDB aggregation
        await updateBusinessAverageRating(business);

        res.status(201).json(review);
    } catch (error) {
        respondWithApiError(res, error, 'review.create');
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const businessInfo = await Business.findById(review.business).lean();

        // Allow deletion if user wrote it, if they own the business, or if admin
        if (review.user.toString() !== req.user._id.toString() &&
            businessInfo?.owner?.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        const businessId = review.business;
        await Review.findByIdAndDelete(req.params.id);

        // Recalculate average via fast MongoDB aggregation
        await updateBusinessAverageRating(businessId);

        res.json({ message: 'Review removed' });
    } catch (error) {
        respondWithApiError(res, error, 'review.delete');
    }
};

module.exports = {
    getReviewsByBusiness,
    createReview,
    deleteReview
};
