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
        min: [1, 'Maximum capacity must be at least 1'],
        required: [true, 'Please provide the maximum visitor capacity']
    },
    currentVisitors: {
        type: Number,
        min: [0, 'Visitor count cannot be negative'],
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
    },
    lat: {
        type: Number,
        default: null
    },
    lng: {
        type: Number,
        default: null
    },
    geoLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
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

natureSiteSchema.index({ manager: 1 });
natureSiteSchema.index({ status: 1 });
natureSiteSchema.index({ geoLocation: '2dsphere' });
natureSiteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NatureSite', natureSiteSchema);
