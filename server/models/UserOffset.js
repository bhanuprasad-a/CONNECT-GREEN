const mongoose = require('mongoose');

const userOffsetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'CarbonOffset',
        required: true
    },
    amountOffset: {
        type: Number, // in kg
        required: true
    },
    costPaid: {
        type: Number,
        required: true
    },
    trip: {
        type: mongoose.Schema.ObjectId,
        ref: 'Trip'
    }
}, {
    timestamps: true
});

userOffsetSchema.index({ user: 1, createdAt: -1 });
userOffsetSchema.index({ project: 1 });

module.exports = mongoose.model('UserOffset', userOffsetSchema);
