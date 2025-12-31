# 🔌 API Documentation

**Base URL:** `http://localhost:3001`

**Version:** 2.0

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Recipes](#recipes)
4. [Ingredients](#ingredients)
5. [Pairings](#pairings)
6. [Error Handling](#error-handling)

---

## 🔐 Authentication

Most endpoints are public. Admin endpoints require authentication via header:

```http
x-admin-token: admin123
```

**Default Admin Token:** `admin123` (⚠️ Change in production!)

**Protected Endpoints:**
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

---

## ❤️ Health Check

### GET `/health`

Check if the server is running and database is connected.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

## 🍽️ Recipes

### GET `/api/recipes`

Get all recipes with optional filtering.

**Query Parameters:**
- `kind` (optional): `food` | `beverage` - Filter by type
- `beverage_type` (optional): `cocktail` | `mocktail` | `smoothie` - Filter beverages
- `validated` (optional): `true` | `false` - Filter by validation status
- `admin` (optional): `true` - Include non-validated recipes (requires admin token)

**Example Requests:**
```bash
# Get all food recipes
GET /api/recipes?kind=food

# Get all cocktails
GET /api/recipes?kind=beverage&beverage_type=cocktail

# Get all recipes (admin)
GET /api/recipes?admin=true
Headers: x-admin-token: admin123
```

**Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "kind": "beverage",
      "beverage_type": "cocktail",
      "title": "Mojito",
      "name": "Mojito",
      "nom": "Mojito",
      "description": null,
      "image_url": "https://...",
      "preparation_time": 5,
      "cooking_time": 0,
      "total_time": 5,
      "glass": "Highball",
      "validated": true,
      "ingredients": [
        {
          "nom": "Rhum blanc",
          "name": "Rhum blanc",
          "quantity": "5 cl",
          "unit": ""
        }
      ],
      "etapes": [
        {
          "titre": "Preparation",
          "description": "Muddle mint leaves..."
        }
      ],
      "steps": [...],
      "tags": ["Refreshing", "Summer"],
      "equipment": ["Muddler", "Shaker"]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Admin endpoint without token

---

### GET `/api/recipes/:id`

Get a specific recipe by ID.

**Path Parameters:**
- `id` (required): Recipe ID (integer)

**Example:**
```bash
GET /api/recipes/1
```

**Response:**
```json
{
  "id": 1,
  "kind": "beverage",
  "title": "Mojito",
  "ingredients": [...],
  "steps": [...],
  "tags": [...],
  "equipment": [...]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Recipe doesn't exist

---

### POST `/api/recipes`

Create a new recipe. **Requires admin token.**

**Headers:**
```http
Content-Type: application/json
x-admin-token: admin123
```

**Request Body:**
```json
{
  "kind": "food",
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta dish",
  "image_url": "https://...",
  "preparation_time": 10,
  "cooking_time": 15,
  "ingredients": [
    {
      "name": "Pasta",
      "quantity": "200",
      "unit": "g"
    },
    {
      "name": "Eggs",
      "quantity": "2",
      "unit": "pieces"
    }
  ],
  "steps": [
    {
      "step_order": 1,
      "title": "Boil water",
      "description": "Bring a large pot of salted water to boil"
    }
  ],
  "tags": ["Italian", "Quick"],
  "equipment": ["Pot", "Pan"],
  "validated": true
}
```

**Required Fields:**
- `kind`: "food" or "beverage"
- `title`: Recipe name
- `ingredients`: Array of at least 1 ingredient
- `steps`: Array of at least 1 step

**Optional Fields:**
- `beverage_type`: Required if kind="beverage" (cocktail, mocktail, smoothie)
- `description`
- `image_url`
- `preparation_time` (minutes)
- `cooking_time` (minutes)
- `glass` (for beverages)
- `tags`: Array of strings
- `equipment`: Array of strings
- `validated`: Boolean (default: false)

**Response:**
```json
{
  "id": 10,
  "kind": "food",
  "title": "Pasta Carbonara",
  ...
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Missing or invalid admin token

---

### PUT `/api/recipes/:id`

Update an existing recipe. **Requires admin token.**

**Headers:**
```http
Content-Type: application/json
x-admin-token: admin123
```

**Request Body:**
Same as POST, but all fields are optional. Only include fields to update.

**Example:**
```bash
PUT /api/recipes/10
Body:
{
  "title": "Updated Pasta Carbonara",
  "validated": true
}
```

**Response:**
```json
{
  "id": 10,
  "title": "Updated Pasta Carbonara",
  ...
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Recipe doesn't exist
- `401 Unauthorized` - Missing or invalid admin token

---

### DELETE `/api/recipes/:id`

Delete a recipe. **Requires admin token.**

**Headers:**
```http
x-admin-token: admin123
```

**Example:**
```bash
DELETE /api/recipes/10
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe deleted"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Recipe doesn't exist
- `401 Unauthorized` - Missing or invalid admin token

---

## 🌿 Ingredients

### GET `/api/ingredients`

Get all unique normalized ingredients from all recipes.

**Query Parameters:**
- `kind` (optional): `food` | `beverage` - Filter by recipe type

**Example:**
```bash
GET /api/ingredients
GET /api/ingredients?kind=beverage
```

**Response:**
```json
{
  "ingredients": [
    "vodka",
    "citron",
    "menthe",
    "sucre",
    ...
  ]
}
```

**Status Codes:**
- `200 OK` - Success

---

## 🍷 Pairings

### POST `/api/pairings`

Get beverage recommendations for a food item.

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "foodId": 7,
  "limit": 5,
  "userIngredients": ["vodka", "citron", "menthe"]
}
```

**Fields:**
- `foodId` (required): ID of the food item
- `limit` (optional): Number of recommendations (default: 5, max: 20)
- `userIngredients` (optional): Array of ingredients user has available

**Example:**
```bash
POST /api/pairings
Body:
{
  "foodId": 7,
  "limit": 3,
  "userIngredients": ["vodka", "citron"]
}
```

**Response:**
```json
{
  "foodId": 7,
  "k": 3,
  "recommendations": [
    {
      "itemId": 1,
      "title": "Mojito",
      "beverageType": "cocktail",
      "score": 85.5,
      "reasons": [
        "Shared tags: refreshing, summer",
        "User has 2/5 ingredients (vodka, citron)"
      ],
      "beverage": {
        "id": 1,
        "title": "Mojito",
        "ingredients": [...],
        "tags": [...],
        ...
      }
    }
  ]
}
```

**Scoring Algorithm:**
The pairing engine uses multiple rules:
1. **Tag Matching**: +10 points per shared tag
2. **Fatty → Acidic**: Rich foods pair with acidic beverages (+15 points)
3. **Spicy → Refreshing**: Spicy dishes with fresh drinks (+20 points)
4. **Sweet → Sparkling**: Sweet items with bubbles (+10 points)
5. **Creamy → Body**: Creamy foods with full-bodied drinks (+12 points)
6. **Smoky → Strong**: Smoky flavors with high ABV (+15 points)
7. **Temperature Match**: Cold foods with cold beverages (+8 points)
8. **Ingredient Availability**: +5 points per user ingredient present
9. **ABV Preference**: Bonus for alcohol-free when food is light

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing foodId
- `404 Not Found` - Food item not found

---

### POST `/api/pairings/feedback`

Record user feedback on a pairing recommendation.

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "foodId": 7,
  "beverageId": 1,
  "action": "favorite",
  "rating": 5,
  "reasonTag": "refreshing",
  "sessionId": "user-session-123"
}
```

**Fields:**
- `foodId` (required): ID of the food item
- `beverageId` (required): ID of the beverage item
- `action` (required): `view` | `click` | `favorite` | `reject`
- `rating` (optional): 1-5 stars
- `reasonTag` (optional): Why the pairing worked/failed
- `sessionId` (optional): User session identifier

**Action Types:**
- `view`: User saw the recommendation
- `click`: User clicked to see details
- `favorite`: User loved the pairing
- `reject`: User didn't like the pairing

**Example:**
```bash
POST /api/pairings/feedback
Body:
{
  "foodId": 7,
  "beverageId": 1,
  "action": "favorite",
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing required fields or invalid action

---

## ❌ Error Handling

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Errors

**Missing Admin Token:**
```json
{
  "error": "Unauthorized - Admin token required"
}
```

**Invalid Recipe ID:**
```json
{
  "error": "Recipe not found"
}
```

**Missing Required Field:**
```json
{
  "error": "Food ID is required"
}
```

---

## 🔧 Rate Limiting

**Not yet implemented.** Future versions will include:
- 100 requests per minute per IP
- 1000 requests per hour per IP
- Custom limits for authenticated users

---

## 📊 Response Times

**Target Performance:**
- Health check: <10ms
- Get all recipes: <50ms
- Get single recipe: <30ms
- Pairing recommendations: <100ms
- Create/Update recipe: <150ms

---

## 🌐 CORS Configuration

**Current:** All origins allowed (development mode)

**Production:** Restrict to frontend domain only

---

## 📚 SDKs & Client Libraries

### JavaScript/TypeScript

```javascript
// Example client wrapper
class ChooseMyAPI {
  constructor(baseURL = 'http://localhost:3001', adminToken = null) {
    this.baseURL = baseURL;
    this.adminToken = adminToken;
  }

  async getRecipes(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/api/recipes?${params}`);
    return response.json();
  }

  async getPairings(foodId, options = {}) {
    const response = await fetch(`${this.baseURL}/api/pairings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId, ...options })
    });
    return response.json();
  }

  async createRecipe(data) {
    const response = await fetch(`${this.baseURL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': this.adminToken
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage
const api = new ChooseMyAPI('http://localhost:3001', 'admin123');
const recipes = await api.getRecipes({ kind: 'food' });
const pairings = await api.getPairings(7, { limit: 5 });
```

---

## 🧪 Postman Collection

Import this URL into Postman:
```
[Coming soon]
```

Or download: `postman_collection.json` (to be created)

---

## 📞 Support

**Issues:** [GitHub Issues](https://github.com/yourusername/choosemy/issues)
**Email:** support@choosemy.app (example)

---

**Last Updated:** 2024-12-31
**API Version:** 2.0
