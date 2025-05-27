const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const results = [];

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        try {
            // Transform CSV data to match our schema
            const properties = results.map(row => ({
                title: row.title || 'Untitled Property',
                description: row.description || 'No description available',
                price: parseFloat(row.price) || 0,
                location: row.location || 'Unknown Location',
                propertyType: row.propertyType || 'Apartment',
                bedrooms: parseInt(row.bedrooms) || 0,
                bathrooms: parseInt(row.bathrooms) || 0,
                area: parseFloat(row.area) || 0,
                amenities: row.amenities ? row.amenities.split(',') : [],
                images: row.images ? row.images.split(',') : [],
                status: row.status || 'Available',
                createdBy: row.createdBy || 'default_user_id' // You'll need to replace this with actual user IDs
            }));

            // Insert properties in batches
            const batchSize = 100;
            for (let i = 0; i < properties.length; i += batchSize) {
                const batch = properties.slice(i, i + batchSize);
                await Property.insertMany(batch);
                console.log(`Imported ${i + batch.length} of ${properties.length} properties`);
            }

            console.log('Data import completed successfully');
            process.exit(0);
        } catch (error) {
            console.error('Error importing data:', error);
            process.exit(1);
        }
    }); 