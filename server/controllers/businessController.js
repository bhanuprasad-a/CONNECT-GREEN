const Business = require('../models/Business');

const getBusinesses = async (req, res) => {
    try {
        // Build a safe query from allowed filter params only (prevents NoSQL injection)
        const filter = {};
        const { badgeStatus, category, isVerified, search } = req.query;

        if (badgeStatus) filter.badgeStatus = badgeStatus;
        if (category) filter.category = category;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const businesses = await Business.find(filter)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('owner', 'name email');
        if (business) {
            res.json(business);
        } else {
            res.status(404).json({ message: 'Business not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
                console.error("Failed to parse greenCriteria", e);
            }
        }

        const business = new Business({
            ...req.body,
            ...imageData,
            greenCriteria: parsedGreenCriteria,
            owner: req.user._id,
            badgeStatus: 'pending' // Force new businesses to pending state
        });
        const createdBusiness = await business.save();
        res.status(201).json(createdBusiness);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        business = await Business.findByIdAndUpdate(
            req.params.id,
            { ...req.body, ...imageData },
            { new: true }
        );
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
};

const updateBadgeStatus = async (req, res) => {
    try {
        const { badgeStatus, isVerified, rejectionReason } = req.body;
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Only update fields that were passed
        if (badgeStatus !== undefined) business.badgeStatus = badgeStatus;
        if (isVerified !== undefined) business.isVerified = isVerified;
        if (rejectionReason !== undefined) business.rejectionReason = rejectionReason;

        const updatedBusiness = await business.save();
        res.json(updatedBusiness);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
