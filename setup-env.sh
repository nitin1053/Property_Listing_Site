#!/bin/bash

# Create .env file
cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb+srv://nitin:12345@cluster0.isaxpl5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_123
REDIS_USERNAME=default
REDIS_PASSWORD=Fns3pwvhUXSUU5f20PJHxWVuBUDSFgka
REDIS_HOST=redis-15553.crce182.ap-south-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=15553
EOL

echo "Environment variables have been set up in .env file" 