# INGREDIENT_NORMALIZATION

## 1) Objectif
Garantir qu’un même ingrédient n’existe qu’une seule fois dans la table ingredients,
sinon tout le projet "avec ce que j’ai" et le pairing deviennent incohérents.

## 2) Normalisation (MVP)
Appliquer avant insertion en base :
- trim (espaces début/fin)
- minuscule
- remplacer les doubles espaces par un espace
- conserver les accents (ou les retirer) MAIS être cohérent partout
- enlever ponctuation non pertinente (ex: virgules, points finaux)

## 3) Cas fréquents à gérer
- pluriels : "citron" vs "citrons"
- variantes : "sucre" vs "sucre blanc"
- typos : "ananas" vs "annanas"
- unités mélangées : "jus de citron" vs "citron (jus)"

## 4) Synonymes (phase suivante)
Ajouter une table de mapping :
- ingredient_aliases(alias_name -> ingredient_id)

But :
- accepter plusieurs formes utilisateur
- stocker une forme canonique unique
