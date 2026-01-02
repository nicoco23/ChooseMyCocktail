# 🚀 Démarrage Rapide - Système d'Authentification

## ✅ Installation terminée !

Le système d'authentification est maintenant complètement implémenté. Voici comment démarrer :

## 📦 Ce qui a été créé

### Backend
- ✅ Base de données avec tables users, favorites, history
- ✅ Routes d'authentification (`/api/auth/*`)
- ✅ Stratégies Passport (Local, Google, Facebook, JWT)
- ✅ Middleware de protection
- ✅ Dépendances installées

### Frontend
- ✅ AuthContext pour gérer l'état global
- ✅ LoginModal et RegisterModal
- ✅ Navbar mise à jour avec auth
- ✅ Route de callback OAuth
- ✅ Intégration complète

## 🏃 Démarrage en 3 étapes

### 1. Configurer OAuth (optionnel pour tester)

Si vous voulez tester Google/Facebook OAuth :
- Suivez le guide détaillé : [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
- Configurez les clés dans `/server/.env`

**Pour tester rapidement sans OAuth :**
Vous pouvez utiliser la connexion locale (email/password) sans configurer OAuth !

### 2. Démarrer le backend

```bash
cd choose-my-cocktail/server
node index.js
```

Vous devriez voir :
```
✓ Server running on port 3001
Base de données auth connectée
Tables d'authentification créées avec succès
```

### 3. Démarrer le frontend

Dans un autre terminal :
```bash
cd choose-my-cocktail
npm start
```

L'app s'ouvre sur `http://localhost:3000`

## 🧪 Tester l'authentification

### Test 1 : Inscription locale

1. Allez sur l'app
2. Cliquez sur "Inscription" dans la navbar
3. Remplissez le formulaire :
   - Nom : Test User
   - Email : test@example.com
   - Mot de passe : test123
   - Confirmer : test123
4. Cliquez sur "S'inscrire"
5. ✅ Vous devriez être connecté et voir votre nom dans la navbar

### Test 2 : Déconnexion

1. Cliquez sur votre nom/avatar dans la navbar
2. Cliquez sur "Se déconnecter"
3. ✅ Vous devriez être déconnecté

### Test 3 : Connexion locale

1. Cliquez sur "Connexion"
2. Entrez :
   - Email : test@example.com
   - Mot de passe : test123
3. ✅ Vous devriez être reconnecté

### Test 4 : Persistance

1. Connectez-vous
2. Rechargez la page (F5)
3. ✅ Vous devriez rester connecté

### Test 5 : OAuth (si configuré)

1. Cliquez sur "Connexion"
2. Cliquez sur "Google" ou "Facebook"
3. Connectez-vous avec votre compte
4. ✅ Vous devriez être redirigé et connecté

## 🔍 Vérifications

### Le serveur fonctionne ?
```bash
curl http://localhost:3001/api/recipes
```
Devrait retourner la liste des recettes.

### L'authentification fonctionne ?
```bash
# S'inscrire
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

Devrait retourner :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Les favoris fonctionnent ?
Après connexion, testez :
```bash
# Remplacez YOUR_TOKEN par le token reçu
curl -X POST http://localhost:3001/api/auth/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"itemId": 1, "itemType": "food"}'
```

## 📂 Structure des fichiers créés

```
choose-my-cocktail/
├── server/
│   ├── .env                           # Variables d'environnement (À CONFIGURER)
│   ├── .env.example                   # Exemple de configuration
│   ├── .gitignore                     # Ignore .env et secrets
│   ├── authDatabase.js                # Couche d'accès DB pour auth
│   ├── index.js                       # Serveur principal (modifié)
│   ├── package.json                   # Dépendances (mises à jour)
│   ├── config/
│   │   └── passport.js                # Configuration Passport
│   ├── middleware/
│   │   └── auth.js                    # Middleware d'authentification
│   ├── migrations/
│   │   └── 001_create_users_tables.sql # Schéma DB
│   └── routes/
│       └── auth.js                    # Routes d'authentification
│
└── src/
    ├── App.js                         # Wrapped avec AuthProvider (modifié)
    ├── components/
    │   ├── LoginModal.jsx             # Modal de connexion
    │   ├── RegisterModal.jsx          # Modal d'inscription
    │   └── navbar.jsx                 # Navbar avec auth (modifiée)
    ├── context/
    │   └── AuthContext.js             # Contexte d'authentification
    └── pages/
        └── AuthCallback.jsx           # Page callback OAuth

Documentation :
├── OAUTH_SETUP_GUIDE.md               # Guide détaillé OAuth
├── AUTH_IMPLEMENTATION_SUMMARY.md     # Résumé complet de l'implémentation
└── QUICKSTART.md                      # Ce fichier
```

## 🎯 Prochaines étapes

### Immédiat
1. [ ] Tester l'inscription et la connexion locale
2. [ ] Configurer OAuth si besoin (optionnel)
3. [ ] Tester OAuth une fois configuré

### Court terme
1. [ ] Ajouter des boutons favoris dans l'UI des recettes
2. [ ] Créer une page "Mes Favoris"
3. [ ] Ajouter l'historique automatique des consultations
4. [ ] Créer une page de profil utilisateur

### Moyen terme
1. [ ] Protéger les routes admin (vérifier isAuthenticated)
2. [ ] Ajouter la récupération de mot de passe
3. [ ] Implémenter la vérification d'email
4. [ ] Créer des rôles (user, admin)

## 🆘 Problèmes courants

### "redirect_uri_mismatch"
➜ Vérifiez que l'URI de callback OAuth est exactement configurée dans Google/Facebook Console

### "401 Unauthorized"
➜ Vérifiez que le token est bien dans le header `Authorization: Bearer YOUR_TOKEN`

### "Cannot find module"
➜ Vérifiez que vous êtes dans le bon répertoire (`choose-my-cocktail/server`)

### "EADDRINUSE"
➜ Le port 3001 est déjà utilisé. Tuez le processus : `pkill -f "node.*server"`

### Le frontend ne se connecte pas au backend
➜ Vérifiez que le backend tourne sur `localhost:3001`
➜ Vérifiez CORS dans `server/index.js`

## 📚 Documentation complète

- **Guide OAuth détaillé** : [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
- **Architecture complète** : [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)
- **API Reference** : Voir les routes dans `/server/routes/auth.js`

## 🎉 C'est tout !

Votre système d'authentification est prêt à l'emploi. Il est :
- ✅ Sécurisé (bcrypt + JWT)
- ✅ Scalable (OAuth + Local)
- ✅ Moderne (React Context + Hooks)
- ✅ Professionnel (Passport + best practices)
- ✅ Prêt pour la production (après configuration OAuth)

Bon développement ! 🚀
