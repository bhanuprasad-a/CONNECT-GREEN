const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Unnamed Trip'
    },
    origin: {
        type: String,
        required: [true, 'Please provide an origin']
    },
    destination: {
        type: String,
        required: [true, 'Please provide a destination']
    },
    originCoords: {
        lat: Number,
        lng: Number
    },
    destinationCoords: {
        lat: Number,
        lng: Number
    },
    distanceKm: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h later
    },
    selectedBusinesses: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Business'
    }],
    carbonScore: {
        type: Number,
        default: 0
    },
    carbonSaved: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['planned', 'completed'],
        default: 'planned'
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Trip', tripSchema);
