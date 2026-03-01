const mongoose = require('mongoose');

const natureSiteSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a site name']
    },
    location: {
        type: String,
        required: [true, 'Please provide a location']
    },
    maxCapacity: {
        type: Number,
        required: [true, 'Please provide the maximum visitor capacity']
    },
    currentVisitors: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['green', 'yellow', 'red'], // Automatically calculated
        default: 'green'
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    }
}, {
    timestamps: true
});

// Calculate traffic light status before saving based on visitor ratios
natureSiteSchema.pre('save', function (next) {
    if (this.currentVisitors >= this.maxCapacity) {
        this.status = 'red';
    } else if (this.currentVisitors >= this.maxCapacity * 0.75) {
        this.status = 'yellow';
    } else {
        this.status = 'green';
    }
    next();
});

module.exports = mongoose.model('NatureSite', natureSiteSchema);
