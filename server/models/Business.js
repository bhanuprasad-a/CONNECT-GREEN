const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a business name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['hotel', 'restaurant', 'transport', 'activity']
    },
    location: {
        type: String,
        required: [true, 'Please provide a location (city/country)']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        default: 'no-photo.jpg' // Placeholder or cloudinary URL
    },
    badgeStatus: {
        type: String,
        enum: ['none', 'pending', 'bronze', 'silver', 'gold', 'platinum', 'rejected'],
        default: 'none'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avgRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: 5
    },
    greenCriteria: {
        renewableEnergyPercent: {
            type: Number,
            default: 0
        },
        hasNoPlastics: {
            type: Boolean,
            default: false
        },
        sourcesLocally: {
            type: Boolean,
            default: false
        },
        waterConservation: {
            type: Boolean,
            default: false
        },
        fairWageEmployment: {
            type: Boolean,
            default: false
        },
        habitatProtection: {
            type: Boolean,
            default: false
        },
        evidenceDocuments: {
            type: [String], // Array of uploaded document URLs (Cloudinary)
            default: []
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
