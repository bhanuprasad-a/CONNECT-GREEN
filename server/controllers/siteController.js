const NatureSite = require('../models/NatureSite');
const { respondWithApiError } = require('../utils/apiError');

const getSites = async (req, res) => {
    try {
        const filter = {};
        const { manager, status } = req.query;
        if (manager) filter.manager = manager;
        if (status) filter.status = status;

        const sites = await NatureSite.find(filter)
            .populate('manager', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json(sites);
    } catch (error) {
        respondWithApiError(res, error, 'site.list');
    }
};


const createSite = async (req, res) => {
    try {
        const managerId = (req.user.role === 'admin' && req.body.manager) ? req.body.manager : req.user._id;
        const site = new NatureSite({
            ...req.body,
            manager: managerId
        });
        const createdSite = await site.save();
        res.status(201).json(createdSite);
    } catch (error) {
        respondWithApiError(res, error, 'site.create');
    }
};

const updateVisitorCount = async (req, res) => {
    try {
        const { currentVisitors } = req.body;
        if (!Number.isInteger(currentVisitors) || currentVisitors < 0) {
            return res.status(400).json({ message: 'Visitor count must be a non-negative integer' });
        }
        const site = await NatureSite.findById(req.params.id);

        if (!site) {
            return res.status(404).json({ message: 'Nature site not found' });
        }

        if (site.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update visitor count' });
        }

        site.currentVisitors = currentVisitors;
        // The 'pre' save hook in NatureSite model handles status calculation
        const updatedSite = await site.save();

        res.json(updatedSite);
    } catch (error) {
        respondWithApiError(res, error, 'site.updateVisitors');
    }
};

module.exports = {
    getSites,
    createSite,
    updateVisitorCount
};
