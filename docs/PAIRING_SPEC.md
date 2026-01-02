# PAIRING_SPEC.md — ChooseMy Pairing Engine (Food → Beverage)

## 0) Contexte
ChooseMy... propose des recettes basées sur les ingrédients déjà disponibles chez l’utilisateur.

Aujourd’hui, le projet est séparé en deux grandes parties :
- ChooseMyFood : recettes food
- ChooseMyCocktail : recettes boissons (cocktails / mocktails)

Objectif : lier ces modules via un système d’accords :
> Quand un utilisateur consulte une recette FOOD, l’app propose une BOISSON qui “va bien” avec.

À terme, l’app doit supporter n’importe quel type de boisson :
- cocktail, mocktail, wine, smoothie, milkshake, jus, soft, etc.

Priorité actuelle : migrer toutes les données vers SQLite (source de vérité unique).

---

## 1) Objectifs
1) Avoir un modèle de données unique en SQLite pour FOOD + BOISSONS.
2) Définir une base de métadonnées communes (tags + profils) permettant le pairing.
3) Exposer un endpoint backend simple qui retourne des boissons recommandées pour un plat.
4) Rendre le système extensible : l’ajout de “wine” ne doit pas nécessiter de refonte.

---

## 2) Non-objectifs
- Machine learning / IA dès le départ.
- Dépendances à des APIs externes ou scraping.
- Pairings “expert sommelier” : on vise une logique crédible et itérable.

---

## 3) Concepts clés
### 3.1 Item
Toutes les recettes deviennent des “items” typés :
- kind = food
- kind = beverage (avec un sous-type beverage_type)

Le pairing ne doit pas dépendre d’un type spécifique de boisson : il doit fonctionner pour toutes.

### 3.2 Pairing Engine
Un module côté backend calcule des recommandations :
- Input : food_item_id
- Output : liste ordonnée de beverage items + score + explications (“reasons”)

---

## 4) Schéma SQLite minimal recommandé
### 4.1 Tables principales
#### items
Contient toutes les recettes.
- id (PK)
- kind TEXT NOT NULL              -- 'food' | 'beverage'
- beverage_type TEXT NULL         -- 'cocktail' | 'mocktail' | 'wine' | 'smoothie' | 'milkshake' | 'juice' | ...
- title TEXT NOT NULL
- description TEXT NULL
- instructions TEXT NULL
- image_url TEXT NULL
- validated INTEGER DEFAULT 0     -- 0/1
- created_at TEXT NULL
- updated_at TEXT NULL

#### ingredients
- id (PK)
- name TEXT UNIQUE NOT NULL

#### item_ingredients
Relation N-N item ↔ ingredient.
- item_id INTEGER NOT NULL
- ingredient_id INTEGER NOT NULL
- quantity REAL NULL
- unit TEXT NULL
- PRIMARY KEY (item_id, ingredient_id)

### 4.2 Tags
#### tags
- id (PK)
- name TEXT UNIQUE NOT NULL
- domain TEXT NULL                -- 'flavor' | 'context' | 'service' | 'alcohol' | ...

#### item_tags
- item_id INTEGER NOT NULL
- tag_id INTEGER NOT NULL
- PRIMARY KEY (item_id, tag_id)

### 4.3 Profils (optionnel mais recommandé)
#### item_profiles
1 ligne par item (valeurs 0–5 ou 0–10).
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
- served_cold INTEGER NULL         -- 0/1

---

## 5) Tags “starter pack”
### 5.1 flavor
- sweet, sour, bitter, salty, umami
- fatty, spicy, smoky, herbal, fruity, citrusy, creamy
- chocolatey, coffee, vanilla, spiced
- refreshing, warming, light, rich

### 5.2 context / service / alcohol
- starter, main, dessert, snack, brunch
- aperitif, digestif, party
- cold, hot, sparkling
- no_alcohol, low_abv, high_abv

Note : commencer avec une liste limitée (30–60 tags max) pour éviter la dérive.

---

## 6) Pairing (MVP) : scoring rule-based
### 6.1 Score
Pour un plat FOOD F, on score chaque boisson candidate B.

Le score combine :
1) Similarité de tags (intersection)
2) Règles d’équilibre (bonus/malus)
3) Faisabilité ingrédients (optionnel) si on veut “avec ce que j’ai” côté boisson

