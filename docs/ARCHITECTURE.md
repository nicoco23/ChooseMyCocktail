# ARCHITECTURE — ChooseMyCocktail (ChooseMy...)

## 1) Vision
ChooseMy... aide l’utilisateur à trouver des recettes (food + boissons) en fonction de ce qu’il a déjà.
Le projet doit supporter plusieurs types de boissons : cocktail, mocktail, wine, smoothie, jus, etc.

## 2) Principe de base (Item)
Toutes les recettes sont stockées sous une entité unique : Item.
- Item.kind = food | beverage
- Item.beverage_type (si kind=beverage) = cocktail | mocktail | wine | smoothie | juice | ...

Objectif : éviter tout code spécifique “cocktail-only”.

## 3) Couche données
SQLite est la source de vérité.
Toutes les lectures/écritures passent par une couche unique (ex: db/, repository/, services/).

Règles :
- Pas de SQL “au milieu” des routes ou des composants.
- Les migrations DB et le seeding sont reproductibles.

## 4) Couche API
L’API expose :
- listing / détail des recettes
- recherche / filtres
- endpoint pairing (food -> boissons)
- (optionnel) feedback pairing pour préparer la future IA

## 5) Pairing Engine
Le Pairing Engine vit côté backend.
Entrée : foodId
Sortie : Top K boissons avec score + reasons.

Approche MVP :
- rule-based scoring avec tags + règles d’équilibre
- reasons lisibles (confiance utilisateur)

## 6) Extensibilité
Ajouter ChooseMyWine ne doit pas impliquer :
- de nouvelles tables “wine_*”
- de nouveaux endpoints “wine_only”
- de nouveaux composants dupliqués

On ajoute un beverage_type + du tagging + éventuellement des profils.
