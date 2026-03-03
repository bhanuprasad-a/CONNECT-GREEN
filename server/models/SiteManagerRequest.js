const mongoose = require('mongoose');

const siteManagerRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    experienceLevel: {
        type: String,
        required: [true, 'Please select your experience level'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    motivation: {
        type: String,
        required: [true, 'Please explain your motivation'],
        maxlength: [1000, 'Motivation cannot exceed 1000 characters']
    },
    certifications: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SiteManagerRequest', siteManagerRequestSchema);