### 6.2 Exemples de règles d’équilibre
- fatty (food) → bonus sour / acidity élevée / sparkling
- spicy (food) → bonus refreshing / citrusy / sweet léger ; malus high_abv
- smoky (food) → bonus spiced / rich
- dessert + chocolatey (food) → bonus coffee / creamy / vanilla
- umami (food) → bonus herbal / citrusy / bitter léger

### 6.3 Explications
Chaque recommandation doit retourner des raisons lisibles, par exemple :
- rule:fatty->sour
- tags_match:citrusy
- tags_match:refreshing

---

## 7) API backend minimale
Un seul endpoint de lecture pour le MVP :

- GET /api/pairings?foodId=:id&k=5

Réponse (exemple) :
{
  "foodId": 123,
  "k": 5,
  "recommendations": [
    {
      "itemId": 900,
      "title": "Mojito",
      "beverageType": "cocktail",
      "score": 17.5,
      "reasons": ["rule:fatty->sour", "tags_match:citrusy", "tags_match:refreshing"]
    }
  ]
}

---

## 8) Migration vers SQLite (priorité)
Objectif : SQLite devient la source de vérité unique.

Étapes :
1) Créer le schéma (items, ingredients, item_ingredients, tags, item_tags, item_profiles).
2) Importer les recettes existantes (JSON) vers items + ingredients + item_ingredients.
3) Dédoublonner les ingrédients (minuscule, trim, espaces).
4) Basculer la lecture (backend sert les recettes depuis SQLite).
5) Basculer l’écriture (Submit/Admin écrit dans SQLite).
6) Ajouter progressivement tags et profils.

---

## 9) Critères de réussite (MVP)
- Les recettes FOOD et BOISSONS sont stockées en SQLite.
- Un item peut avoir des ingrédients et des tags.
- L’endpoint /api/pairings retourne un top K stable et explicable.
- Le système accepte plusieurs beverage_type (cocktail, mocktail, wine, juice, etc.).
## 10) UI / UX (minimum)
Sur une page recette FOOD :
- Bloc “Accord parfait 🥤🍸” : top 1 boisson recommandée
- Bloc “Alternatives” : top 2–3 boissons
- Afficher une explication courte (“Pourquoi ?”) basée sur `reasons`
- (Optionnel) Filtre “Sans alcool” si le contexte utilisateur le demande

Objectifs UX :
- Recommandation visible sans scroller
- Justification courte (1 ligne) pour la confiance utilisateur

---

## 11) Feedback & logging (préparer une future IA)
Objectif : enregistrer des interactions utilisateur pour construire un dataset propriétaire et améliorer le ranking plus tard.

### 11.1 Endpoint feedback
- POST /api/pairings/feedback

Payload (exemple) :
{
  "foodId": 123,
  "beverageId": 900,
  "action": "click",
  "rating": 5,
  "reasonTag": "perfect",
  "sessionId": "anon_abc123"
}

Champs :
- foodId (required)
- beverageId (required)
- action (required) : view | click | favorite | reject
- rating (optional) : 1..5
- reasonTag (optional) : too_sweet | too_strong | too_bitter | too_sour | perfect | ...
- sessionId (optional) : identifiant anonyme si pas d’authentification
- meta (optional) : JSON string (version app, device, etc.)

### 11.2 Stockage des événements
Table recommandée : pairing_events
- id (PK)
- created_at
- food_id
- beverage_id
- action
- rating (nullable)
- reason_tag (nullable)
- session_id (nullable)
- meta (nullable, JSON string)

---

## 12) Extensions prévues
### 12.1 Support de nouvelles boissons
L’ajout d’un type de boisson doit se faire en ajoutant une valeur dans `beverage_type`
et éventuellement en enrichissant les tags/profils (sans refonte du modèle).

Exemples :
- wine
- smoothie
- milkshake
- juice

### 12.2 Contexte utilisateur (filtres)
Le Pairing Engine doit pouvoir accepter (plus tard) :
- allow_alcohol
- max_abv
- preferred_tags / avoid_tags
- available_ingredient_ids (pour “avec ce que j’ai” côté boisson)

### 12.3 Pairing bidirectionnel (optionnel)
- boisson → food (même moteur, inversion des candidats)
