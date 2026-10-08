const RecyclingCenter = require('../models/RecyclingCenter');
const { respondWithApiError } = require('../utils/apiError');

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

        const centers = await RecyclingCenter.find(query).lean();
        res.status(200).json(centers);
    } catch (error) {
        respondWithApiError(res, error, 'recycling.list');
    }
};

exports.createCenter = async (req, res) => {
    try {
        const center = new RecyclingCenter(req.body);
        await center.save();
        res.status(201).json(center);
    } catch (error) {
        respondWithApiError(res, error, 'recycling.create');
    }
};
