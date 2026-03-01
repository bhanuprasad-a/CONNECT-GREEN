const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    acceptedWaste: [{
        type: String,
        enum: ['plastic', 'e-waste', 'glass', 'paper', 'batteries', 'metal', 'organic']
    }],
    operatingHours: {
        open: String, // e.g., "09:00"
        close: String // e.g., "18:00"
    },
    isOpen: { type: Boolean, default: true },
    contact: String,
    address: String
});

recyclingCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);
