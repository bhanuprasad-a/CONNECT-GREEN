const SiteManagerRequest = require('../models/SiteManagerRequest');
const User = require('../models/User');

const applySiteManager = async (req, res) => {
    try {
        const { experienceLevel, motivation, certifications } = req.body;

        // Ensure user hasn't already applied
        const existingApply = await SiteManagerRequest.findOne({ user: req.user._id });
        if (existingApply && existingApply.status !== 'rejected') {
            return res.status(400).json({ message: 'You already have a pending or approved application' });
        }

        let newRequest;
        if (existingApply) {
            // Reapply after rejection
            existingApply.experienceLevel = experienceLevel;
            existingApply.motivation = motivation;
            existingApply.certifications = certifications;
            existingApply.status = 'pending';
            existingApply.rejectionReason = '';
            newRequest = await existingApply.save();
        } else {
            newRequest = await SiteManagerRequest.create({
                user: req.user._id,
                experienceLevel,
                motivation,
                certifications
            });
        }
        res.status(201).json(newRequest);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await SiteManagerRequest.find(req.query).populate('user', 'name email role');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const managerRequest = await SiteManagerRequest.findById(req.params.id).populate('user');

        if (!managerRequest) {
            return res.status(404).json({ message: 'Application request not found' });
        }

        managerRequest.status = status;
        if (rejectionReason !== undefined) {
            managerRequest.rejectionReason = rejectionReason;
        }

        const updatedRequest = await managerRequest.save();

        // Let's modify the user's role to siteManager and set isVerified true/false?
        if (status === 'approved') {
            await User.findByIdAndUpdate(managerRequest.user._id, { role: 'siteManager' });
        }

        res.json(updatedRequest);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    applySiteManager,
    getRequests,
    updateRequestStatus
};
