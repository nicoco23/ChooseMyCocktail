# API — Endpoints (contract)
# API — Items & Pairings

## Base
- URL base backend : `http://localhost:3001`
- JSON seulement.
- Auth : `x-admin-token` requis pour `admin=true`, POST/PUT/DELETE recipes, upload. Valeur par défaut (dev) : `admin123` (configurable via `ADMIN_TOKEN`).

## Recettes / Items
- `GET /api/recipes`  
  - Query : `admin=true` (inclut non validés), `kind=food|beverage`, `beverage_type=cocktail|mocktail|...`, `search=mot`.  
  - Réponse : `{ data: [Item] }`
- `GET /api/recipes/:id`  
  - Réponse : `{ data: Item }`
- `POST /api/recipes`  
  - Body : `{ title|nom, kind? (inféré), category?, type?, ingredients: [{nom, quantite?, unite?}], steps: [], equipment: [], tags: [], glass?, alcool?, validated? }`
- `PUT /api/recipes/:id`  
  - Body : mêmes champs que POST.
- `DELETE /api/recipes/:id`

`Item` (extrait) :  
`{ id, nom, kind, beverage_type, category, image, ingredients:[{nom, quantite, unite}], steps:[{titre, description}], tags:[], equipment:[], validated }`

## Ingrédients
- `GET /api/ingredients` -> `{ data: ["basilic", ...] }`

## Upload
- `POST /api/upload` (multipart `image`) -> `{ imageUrl }`

## Pairing (MVP rule-based)
- `POST /api/pairings`  
  - Body : `{ foodId: number, topK?: number }`  
  - Réponse : `{ data: [{ beverage: Item, score: number, reasons: [] }] }`
## 1) Objectif
Décrire les routes API utilisées par le front.
Ce document est le "contrat" minimal.

## 2) Recettes
- GET /api/items?kind=food|beverage
- GET /api/items/:id

(Optionnel)
- GET /api/search?q=...&kind=...&tags=...

## 3) Pairing (Food -> Beverage)
- GET /api/pairings?foodId=:id&k=5

Réponse attendue :
{
  "foodId": 123,
  "k": 5,
  "recommendations": [
    {
      "itemId": 900,
      "title": "Mojito",
      "beverageType": "cocktail",
      "score": 17.5,
      "reasons": ["rule:fatty->sour", "tags_match:citrusy"]
    }
  ]
}

## 4) Feedback (préparer IA)
- POST /api/pairings/feedback

Payload :
{
  "foodId": 123,
  "beverageId": 900,
  "action": "click",
  "rating": 5,
  "sessionId": "anon_abc123"
}
