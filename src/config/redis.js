const { createClient } = require('redis');

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});

// Add connection event handlers
redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('end', () => {
    console.log('Redis client connection closed');
});

// Test the connection
const testConnection = async () => {
    try {
        await redisClient.connect();
        await redisClient.set('test', 'Redis connection successful');
        const value = await redisClient.get('test');
        console.log('Redis test value:', value);
        await redisClient.del('test');
    } catch (error) {
        console.error('Redis connection test failed:', error);
        process.exit(1);
    }
};

testConnection();

module.exports = redisClient; 