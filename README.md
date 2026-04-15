# Data Persistence & API Design Assessment

This project is a backend API that accepts a user's name, enriches it using three external APIs (Genderize, Agify, Nationalize), processes the returned data, stores it in a MongoDB database, and exposes RESTful endpoints to manage the generated profiles.

It demonstrates external API integration, data persistence, idempotency handling, filtering, and clean API design.

## Features

- Accepts a name and generates enriched profile data
- Uses three external APIs:
  - Genderize API (gender prediction)
  - Agify API (age prediction)
  - Nationalize API (country prediction)
- Prevents duplicate profile creation (idempotency by name)
- Stores processed data in MongoDB
- Age classification:
  - child (0–12)
  - teenager (13–19)
  - adult (20–59)
  - senior (60+)
- Supports filtering by gender, country_id, and age_group
- Full CRUD operations (create, read all, read one, delete)
- Proper error handling for external API failures
- UTC ISO 8601 timestamps

## Tech Stack

Node.js, Express.js, MongoDB (Mongoose), Axios, UUID v7

## Installation

git clone https://github.com/Chavon007/identity-profile-api-service.git 
cd profile-service  
npm install

Create a `.env` file in the root directory and add:

 
MONGO_URI=your_mongodb_connection_string

## Run Locally

npm run dev  
or  
npm start

Server runs on:
http://localhost:5000

## API Endpoints

POST /api/profiles  
Body:
{
"name": "emma"
}

GET /api/profiles  
GET /api/profiles?gender=male  
GET /api/profiles?country_id=NG  
GET /api/profiles?age_group=adult  
GET /api/profiles?gender=male&country_id=NG

GET /api/profiles/:id

DELETE /api/profiles/:id

## Success Response Example (Create Profile)

{
"status": "success",
"message": "Profile created successfully",
"data": {
"id": "uuid-v7",
"name": "emma",
"gender": "female",
"gender_probability": 0.95,
"sample_size": 1234,
"age": 28,
"age_group": "adult",
"country_id": "NG",
"country_probability": 0.82,
"created_at": "2026-04-15T17:16:47.439Z"
}
}

## Error Handling

{
"status": "error",
"message": "Error description"
}

400 - Missing or empty name  
422 - Invalid input type  
404 - Profile not found  
502 - External API returned invalid response  
500 - Server error

## External APIs

https://api.genderize.io  
https://api.agify.io  
https://api.nationalize.io

## Project Flow

Receive name → check if exists → call APIs (Promise.all) → validate → process data → store in DB → return response

## Base URL (Production)

https://identity-profile-api-service.vercel.app/

## Example Production Request

POST https://identity-profile-api-service.vercel.app/api/profiles

## Author

Salvation Azuh  
GitHub: https://github.com/Chavon007
