const Trip = require('../models/Trip');

const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user._id }).populate('selectedBusinesses');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('selectedBusinesses');
        if (trip && trip.user.toString() === req.user._id.toString()) {
            res.json(trip);
        } else {
            res.status(404).json({ message: 'Trip not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTrip = async (req, res) => {
    try {
        const {
            title,
            origin,
            destination,
            originCoords,
            destinationCoords,
            distanceKm,
            selectedBusinesses,
            carbonScore,
            carbonSaved,
            status
        } = req.body;

        const trip = new Trip({
            user: req.user._id,
            title,
            origin,
            destination,
            originCoords,
            destinationCoords,
            distanceKm,
            selectedBusinesses,
            carbonScore,
            carbonSaved,
            status
        });

        const createdTrip = await trip.save();
        res.status(201).json(createdTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this trip' });
        }

        await Trip.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trip removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTrips,
    getTripById,
    createTrip,
    deleteTrip
};
