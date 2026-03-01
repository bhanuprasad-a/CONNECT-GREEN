const NatureSite = require('../models/NatureSite');

const getSites = async (req, res) => {
    try {
        const sites = await NatureSite.find().populate('manager', 'name email');
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSite = async (req, res) => {
    try {
        const site = new NatureSite({
            ...req.body,
            manager: req.user._id
        });
        const createdSite = await site.save();
        res.status(201).json(createdSite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateVisitorCount = async (req, res) => {
    try {
        const { currentVisitors } = req.body;
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
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSites,
    createSite,
    updateVisitorCount
};
