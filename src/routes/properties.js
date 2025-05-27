const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const redisClient = require('../config/redis');

// Create property
router.post('/', auth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('location').notEmpty().withMessage('Location is required'),
    body('propertyType').isIn(['Apartment', 'House', 'Villa', 'Condo', 'Townhouse']).withMessage('Invalid property type'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive number'),
    body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive number'),
    body('area').isNumeric().withMessage('Area must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const property = new Property({
            ...req.body,
            createdBy: req.user._id
        });

        await property.save();
        await redisClient.del('properties:*'); // Invalidate cache

        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all properties with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            search,
            minPrice,
            maxPrice,
            propertyType,
            minBedrooms,
            maxBedrooms,
            minBathrooms,
            maxBathrooms,
            minArea,
            maxArea,
            location,
            status
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$text = { $search: search };
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        if (propertyType) filter.propertyType = propertyType;
        
        if (minBedrooms || maxBedrooms) {
            filter.bedrooms = {};
            if (minBedrooms) filter.bedrooms.$gte = Number(minBedrooms);
            if (maxBedrooms) filter.bedrooms.$lte = Number(maxBedrooms);
        }
        
        if (minBathrooms || maxBathrooms) {
            filter.bathrooms = {};
            if (minBathrooms) filter.bathrooms.$gte = Number(minBathrooms);
            if (maxBathrooms) filter.bathrooms.$lte = Number(maxBathrooms);
        }
        
        if (minArea || maxArea) {
            filter.area = {};
            if (minArea) filter.area.$gte = Number(minArea);
            if (maxArea) filter.area.$lte = Number(maxArea);
        }
        
        if (location) filter.location = new RegExp(location, 'i');
        if (status) filter.status = status;

        // Try to get from cache first
        const cacheKey = `properties:${JSON.stringify(filter)}`;
        const cachedProperties = await redisClient.get(cacheKey);
        
        if (cachedProperties) {
            return res.json(JSON.parse(cachedProperties));
        }

        const properties = await Property.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        // Cache the results
        await redisClient.set(cacheKey, JSON.stringify(properties), {
            EX: 3600 // Cache for 1 hour
        });

        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single property
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update property
router.put('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check if user is the creator
        if (property.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this property' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        await redisClient.del('properties:*'); // Invalidate cache

        res.json(updatedProperty);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check if user is the creator
        if (property.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await property.remove();
        await redisClient.del('properties:*'); // Invalidate cache

        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 