# 📜 Changelog

All notable changes to the ChooseMy... project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2024-12-31

### 🎉 Major Release - Complete Platform Modernization

This release represents a complete architectural overhaul, transforming the app from a cocktail-focused tool into a unified food & beverage pairing platform.

### Added

#### Backend Architecture
- ✨ **New Database Schema v2.0**
  - 11-table relational design
  - Unified `items` table for food and beverages
  - Normalized `ingredients` table with deduplication
  - `item_profiles` for taste characteristics
  - `pairing_events` for ML data collection
  - `tags`, `equipment`, and junction tables

- ✨ **Repository Pattern Implementation**
  - `ItemRepository` class for clean data access
  - Separation of concerns (Controller → Service → Repository)
  - Automatic ingredient normalization
  - Transaction-safe operations

- ✨ **Intelligent Pairing Engine**
  - Rule-based beverage recommendations
  - 9+ pairing rules (fatty→acidic, spicy→refreshing, etc.)
  - Tag matching algorithm
  - User ingredient availability bonus
  - Scoring system (0-100 scale)

- ✨ **New API Endpoints**
  - `POST /api/pairings` - Get beverage recommendations
  - `POST /api/pairings/feedback` - Record user feedback
  - `GET /api/ingredients` - List normalized ingredients
  - Enhanced `/api/recipes` with filtering

- ✨ **Admin Authentication**
  - Token-based authentication (`x-admin-token` header)
  - Protected create/update/delete endpoints
  - Configurable admin token

- ✨ **Database Migration Script**
  - `migrate_recipes_to_items.js` - One-time migration
  - Converts old `recipes` table to new schema
  - Successfully migrated 9 recipes (6 beverages, 3 food items)

#### Frontend Features
- ✨ **Pairing Page** (`/pairings`)
  - Food item selection
  - Optional ingredient specification
  - Top 5 beverage recommendations display
  - Feedback buttons (Love it / Not for me)
  - Real-time score visualization

- ✨ **Pairing Service**
  - `pairingService.js` - API client for pairing endpoints
  - Feedback recording integration

- ✨ **Enhanced Navigation**
  - Added "🍷 Accords" link in food context
  - Updated navbar with pairing access

#### Documentation
- 📚 `API_DOCUMENTATION.md` - Complete API reference
- 📚 `TESTING_GUIDE.md` - Comprehensive testing instructions
- 📚 `MODERNIZATION_COMPLETE.md` - Implementation summary
- 📚 `ROADMAP.md` - Future enhancements plan
- 📚 `ARCHITECTURE_OVERVIEW.md` - System diagrams
- 📚 `QUICK_REFERENCE.md` - One-page cheat sheet
- 📚 Updated `README.md` with v2.0 details

### Changed

#### Backend Changes
- 🔄 Replaced `database.js` with `database_new.js` (promise-based)
- 🔄 Renamed `index.js` to `index_old.js` (backup)
- 🔄 Activated `index_v2.js` as new `index.js`
- 🔄 Enhanced `normalization.js` with plural handling
- 🔄 Updated API responses for backward compatibility
  - Supports both `nom`/`name` and `etapes`/`steps`

#### Frontend Changes
- 🔄 Updated `App.js` with `/pairings` route
- 🔄 Modified `navbar.jsx` with pairing link
- 🔄 Enhanced `foodService.js` for new API structure

#### Database Changes
- 🔄 Migrated from flat `recipes` table to relational schema
- 🔄 Added 10 new tables for relationships
- 🔄 Implemented proper foreign keys with CASCADE deletes
- 🔄 Added indexes for performance (kind, validated, normalized_name, etc.)

### Improved

- ⚡ Query performance with strategic indexing
- ⚡ Ingredient normalization prevents duplicates
- ⚡ Cleaner code with repository pattern
- ⚡ Better separation of concerns
- ⚡ More maintainable architecture

### Fixed

