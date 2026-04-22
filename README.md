# Data Persistence & API Design Assessment

This project is a backend API that accepts a user's name, enriches it using three external APIs (Genderize, Agify, Nationalize), processes the returned data, stores it in a MongoDB database, and exposes RESTful endpoints to manage the generated profiles.

It demonstrates external API integration, data persistence, idempotency handling, filtering, sorting, pagination, and natural language search.

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
- Advanced filtering by gender, country_id, age_group, min_age, max_age, min_gender_probability, min_country_probability
- Sorting by age, created_at, or gender_probability (asc or desc)
- Pagination (default 10 per page, max 50)
- Natural language search endpoint
- Full CRUD operations (create, read all, read one, delete)
- Proper error handling
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
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10

GET /api/profiles/search?q=young males from nigeria
GET /api/profiles/search?q=adult females from kenya
GET /api/profiles/search?q=seniors above 60

GET /api/profiles/:id

DELETE /api/profiles/:id

## Filtering Options (GET /api/profiles)

Parameter | Description | Example
--- | --- | ---
gender | Filter by gender | gender=male
country_id | Filter by ISO country code | country_id=NG
age_group | Filter by age group | age_group=adult
min_age | Minimum age | min_age=20
max_age | Maximum age | max_age=40
min_gender_probability | Minimum gender confidence score | min_gender_probability=0.8
min_country_probability | Minimum country confidence score | min_country_probability=0.7
sort_by | Sort by age, created_at, gender_probability | sort_by=age
order | asc or desc | order=desc
page | Page number (default: 1) | page=2
limit | Results per page (default: 10, max: 50) | limit=20

## Natural Language Search (GET /api/profiles/search)

Parse plain English queries and convert them into filters using rule-based keyword matching. No AI or LLMs are used.

### How It Works

1. The query string is converted to lowercase and split into individual words
2. Each word is checked against a predefined list of keywords
3. Matching keywords are converted into database filters
4. If no keywords are recognised, an error is returned

### Supported Keywords

Keyword / Phrase | Maps To
--- | ---
male / males | gender = male
female / females | gender = female
young | age between 16 and 24
above [number] | min_age = number
below [number] | max_age = number
older than [number] | min_age = number
younger than [number] | max_age = number
child / children | age_group = child
teenager / teenagers | age_group = teenager
adult / adults | age_group = adult
senior / seniors | age_group = senior
nigeria, kenya, ghana, ethiopia... | country_id = matching ISO code

### Supported Countries

Nigeria, Kenya, Ghana, Ethiopia, Tanzania, Uganda, South Africa, Egypt, Morocco, Angola, Mozambique, Zambia, Zimbabwe, Senegal, Mali, Cameroon, Ivory Coast, Rwanda, Madagascar, Somalia, Sudan, Algeria, Tunisia, Libya, Burundi, Malawi, Namibia, Botswana, Benin, Togo, Niger, Guinea, Chad, Congo, Gabon, Eritrea, Lesotho, Gambia, Liberia, Sierra Leone, Djibouti, Comoros, Seychelles, Mauritius, Mauritania, Eswatini, France, Germany, UK, India, China, Japan, Brazil, Canada, Australia, USA

### Example Queries

GET /api/profiles/search?q=young males from nigeria
GET /api/profiles/search?q=adult females from kenya
GET /api/profiles/search?q=seniors above 60
GET /api/profiles/search?q=teenagers from ghana
GET /api/profiles/search?q=females below 30

### Parser Limitations

- Country names must be a single word. "South Africa" will not be detected as a two-word phrase, use "southafrica" instead
- "young" is treated as ages 16–24 for parsing purposes only, it is not a stored age group
- Queries with no recognisable keywords return: { "status": "error", "message": "Unable to interpret query" }
- Does not support complex age range queries like "males between 20 and 30"
- Does not support synonyms beyond the defined keyword list
- Only one country can be detected per query
- Does not support queries combining multiple age groups

## Success Response Example (GET /api/profiles)

{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [
    {
      "id": "uuid-v7",
      "name": "emma",
      "gender": "female",
      "gender_probability": 0.95,
      "age": 28,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.82,
      "created_at": "2026-04-15T17:16:47.439Z"
    }
  ]
}

## Success Response Example (GET /api/profiles/search)

{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 45,
  "data": [
    {
      "id": "uuid-v7",
      "name": "emeka",
      "gender": "male",
      "gender_probability": 0.99,
      "age": 20,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.85,
      "created_at": "2026-04-15T17:16:47.439Z"
    }
  ]
}

## Error Responses

{
  "status": "error",
  "message": "Error description"
}

400 - Missing or empty parameter
422 - Invalid input type
404 - Profile not found
500 - Server error

Unable to interpret query:
{
  "status": "error",
  "message": "Unable to interpret query"
}

## External APIs

https://api.genderize.io
https://api.agify.io
https://api.nationalize.io

## Project Flow

Receive name → check if exists → call APIs (Promise.all) → validate → process data → store in DB → return response

## Base URL (Production)

https://identity-profile-api-service.vercel.app/

## Author

Salvation Azuh
GitHub: https://github.com/Chavon007