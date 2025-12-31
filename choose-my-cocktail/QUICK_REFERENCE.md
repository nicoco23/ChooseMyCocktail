# 📝 Quick Reference Guide

A one-page reference for common tasks and commands.

---

## 🚀 Startup Commands

```bash
# Start Backend
cd choose-my-cocktail/server
node index.js

# Start Frontend
cd choose-my-cocktail
npm start

# Both should be running:
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

---

## 🔧 Common API Calls

### Health Check
```bash
curl http://localhost:3001/health
```

### Get All Food Recipes
```bash
curl http://localhost:3001/api/recipes?kind=food
```

### Get All Beverages
```bash
curl http://localhost:3001/api/recipes?kind=beverage
```

### Get Pairing Recommendations
```bash
curl -X POST http://localhost:3001/api/pairings \
  -H "Content-Type: application/json" \
  -d '{"foodId": 7, "limit": 5}'
```

### Add New Recipe (Admin)
```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -H "x-admin-token: admin123" \
  -d '{
    "kind": "food",
    "title": "My Recipe",
    "ingredients": [{"name": "tomato", "quantity": "2", "unit": "pcs"}],
    "steps": [{"step_order": 1, "description": "Chop tomatoes"}],
    "validated": true
  }'
```

---

## 📂 Important File Locations

**Backend:**
- API Server: `server/index.js`
- Database Schema: `server/schema.sql`
- Database File: `server/recipes.db`
- Pairing Engine: `server/services/pairingEngine.js`
- Repository: `server/repositories/itemRepository.js`

**Frontend:**
- App Router: `src/App.js`
- Pairing Page: `src/pages/PairingPage.jsx`
- Food Service: `src/services/foodService.js`
- Pairing Service: `src/services/pairingService.js`

**Documentation:**
- API Reference: `API_DOCUMENTATION.md`
- Testing Guide: `TESTING_GUIDE.md`
- Roadmap: `ROADMAP.md`
- Architecture: `ARCHITECTURE_OVERVIEW.md`

---

## 🗄️ Database Quick Commands

```bash
# Open database
cd server
sqlite3 recipes.db

# List all tables
.tables

# Count recipes
SELECT COUNT(*) FROM items;

# See food items
SELECT id, title FROM items WHERE kind='food';

# See beverages
SELECT id, title FROM items WHERE kind='beverage';

# View pairing feedback
SELECT * FROM pairing_events ORDER BY created_at DESC LIMIT 10;

# Exit
.quit
```

---

## 🔑 Admin Token

**Default:** `admin123`

**Change it in:** `server/index.js`
```javascript
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your_new_token';
```

**Use it in requests:**
```http
x-admin-token: admin123
```

---

## 📍 Key URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Food Recipes | http://localhost:3000/food |
| All Food | http://localhost:3000/all-food |
| Cocktails | http://localhost:3000/cocktails |
| All Cocktails | http://localhost:3000/all-cocktails |
| **Pairings** | http://localhost:3000/pairings |
| Admin (Food) | http://localhost:3000/admin/food |
| Admin (Cocktails) | http://localhost:3000/admin/cocktails |
| Submit Recipe | http://localhost:3000/submit-recipe |

---

## 🧪 Testing Checklist

- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Get all recipes returns array
- [ ] Get recipe by ID returns details
- [ ] Pairing endpoint returns recommendations
- [ ] Feedback recording succeeds
- [ ] Admin endpoints require token
- [ ] Frontend loads without errors
- [ ] Pairing page functional
- [ ] Can add new recipe via admin
- [ ] Database has 9+ items

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Frontend won't compile
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Re-run migration
cd server
node migrate_recipes_to_items.js
```

### API returns 404
- Check backend is running on port 3001
- Verify URL in `src/config.js`

---

## 📊 Database Schema Summary