- 🐛 Ingredient duplication (e.g., "citron" vs "citrons")
- 🐛 Validation filter not working properly
- 🐛 Missing backward compatibility for legacy field names

### Security

- 🔒 Added admin token authentication
- 🔒 Parameterized SQL queries (SQL injection prevention)
- 🔒 CORS configuration
- 🔒 Input validation on recipe creation/update

### Developer Experience

- 🛠️ Comprehensive documentation suite
- 🛠️ Testing guide with curl examples
- 🛠️ Clear project structure
- 🛠️ Migration script for data conversion
- 🛠️ Architecture diagrams

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Features
- Basic cocktail browsing
- Ingredient-based recipe search
- Food recipe management
- Admin interface
- SQLite database
- React frontend
- Express backend

#### Pages
- Homepage
- Cocktails App (ingredient selection)
- All Cocktails (browse all)
- Food App (ingredient selection)
- All Food (browse all)
- Admin panel
- Submit recipe

#### Database
- Single `recipes` table
- Simple `ingredients` table
- No relationships
- Basic validation field

---

## [Unreleased]

### Planned for v2.1

- [ ] JWT-based user authentication
- [ ] User profiles
- [ ] Recipe favorites collection
- [ ] Enhanced admin dashboard
- [ ] Rate limiting on API endpoints

### Planned for v2.2

- [ ] Machine learning pairing model
- [ ] Collaborative filtering
- [ ] User preference learning
- [ ] A/B testing framework

### Planned for v3.0

- [ ] Multi-language support
- [ ] Wine database integration
- [ ] Mobile app (React Native)
- [ ] Social features
- [ ] Recipe sharing

---

## Migration Guide: v1.0 → v2.0

### Database Migration

**Required:** Run the migration script once:
```bash
cd choose-my-cocktail/server
node migrate_recipes_to_items.js
```

This will:
1. Create new schema (11 tables)
2. Migrate existing recipes
3. Normalize ingredients
4. Preserve all data

### API Changes

**Breaking Changes:**
- None! v2.0 API is backward-compatible

**New Endpoints:**
```
POST /api/pairings
POST /api/pairings/feedback
```

**Enhanced Endpoints:**
```
GET /api/recipes?kind=food|beverage
GET /api/ingredients
```

**Admin Authentication:**
Protected endpoints now require:
```http
x-admin-token: admin123
```

### Frontend Changes

**New Routes:**
- `/pairings` - Pairing recommendations page

**Updated Components:**
- `App.js` - Added pairing route
- `navbar.jsx` - Added pairing link

**New Services:**
- `pairingService.js` - Pairing API client

### Configuration Changes

**New Environment Variables:**
```bash
ADMIN_TOKEN=your_secure_token
```

**Recommended Actions:**
1. Change default admin token
2. Run migration script
3. Test pairing endpoint
4. Verify all recipes migrated

---

## Breaking Changes History

### v2.0.0
- **None** - Fully backward-compatible!

### v1.0.0
- Initial release

---

## Deprecation Notices

### v2.0.0
- ⚠️ `database.js` (callback-based) is deprecated
  - Use `database_new.js` (promise-based) instead

- ⚠️ Direct database queries in routes are deprecated
  - Use `ItemRepository` instead

### Future Deprecations (v3.0)
- SQLite will be replaced with PostgreSQL for production
- Migration path will be provided

---

## Contributors

- **Architecture & Development**: GitHub Copilot + Team
- **Documentation**: Comprehensive guides and references
- **Testing**: Manual testing with curl and browser

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

## Support

**Issues**: [GitHub Issues](https://github.com/yourusername/ChooseMyCocktail/issues)
**Documentation**: See `README.md` and `docs/` folder
**Email**: support@choosemy.app (example)

---

**For detailed information about v2.0 changes, see:**
- [MODERNIZATION_COMPLETE.md](./MODERNIZATION_COMPLETE.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
