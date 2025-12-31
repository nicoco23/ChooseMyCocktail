# ROADMAP — ChooseMy...
# ROADMAP (MVP backend refonte)

- [x] Passer au modèle `items` unifié (food + beverages), tables relationnelles.
- [x] Endpoint pairing MVP (rule-based tags).
- [ ] Authentifier admin/upload, protéger `admin=true`.
- [ ] Migrer les données historiques vers le nouveau schéma (`recipes` -> `items`).
- [ ] Déporter la logique de matching ingrédients côté backend (remplacer la logique front locale).
- [ ] Couvrir avec tests (normalisation, CRUD API, pairing) et CI.
## 1) Stabilisation SQLite
- schéma final + indexes
- seeding reproductible
- normalisation ingrédients robuste

## 2) Pairing MVP
- tags starter pack
- endpoint /api/pairings
- UI : bloc recommandations + reasons

## 3) Feedback + dataset
- endpoint feedback
- table pairing_events
- dashboard simple (stats clics)

## 4) ChooseMyWine
- ajout beverage_type=wine
- ajout profils (abv, acidity, body, tannins si tu veux)
- règles de pairing spécifiques + tags
