# DB_SCHEMA — SQLite (source of truth)

## 1) Objectif
Définir le schéma officiel SQLite servant de base à :
- recettes food
- recettes boissons (toutes catégories)
- ingrédients normalisés
- tags + profils (pairing)

## 2) Tables minimales

### items
Stocke toutes les recettes.
- id INTEGER PRIMARY KEY
- kind TEXT NOT NULL                 -- 'food' | 'beverage'
- beverage_type TEXT NULL            -- si kind='beverage'
- title TEXT NOT NULL
- description TEXT NULL
- instructions TEXT NULL
- image_url TEXT NULL
- validated INTEGER NOT NULL DEFAULT 0
- created_at TEXT NULL
- updated_at TEXT NULL

Recommandations :
- index(kind)
- index(beverage_type)

### ingredients
- id INTEGER PRIMARY KEY
- name TEXT UNIQUE NOT NULL

Recommandations :
- name est normalisé (minuscule, trim, espaces).

### item_ingredients
- item_id INTEGER NOT NULL
- ingredient_id INTEGER NOT NULL
- quantity REAL NULL
- unit TEXT NULL
- PRIMARY KEY (item_id, ingredient_id)

Recommandations :
- index(item_id)
- index(ingredient_id)

### tags
- id INTEGER PRIMARY KEY
- name TEXT UNIQUE NOT NULL
- domain TEXT NULL                   -- flavor | context | service | alcohol | ...

### item_tags
- item_id INTEGER NOT NULL
- tag_id INTEGER NOT NULL
- PRIMARY KEY (item_id, tag_id)

### item_profiles (optionnel mais recommandé)
- item_id INTEGER PRIMARY KEY
- sweetness INTEGER NULL
- acidity INTEGER NULL
- bitterness INTEGER NULL
- body INTEGER NULL
- spice_heat INTEGER NULL
- creaminess INTEGER NULL
- smokiness INTEGER NULL
- freshness INTEGER NULL
- sparkling_level INTEGER NULL
- abv REAL NULL
- served_cold INTEGER NULL           -- 0/1

## 3) Conventions
- Tous les IDs sont des INTEGER autoincrémentés.
- Les champs optionnels restent NULL (pas de valeurs magiques).
- Les valeurs de kind et beverage_type doivent être cohérentes (contrôle applicatif).
