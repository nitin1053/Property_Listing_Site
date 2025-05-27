# Property Listing Backend API

A robust backend system for managing property listings with features like CRUD operations, advanced filtering, user authentication, and property favorites.

## Features

- User authentication (register/login)
- CRUD operations for properties
- Advanced property search and filtering
- Property favorites management
- Redis caching for improved performance
- Property recommendations between users

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Redis Cloud
- JWT for authentication

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   REDIS_USERNAME=your_redis_username
   REDIS_PASSWORD=your_redis_password
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   ```
4. Import the CSV data:
   ```bash
   node src/scripts/importData.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Properties

- `GET /api/properties` - Get all properties with filtering
- `POST /api/properties` - Create a new property
- `GET /api/properties/:id` - Get a single property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property

### Favorites

- `GET /api/favorites` - Get user's favorite properties
- `POST /api/favorites/:propertyId` - Add property to favorites
- `DELETE /api/favorites/:propertyId` - Remove property from favorites

## Advanced Filtering

The properties endpoint supports the following query parameters:

- `search` - Text search in title, description, and location
- `minPrice` and `maxPrice` - Price range
- `propertyType` - Type of property
- `minBedrooms` and `maxBedrooms` - Number of bedrooms
- `minBathrooms` and `maxBathrooms` - Number of bathrooms
- `minArea` and `maxArea` - Property area
- `location` - Location search
- `status` - Property status

Example:
```
GET /api/properties?minPrice=100000&maxPrice=500000&propertyType=Apartment&minBedrooms=2
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error 