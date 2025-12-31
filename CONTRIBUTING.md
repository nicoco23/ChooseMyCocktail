# Contributing

## 1) Règles repo
- Ne pas committer de dossiers IDE (ex: .idea/)
- Garder les seeds et migrations reproductibles
- Toute modification DB doit mettre à jour docs/DB_SCHEMA.md

## 2) Branching
- feature/* pour les features
- fix/* pour les correctifs

## 3) Qualité
- préférer une couche DB unique (pas de SQL dispersé)
- tests minimal sur le Pairing Engine si possible
