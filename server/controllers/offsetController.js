const CarbonOffset = require('../models/CarbonOffset');
const UserOffset = require('../models/UserOffset');
const Trip = require('../models/Trip');
const { respondWithApiError } = require('../utils/apiError');

// @desc    Get all offset projects
// @route   GET /api/offsets
// @access  Public
exports.getOffsets = async (req, res) => {
    try {
        const projects = await CarbonOffset.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(projects);
    } catch (error) {
        respondWithApiError(res, error, 'offset.list');
    }
};

// @desc    Create a new offset project (Admin only)
// @route   POST /api/offsets
// @access  Private/Admin
exports.createOffset = async (req, res) => {
    try {
        const project = await CarbonOffset.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        respondWithApiError(res, error, 'offset.create');
    }
};

// @desc    Offset carbon (User purchase)
// @route   POST /api/offsets/purchase
// @access  Private
exports.purchaseOffset = async (req, res) => {
    try {
        const { projectId, amountOffset, tripId } = req.body;

        if (!Number.isFinite(amountOffset) || amountOffset <= 0 || amountOffset > 5000) {
            return res.status(400).json({ message: 'Offset amount must be between 0 and 5000 kg' });
        }

        const project = await CarbonOffset.findById(projectId).lean();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!Number.isFinite(project.costPerKg) || project.costPerKg <= 0) {
            return res.status(400).json({ message: 'Project pricing is invalid' });
        }

        if (tripId) {
            const trip = await Trip.findOne({ _id: tripId, user: req.user._id }).select('_id').lean();
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }
        }

        const costPaid = amountOffset * project.costPerKg;
        if (!Number.isFinite(costPaid)) {
            return res.status(400).json({ message: 'Contribution total is invalid' });
        }

        const userOffset = await UserOffset.create({
            user: req.user.id,
            project: projectId,
            amountOffset,
            costPaid,
            trip: tripId
        });

        res.status(201).json({ ...userOffset.toObject(), demoOnly: true });
    } catch (error) {
        respondWithApiError(res, error, 'offset.purchase');
    }
};

// @desc    Get user offset history
// @route   GET /api/offsets/my-history
// @access  Private
exports.getMyOffsetHistory = async (req, res) => {
    try {
        const history = await UserOffset.find({ user: req.user.id })
            .populate('project')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(history);
    } catch (error) {
        respondWithApiError(res, error, 'offset.history');
    }
};
