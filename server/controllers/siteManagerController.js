const SiteManagerRequest = require('../models/SiteManagerRequest');
const User = require('../models/User');
const { respondWithApiError } = require('../utils/apiError');

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
        respondWithApiError(res, error, 'siteManager.apply');
    }
};

const getRequests = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status !== undefined) {
            if (!['pending', 'approved', 'rejected'].includes(req.query.status)) {
                return res.status(400).json({ message: 'Invalid application status' });
            }
            filter.status = req.query.status;
        }
        const requests = await SiteManagerRequest.find(filter)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .lean();
        res.json(requests);
    } catch (error) {
        respondWithApiError(res, error, 'siteManager.listRequests');
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid application status' });
        }
        const managerRequest = await SiteManagerRequest.findById(req.params.id).populate('user');

        if (!managerRequest) {
            return res.status(404).json({ message: 'Application request not found' });
        }
        if (managerRequest.status !== 'pending') {
            return res.status(409).json({ message: 'Only pending applications can be reviewed' });
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
        respondWithApiError(res, error, 'siteManager.updateRequest');
    }
}

module.exports = {
    applySiteManager,
    getRequests,
    updateRequestStatus
};
