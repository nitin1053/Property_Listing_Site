const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');
const redisClient = require('../config/redis');

// Add property to favorites
router.post('/:propertyId', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const user = await User.findById(req.user._id);
        
        // Check if already in favorites
        if (user.favorites.includes(req.params.propertyId)) {
            return res.status(400).json({ error: 'Property already in favorites' });
        }

        // Add to favorites
        user.favorites.push(req.params.propertyId);
        await user.save();

        // Increment favorite count
        property.favoriteCount += 1;
        await property.save();

        // Invalidate cache
        await redisClient.del(`user:${user._id}:favorites`);

        res.json({ message: 'Property added to favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove property from favorites
router.delete('/:propertyId', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const user = await User.findById(req.user._id);
        
        // Check if in favorites
        if (!user.favorites.includes(req.params.propertyId)) {
            return res.status(400).json({ error: 'Property not in favorites' });
        }

        // Remove from favorites
        user.favorites = user.favorites.filter(
            id => id.toString() !== req.params.propertyId
        );
        await user.save();

        // Decrement favorite count
        property.favoriteCount -= 1;
        await property.save();

        // Invalidate cache
        await redisClient.del(`user:${user._id}:favorites`);

        res.json({ message: 'Property removed from favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        // Try to get from cache first
        const cacheKey = `user:${req.user._id}:favorites`;
        const cachedFavorites = await redisClient.get(cacheKey);
        
        if (cachedFavorites) {
            return res.json(JSON.parse(cachedFavorites));
        }

        const user = await User.findById(req.user._id)
            .populate({
                path: 'favorites',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            });

        // Cache the results
        await redisClient.set(cacheKey, JSON.stringify(user.favorites), {
            EX: 3600 // Cache for 1 hour
        });

        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 