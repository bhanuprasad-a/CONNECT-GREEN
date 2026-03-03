const Business = require('../models/Business');

const getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find(req.query).populate('owner', 'name email');
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
        // Extract image URL from local Multer upload
        const imageData = req.file ? { image: '/uploads/' + req.file.filename } : {};

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

        // Extract image URL from local Multer upload if file was uploaded during edit
        const imageData = req.file ? { image: '/uploads/' + req.file.filename } : {};

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
