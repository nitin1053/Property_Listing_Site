const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['Apartment', 'House', 'Villa', 'Condo', 'Townhouse']
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Rented'],
        default: 'Available'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    favoriteCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search optimization
propertySchema.index({ 
    title: 'text', 
    description: 'text', 
    location: 'text' 
});

module.exports = mongoose.model('Property', propertySchema); 