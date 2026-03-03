const mongoose = require('mongoose');

const carbonOffsetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name']
    },
    organization: {
        type: String,
        required: [true, 'Please add an organization name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['reforestation', 'renewable', 'methane_capture', 'community_project'],
        required: true
    },
    costPerKg: {
        type: Number,
        required: [true, 'Please add cost per kg of CO2 offset']
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CarbonOffset', carbonOffsetSchema);
