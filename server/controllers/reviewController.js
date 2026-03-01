const Review = require('../models/Review');
const Business = require('../models/Business');

const getReviewsByBusiness = async (req, res) => {
    try {
        const reviews = await Review.find({ business: req.params.businessId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReview = async (req, res) => {
    try {
        const { businessId, rating, comment } = req.body;
        const business = businessId;

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            business
        });

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

        // Update Business Average Rating
        const reviews = await Review.find({ business });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Business.findByIdAndUpdate(business, { avgRating: Math.round(avgRating * 10) / 10 });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const businessInfo = await Business.findById(review.business);

        // Allow deletion if user wrote it, if they own the business, or if admin
        if (review.user.toString() !== req.user._id.toString() &&
            businessInfo.owner.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);

        // Recalculate average
        const reviews = await Review.find({ business: review.business });
        const avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 5;

        await Business.findByIdAndUpdate(review.business, { avgRating: Math.round(avgRating * 10) / 10 });

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReviewsByBusiness,
    createReview,
    deleteReview
};