**11 Tables:**
1. `items` - Main recipes (food + beverages)
2. `ingredients` - Normalized ingredients
3. `item_ingredients` - Recipe ↔ Ingredient links
4. `item_steps` - Step-by-step instructions
5. `tags` - Categorization tags
6. `item_tags` - Recipe ↔ Tag links
7. `equipment` - Cooking/mixing equipment
8. `item_equipment` - Recipe ↔ Equipment links
9. `item_profiles` - Taste profiles for pairing
10. `ingredient_aliases` - Ingredient name variations
11. `pairing_events` - User feedback (ML data)

---

## 🎯 Pairing Rules Summary

1. **Tag Matching**: +10 per shared tag
2. **Fatty → Acidic**: +15 points
3. **Spicy → Refreshing**: +20 points
4. **Sweet → Sparkling**: +10 points
5. **Creamy → Body**: +12 points
6. **Smoky → Strong**: +15 points
7. **Temperature Match**: +8 points
8. **User Ingredients**: +5 per ingredient
9. **ABV Preference**: Variable bonus

---

## 📞 Get Help

- **Documentation**: See `README.md`, `API_DOCUMENTATION.md`
- **Testing**: See `TESTING_GUIDE.md`
- **Architecture**: See `ARCHITECTURE_OVERVIEW.md`
- **Issues**: Create GitHub issue

---

## 🔄 Common Workflows

### Add a New Food Recipe
1. Go to http://localhost:3000/admin/food
2. Fill in recipe details
3. Add ingredients (one per line)
4. Add steps
5. Select tags
6. Check "Validated"
7. Submit

### Test Pairing Feature
1. Go to http://localhost:3000/pairings
2. Select a food item
3. Optionally add available ingredients
4. Click "Get Pairing Recommendations"
5. Review top 5 suggestions
6. Click "Love it" or "Not for me"

### View Pairing Feedback Data
```bash
cd server
sqlite3 recipes.db
SELECT
  f.title as food,
  b.title as beverage,
  action,
  rating
FROM pairing_events pe
JOIN items f ON pe.food_id = f.id
JOIN items b ON pe.beverage_id = b.id
ORDER BY pe.created_at DESC
LIMIT 10;
```

---

## 🎨 Frontend Themes

**Cocktail Section:**
- Dark theme with amber/pink gradients
- Slate gray backgrounds

**Food Section:**
- Light theme with orange/purple gradients
- **Toggle:** Hello Kitty theme (pink/red)

**Switch Theme:**
- Visible in food section navbar
- Button: "🎀 Hello Kitty" / "🍮 Mode Crème"

---

## ⚡ Performance Tips

- Use `?kind=food` or `?kind=beverage` filters when fetching recipes
- Limit pairing recommendations (default: 5, max: 20)
- Cache frequently accessed recipes in frontend state
- Use SQLite indexes (already configured)

---

## 🔒 Security Notes

- **Admin token**: Change from default `admin123`
- **CORS**: Currently allows all origins (dev mode)
- **Input validation**: Basic validation in place
- **SQL injection**: Protected via parameterized queries
- **TODO**: Add rate limiting, JWT auth, HTTPS

---

## 📈 Analytics Queries

```sql
-- Most popular pairings
SELECT
  f.title as food,
  b.title as beverage,
  COUNT(*) as times_paired
FROM pairing_events pe
JOIN items f ON pe.food_id = f.id
JOIN items b ON pe.beverage_id = b.id
WHERE action IN ('favorite', 'click')
GROUP BY food_id, beverage_id
ORDER BY times_paired DESC
LIMIT 10;

-- User feedback summary
SELECT
  action,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM pairing_events
GROUP BY action;

-- Most used ingredients
SELECT
  i.name,
  COUNT(DISTINCT ii.item_id) as recipe_count
FROM ingredients i
JOIN item_ingredients ii ON i.id = ii.ingredient_id
GROUP BY i.id
ORDER BY recipe_count DESC
LIMIT 20;
```

---

## 🚢 Deployment Checklist (Production)

- [ ] Change admin token
- [ ] Configure CORS for production domain
- [ ] Set up HTTPS/SSL
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Add monitoring (PM2, Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Test all endpoints
- [ ] Load testing
- [ ] Security audit

---

**Last Updated:** 2024-12-31
**Version:** 2.0
