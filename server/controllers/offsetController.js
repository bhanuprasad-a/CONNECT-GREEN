const CarbonOffset = require('../models/CarbonOffset');
const UserOffset = require('../models/UserOffset');

// @desc    Get all offset projects
// @route   GET /api/offsets
// @access  Public
exports.getOffsets = async (req, res) => {
    try {
        const projects = await CarbonOffset.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(400).json({ message: error.message });
    }
};

// @desc    Offset carbon (User purchase)
// @route   POST /api/offsets/purchase
// @access  Private
exports.purchaseOffset = async (req, res) => {
    try {
        const { projectId, amountOffset, tripId } = req.body;

        const project = await CarbonOffset.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const costPaid = amountOffset * project.costPerKg;

        const userOffset = await UserOffset.create({
            user: req.user.id,
            project: projectId,
            amountOffset,
            costPaid,
            trip: tripId
        });

        res.status(201).json(userOffset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user offset history
// @route   GET /api/offsets/my-history
// @access  Private
exports.getMyOffsetHistory = async (req, res) => {
    try {
        const history = await UserOffset.find({ user: req.user.id }).populate('project');
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
