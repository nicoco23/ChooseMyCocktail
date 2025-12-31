# 🧪 Testing Guide

## Pre-Test Checklist

- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Database migration completed successfully (9 recipes migrated)

---

## 1. API Health Check ✅

### Test the health endpoint:
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

---

## 2. Recipe Endpoints 🍽️

### Get all food recipes:
```bash
curl http://localhost:3001/api/recipes?kind=food
```

**Expected:** Array of 3 food items (Salade César, Pâtes Carbonara, Fondant au chocolat)

### Get all beverages:
```bash
curl http://localhost:3001/api/recipes?kind=beverage
```

**Expected:** Array of 6 cocktails (Mojito, Cosmopolitan, etc.)

### Get specific recipe:
```bash
curl http://localhost:3001/api/recipes/1
```

**Expected:** Full details of recipe with ID 1, including:
- Ingredients with quantities
- Steps
- Tags
- Equipment

---

## 3. Ingredient Normalization 🧂

### Get all ingredients:
```bash
curl http://localhost:3001/api/ingredients
```

**Expected:** Array of unique normalized ingredients

**Check for:**
- No duplicates (e.g., "citron" and "citrons" should be one entry)
- Proper normalization (lowercase, singular form)

---

## 4. Pairing Engine 🍷

### Get pairing recommendations:
```bash
curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": 7,
    "limit": 5
  }'
```

**Replace `foodId` with actual food item ID (7 = Salade César)**

**Expected Response:**
```json
{
  "pairings": [
    {
      "beverage": {
        "id": 1,
        "title": "Mojito",
        "kind": "beverage",
        "beverage_type": "cocktail",
        ...
      },
      "score": 85.5,
      "reason": "Fresh and light beverage complements the salad"
    },
    ...
  ],
  "total": 5
}
```

### Test with user ingredients:
```bash
curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": 7,
    "limit": 5,
    "userIngredients": ["vodka", "citron", "menthe"]
  }'
```

**Expected:** Pairings with higher scores for beverages using available ingredients

---

## 5. Feedback Recording 📊

### Record positive feedback:
```bash
curl -X POST http://localhost:3001/api/pairings/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": 7,
    "beverageId": 1,
    "action": "favorite",
    "rating": 5,
    "reasonTag": "refreshing"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Feedback recorded"
}
```

### Record negative feedback:
```bash
curl -X POST http://localhost:3001/api/pairings/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": 7,
    "beverageId": 2,
    "action": "reject",
    "reasonTag": "too-sweet"
  }'
```

---

## 6. Admin Endpoints 🔐

### Add new recipe (requires admin token):
```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -H "x-admin-token: admin123" \
  -d '{
    "kind": "food",
    "title": "Test Recipe",
    "description": "A test recipe",
    "ingredients": [
      {"name": "tomate", "quantity": "2", "unit": "pièces"}
    ],
    "steps": [
      {"step_order": 1, "description": "Cut tomatoes"}
    ],
    "tags": ["Rapide", "Sain"],
    "validated": true
  }'
```

**Expected:**
```json
{
  "id": 10,
  "kind": "food",
  "title": "Test Recipe",
  ...
}
```

### Without admin token (should fail):
```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "food",
    "title": "Test Recipe"
  }'
```

**Expected:**
```json
{
  "error": "Unauthorized - Admin token required"
}
```

### Update recipe:
```bash
curl -X PUT http://localhost:3001/api/recipes/10 \
  -H "Content-Type: application/json" \
  -H "x-admin-token: admin123" \
  -d '{
    "title": "Updated Test Recipe",
    "description": "Updated description"
  }'
```

### Delete recipe:
```bash
curl -X DELETE http://localhost:3001/api/recipes/10 \
  -H "x-admin-token: admin123"
```

---

## 7. Frontend Testing 🎨

### Homepage:
1. Navigate to `http://localhost:3000`
2. ✅ Both "Cocktails" and "Food" options visible
3. ✅ Smooth animations

### Food Section:
1. Click "Food" → `http://localhost:3000/food`
2. ✅ "Mon Frigo" page shows ingredient checklist
3. ✅ Can select/deselect ingredients
4. ✅ Recipe suggestions update based on available ingredients

