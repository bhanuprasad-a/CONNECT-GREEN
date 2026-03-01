const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    origin: {
        type: String,
        required: [true, 'Please provide an origin']
    },
    destination: {
        type: String,
        required: [true, 'Please provide a destination']
    },
    distanceCO2: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide an end date']
    },
    selectedBusinesses: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Business'
    }],
    carbonScore: {
        type: Number,
        default: 0 // Calculated total CO2 kg based on choices
    },
    carbonSaved: {
        type: Number,
        default: 0 // Difference vs baseline non-green trip
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
