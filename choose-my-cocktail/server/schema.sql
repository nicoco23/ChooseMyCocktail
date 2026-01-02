-- ChooseMy... Database Schema v2.0
-- Source of truth: SQLite

-- Main table: all recipes (food + beverages)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK(kind IN ('food', 'beverage')),
    beverage_type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    image_url TEXT,
    preparation_time INTEGER,
    cooking_time INTEGER,
    total_time INTEGER,
    glass TEXT,
    validated INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_kind ON items(kind);
CREATE INDEX IF NOT EXISTS idx_items_beverage_type ON items(beverage_type);
CREATE INDEX IF NOT EXISTS idx_items_validated ON items(validated);

-- Normalized ingredients
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    normalized_name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingredients_normalized ON ingredients(normalized_name);

-- Item-Ingredient relationship
CREATE TABLE IF NOT EXISTS item_ingredients (
    item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity TEXT,
    unit TEXT,
    PRIMARY KEY (item_id, ingredient_id),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IF NOT EXISTS idx_item_ingredients_item ON item_ingredients(item_id);
CREATE INDEX IF NOT EXISTS idx_item_ingredients_ingredient ON item_ingredients(ingredient_id);

-- Steps (instructions broken down)
CREATE TABLE IF NOT EXISTS item_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_item_steps_item ON item_steps(item_id);

-- Tags (for pairing and filtering)
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    domain TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_domain ON tags(domain);

-- Item-Tag relationship
CREATE TABLE IF NOT EXISTS item_tags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tags(id)
);

CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Item-Equipment relationship
CREATE TABLE IF NOT EXISTS item_equipment (
    item_id INTEGER NOT NULL,
    equipment_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, equipment_id),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY(equipment_id) REFERENCES equipment(id)
);

CREATE INDEX IF NOT EXISTS idx_item_equipment_item ON item_equipment(item_id);

-- Profiles (for pairing algorithm)
CREATE TABLE IF NOT EXISTS item_profiles (
    item_id INTEGER PRIMARY KEY,
    sweetness INTEGER,
    acidity INTEGER,
    bitterness INTEGER,
    body INTEGER,
    spice_heat INTEGER,
    creaminess INTEGER,
    smokiness INTEGER,
    freshness INTEGER,
    sparkling_level INTEGER,
    abv REAL,
    served_cold INTEGER,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Ingredient aliases (for normalization)
CREATE TABLE IF NOT EXISTS ingredient_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT UNIQUE NOT NULL,
    ingredient_id INTEGER NOT NULL,
    FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IF NOT EXISTS idx_ingredient_aliases_alias ON ingredient_aliases(alias);

-- Pairing feedback (for future ML)
CREATE TABLE IF NOT EXISTS pairing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    food_id INTEGER NOT NULL,
    beverage_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('view', 'click', 'favorite', 'reject')),
    rating INTEGER,
    reason_tag TEXT,
    session_id TEXT,
    meta TEXT,
    FOREIGN KEY(food_id) REFERENCES items(id),
    FOREIGN KEY(beverage_id) REFERENCES items(id)
);

CREATE INDEX IF NOT EXISTS idx_pairing_events_food ON pairing_events(food_id);
CREATE INDEX IF NOT EXISTS idx_pairing_events_beverage ON pairing_events(beverage_id);
CREATE INDEX IF NOT EXISTS idx_pairing_events_session ON pairing_events(session_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_item ON ratings(item_id);
