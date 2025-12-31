# DATA_SEEDING — Import / Seed SQLite

## 1) Objectif
Pouvoir recréer une base SQLite cohérente à partir de données source (ex: JSON initial, fichiers seed, scripts admin).

## 2) Sources de seed
- Items (food + boissons)
- Ingredients (normalisés)
- Item_ingredients
- Tags (starter pack)
- Item_tags
- (Optionnel) Item_profiles

## 3) Pipeline recommandé
1) Import items
2) Extraire/normaliser les ingrédients, remplir ingredients
3) Remplir item_ingredients
4) Seed tags (starter pack)
5) Appliquer item_tags
6) (Optionnel) Calculer/éditer item_profiles

## 4) Règles
- Le seed doit être idempotent (relançable sans créer des doublons).
- Toute normalisation (accents, pluriels) doit être faite avant de créer ingredients.name.
