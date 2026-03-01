const RecyclingCenter = require('../models/RecyclingCenter');

exports.getCenters = async (req, res) => {
    try {
        const { lat, lng, radius = 50000, wasteType } = req.query; // Default 50km

        let query = {};

        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(radius)
                }
            };
        }

        if (wasteType) {
            // Handle multiple waste types
            const types = wasteType.split(',');
            query.acceptedWaste = { $in: types };
        }

        const centers = await RecyclingCenter.find(query);
        res.status(200).json(centers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recycling centers", error: error.message });
    }
};

exports.createCenter = async (req, res) => {
    try {
        const center = new RecyclingCenter(req.body);
        await center.save();
        res.status(201).json(center);
    } catch (error) {
        res.status(400).json({ message: "Error creating center", error: error.message });
    }
};
