const Business = require('../models/Business');
const { respondWithApiError } = require('../utils/apiError');

// Helper to escape regex special characters (avoids ReDoS attacks & query errors)
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const getBusinesses = async (req, res) => {
    try {
        // Build a safe query from allowed filter params only (prevents NoSQL injection)
        const filter = {};
        const { badgeStatus, category, isVerified, search, owner, limit, page } = req.query;

        if (badgeStatus) filter.badgeStatus = badgeStatus;
        if (category) filter.category = category;
        if (owner) filter.owner = owner;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

        if (search && search.trim()) {
            const cleanSearch = escapeRegex(search.trim());
            filter.$or = [
                { name: { $regex: cleanSearch, $options: 'i' } },
                { location: { $regex: cleanSearch, $options: 'i' } },
                { description: { $regex: cleanSearch, $options: 'i' } },
            ];
        }

        let query = Business.find(filter)
            .populate('owner', 'name')
            .sort({ createdAt: -1 })
            .lean(); // .lean() converts Mongoose documents to plain JS objects (3-5x faster)

        if (limit) {
            const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
            query = query.limit(parsedLimit);
            if (page) {
                const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
                query = query.skip((parsedPage - 1) * parsedLimit);
            }
        }

        const businesses = await query;
        res.json(businesses);
    } catch (error) {
        respondWithApiError(res, error, 'business.list');
    }
};

const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id)
            .populate('owner', 'name')
            .lean();
        if (business) {
            res.json(business);
        } else {
            res.status(404).json({ message: 'Business not found' });
        }
    } catch (error) {
        respondWithApiError(res, error, 'business.get');
    }
};

const createBusiness = async (req, res) => {
    try {
        // Extract image URL from Cloudinary upload (req.file.path is the full URL)
        const imageData = req.file ? { image: req.file.path } : {};

        let parsedGreenCriteria = {};
        if (req.body.greenCriteria) {
            try {
                parsedGreenCriteria = typeof req.body.greenCriteria === 'string' ? JSON.parse(req.body.greenCriteria) : req.body.greenCriteria;
            } catch (e) {
                return res.status(400).json({ message: 'Invalid green criteria data' });
            }
        }

        const business = new Business({
            ...req.body,
            ...imageData,
            greenCriteria: parsedGreenCriteria,
            owner: req.user._id,
            badgeStatus: 'pending',
            isVerified: false,
        });
        const createdBusiness = await business.save();
        res.status(201).json(createdBusiness);
    } catch (error) {
        respondWithApiError(res, error, 'business.create');
    }
};

const updateBusiness = async (req, res) => {
    try {
        let business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update this business' });
        }

        // Extract image URL from Cloudinary upload if file was uploaded during edit
        const imageData = req.file ? { image: req.file.path } : {};

        const editableFields = [
            'name', 'category', 'location', 'description', 'lat', 'lng', 'geoLocation', 'greenCriteria'
        ];
        const updates = Object.fromEntries(
            editableFields
                .filter((field) => req.body[field] !== undefined)
                .map((field) => [field, req.body[field]])
        );
        if (typeof updates.greenCriteria === 'string') {
            try {
                updates.greenCriteria = JSON.parse(updates.greenCriteria);
            } catch {
                return res.status(400).json({ message: 'Invalid green criteria data' });
            }
        }
        business = await Business.findByIdAndUpdate(
            req.params.id,
            { ...updates, ...imageData },
            { new: true, runValidators: true }
        );
        res.json(business);
    } catch (error) {
        respondWithApiError(res, error, 'business.update');
    }
};

const deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this business' });
        }

        await Business.findByIdAndDelete(req.params.id);
        res.json({ message: 'Business removed' });
    } catch (error) {
        respondWithApiError(res, error, 'business.delete');
    }
};

const updateBadgeStatus = async (req, res) => {
    try {
        const { badgeStatus, isVerified, rejectionReason } = req.body;
        const allowedStatuses = ['none', 'pending', 'bronze', 'silver', 'gold', 'platinum', 'rejected'];
        if (badgeStatus !== undefined && !allowedStatuses.includes(badgeStatus)) {
            return res.status(400).json({ message: 'Invalid badge status' });
        }
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Only update fields that were passed
        if (badgeStatus !== undefined) {
            business.badgeStatus = badgeStatus;
            business.isVerified = ['bronze', 'silver', 'gold', 'platinum'].includes(badgeStatus);
        } else if (isVerified !== undefined) {
            return res.status(400).json({ message: 'Set verification through badge status' });
        }
        if (rejectionReason !== undefined) business.rejectionReason = rejectionReason;

        const updatedBusiness = await business.save();
        res.json(updatedBusiness);
    } catch (error) {
        respondWithApiError(res, error, 'business.updateBadge');
    }
};

module.exports = {
    getBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    updateBadgeStatus
};