### All Food Page:
1. Navigate to `http://localhost:3000/all-food`
2. ✅ All 3 food recipes visible
3. ✅ Category filter works (Entrée, Plat, Dessert)
4. ✅ Tag filter works

### **NEW** Pairing Page:
1. Navigate to `http://localhost:3000/pairings`
2. ✅ Dropdown shows food items
3. ✅ Select "Salade César"
4. ✅ Optionally enter ingredients: `vodka, citron`
5. ✅ Click "Get Pairing Recommendations"
6. ✅ See list of 5 beverages with scores
7. ✅ Each has "Love it" and "Not for me" buttons
8. ✅ Click feedback buttons (check console for confirmation)

### Admin Page:
1. Navigate to `http://localhost:3000/admin/food`
2. ✅ Can add new recipe
3. ✅ Can edit existing recipe
4. ✅ Can delete recipe
5. ✅ Can toggle validation status

---

## 8. Database Verification 🗄️

### Check tables exist:
```bash
cd choose-my-cocktail/server
sqlite3 recipes.db ".tables"
```

**Expected Tables:**
```
equipment            item_steps           pairing_events
ingredient_aliases   item_tags            recipes
ingredients          items                tags
item_equipment       old_ingredients
item_ingredients     old_recipes
item_profiles
```

### Count items:
```bash
sqlite3 recipes.db "SELECT COUNT(*) FROM items;"
```
**Expected:** `9`

### Check ingredients normalization:
```bash
sqlite3 recipes.db "SELECT name, normalized_name FROM ingredients LIMIT 10;"
```

**Expected:** Different `name` but consistent `normalized_name` for variations

### View pairing events:
```bash
sqlite3 recipes.db "SELECT * FROM pairing_events;"
```

**Expected:** Rows if you've tested feedback endpoints

---

## 9. Error Handling Tests ❌

### Invalid food ID in pairing:
```bash
curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{"foodId": 999}'
```

**Expected:**
```json
{
  "error": "Food item not found"
}
```

### Invalid recipe ID:
```bash
curl http://localhost:3001/api/recipes/999
```

**Expected:**
```json
{
  "error": "Recipe not found"
}
```

### Malformed request:
```bash
curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

**Expected:**
```json
{
  "error": "Food ID is required"
}
```

---

## 10. Performance Tests ⚡

### Benchmark pairing endpoint:
```bash
time curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{"foodId": 7, "limit": 10}'
```

**Expected:** Response time < 100ms for 10 pairings

### Bulk ingredient fetch:
```bash
time curl http://localhost:3001/api/ingredients
```

**Expected:** Response time < 50ms

---

## 11. Integration Tests 🔗

### End-to-end pairing workflow:
1. Get food items: `GET /api/recipes?kind=food`
2. Pick first food item ID
3. Request pairings: `POST /api/pairings` with that ID
4. Get top beverage from results
5. Record feedback: `POST /api/pairings/feedback`
6. Verify in database: `SELECT * FROM pairing_events;`

---

## Checklist Summary

### Backend API:
- [ ] Health endpoint works
- [ ] Get all recipes (food & beverages)
- [ ] Get specific recipe by ID
- [ ] Get all ingredients (normalized)
- [ ] POST pairing request returns recommendations
- [ ] Pairing scores are reasonable (0-100 range)
- [ ] POST feedback records in database
- [ ] Admin endpoints protected by token
- [ ] Add/update/delete recipe with admin token

### Frontend:
- [ ] Homepage loads
- [ ] Food section navigable
- [ ] Pairing page accessible
- [ ] Food dropdown populated
- [ ] Pairing request shows results
- [ ] Feedback buttons work
- [ ] Admin page functional

### Database:
- [ ] All 11 tables exist
- [ ] 9 items migrated
- [ ] Ingredients normalized
- [ ] Pairing events recorded

### Error Handling:
- [ ] Invalid IDs handled gracefully
- [ ] Missing auth tokens rejected
- [ ] Malformed requests return errors

---

## 🎉 If all tests pass, your modernization is complete!

**Any issues?** Check:
1. Server logs for backend errors
2. Browser console for frontend errors
3. Database file permissions
4. Port availability (3000, 3001)
