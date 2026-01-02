# 🔐 Guide de Configuration de l'Authentification OAuth

Ce guide vous aidera à configurer l'authentification avec Google et Facebook pour votre application ChooseMyCocktail.

## 📋 Prérequis

- Un compte Google (pour Google OAuth)
- Un compte Meta Developer (pour Facebook OAuth)
- Node.js et npm installés
- Le serveur backend tournant sur `localhost:3001`
- L'application frontend tournant sur `localhost:3000`

---

## 🔵 Configuration Google OAuth

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur le menu déroulant du projet en haut à gauche
4. Cliquez sur "Nouveau projet"
5. Donnez un nom à votre projet (ex: "ChooseMyCocktail")
6. Cliquez sur "Créer"

### Étape 2 : Activer l'API Google+

1. Dans le menu latéral, allez dans "APIs & Services" > "Bibliothèque"
2. Recherchez "Google+ API"
3. Cliquez dessus et activez-la

### Étape 3 : Créer des identifiants OAuth 2.0

1. Allez dans "APIs & Services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "ID client OAuth"
3. Si c'est votre première fois, vous devrez configurer l'écran de consentement OAuth :
   - Type d'utilisateur : Externe
   - Nom de l'application : ChooseMyCocktail
   - Email d'assistance : votre email
   - Domaine de la page d'accueil : http://localhost:3000
   - Cliquez sur "Enregistrer et continuer"
   - Ignorez les scopes et cliquez sur "Enregistrer et continuer"
   - Ajoutez vos emails de test si nécessaire

4. Revenez à "Identifiants" et créez un nouvel ID client OAuth :
   - Type d'application : **Application Web**
   - Nom : ChooseMyCocktail OAuth
   - **Origines JavaScript autorisées** :
     ```
     http://localhost:3000
     ```
   - **URI de redirection autorisées** :
     ```
     http://localhost:3001/api/auth/google/callback
     ```
   - Cliquez sur "Créer"

5. **Copiez votre Client ID et Client Secret**

### Étape 4 : Configuration dans .env

Ouvrez le fichier `/server/.env` et remplacez :

```env
GOOGLE_CLIENT_ID=VOTRE_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=VOTRE_GOOGLE_CLIENT_SECRET
```

---

## 🔷 Configuration Facebook OAuth

### Étape 1 : Créer une application Facebook

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Connectez-vous avec votre compte Facebook
3. Cliquez sur "Mes applications" > "Créer une application"
4. Sélectionnez "Consommateur" comme type d'application
5. Donnez un nom à votre application : "ChooseMyCocktail"
6. Entrez votre email de contact
7. Cliquez sur "Créer l'application"

### Étape 2 : Ajouter Facebook Login

1. Dans le tableau de bord de votre application
2. Cliquez sur "Ajouter un produit"
3. Trouvez "Facebook Login" et cliquez sur "Configurer"
4. Sélectionnez "Web"
5. Entrez l'URL du site : `http://localhost:3000`
6. Cliquez sur "Enregistrer"

### Étape 3 : Configurer les paramètres OAuth

1. Dans le menu latéral, allez dans "Facebook Login" > "Paramètres"
2. Dans **URI de redirection OAuth valides**, ajoutez :
   ```
   http://localhost:3001/api/auth/facebook/callback
   ```
3. Cliquez sur "Enregistrer les modifications"

### Étape 4 : Récupérer les identifiants

1. Allez dans "Paramètres" > "Basiques"
2. **Copiez votre ID d'application (App ID)**
3. Cliquez sur "Afficher" pour voir votre **Clé secrète (App Secret)**
4. Copiez la clé secrète

### Étape 5 : Configuration dans .env

Ouvrez le fichier `/server/.env` et remplacez :

```env
FACEBOOK_APP_ID=VOTRE_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=VOTRE_FACEBOOK_APP_SECRET
```

### Étape 6 : Mettre l'application en mode développement

Pour tester, votre application doit être en mode "Développement" :
1. Dans le tableau de bord, en haut, vérifiez que le statut est "En développement"
2. Pour tester, vous devrez ajouter des testeurs dans "Rôles" > "Testeurs"

---

## 🚀 Tester l'authentification

### 1. Démarrer le serveur backend

```bash
cd choose-my-cocktail/server
npm start
```

Le serveur devrait démarrer sur `http://localhost:3001`

### 2. Démarrer le frontend

```bash
cd choose-my-cocktail
npm start
```

L'application devrait s'ouvrir sur `http://localhost:3000`

### 3. Tester la connexion

1. Sur l'application, cliquez sur "Connexion" dans la navbar
2. Cliquez sur "Google" ou "Facebook"
3. Suivez le processus de connexion OAuth
4. Vous devriez être redirigé vers l'application et voir votre nom dans la navbar

---

## ✅ Vérifications

### Backend
- [ ] Fichier `.env` configuré avec les bonnes clés
- [ ] Base de données initialisée (tables users, user_favorites, user_history)
- [ ] Serveur démarré sans erreurs
- [ ] Routes `/api/auth/google` et `/api/auth/facebook` accessibles

### Frontend
- [ ] Modales de connexion/inscription s'affichent
- [ ] Boutons OAuth présents dans les modales
- [ ] Redirection OAuth fonctionne
- [ ] Nom de l'utilisateur s'affiche après connexion

---

## 🔧 Dépannage

### Erreur "redirect_uri_mismatch" (Google)
- Vérifiez que l'URI de redirection dans Google Cloud Console est exactement : `http://localhost:3001/api/auth/google/callback`
- Pas de slash à la fin
- Protocole http, pas https

### Erreur "URL not allowed" (Facebook)
- Vérifiez que l'URI de redirection dans Facebook Developers est bien configurée
- Vérifiez que votre application est en mode "Développement"
- Ajoutez votre compte Facebook comme testeur si nécessaire

### Le token n'est pas stocké
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que le backend renvoie bien un token
- Vérifiez que localStorage est accessible

### L'utilisateur ne s'affiche pas après connexion
- Ouvrez les DevTools et vérifiez le localStorage
- Vérifiez qu'il y a bien un token
- Testez l'endpoint `/api/auth/me` avec le token dans Postman

---

## 🔒 Sécurité en Production

Avant de déployer en production, **CHANGEZ IMPÉRATIVEMENT** :

1. `JWT_SECRET` - Utilisez une chaîne aléatoire longue et complexe
2. `SESSION_SECRET` - Utilisez une chaîne aléatoire longue et complexe
3. Mettez à jour les URLs de callback avec votre domaine de production
4. Activez HTTPS
5. Configurez CORS correctement
6. Mettez votre application Facebook en mode "Live"
7. Ajoutez votre domaine de production dans Google Cloud Console

---

## 📚 Ressources Utiles

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## 💡 Fonctionnalités Implémentées

### Backend
- ✅ Stratégies Passport (Local, Google, Facebook, JWT)
- ✅ Routes d'authentification complètes
- ✅ Middleware de protection des routes
- ✅ Base de données users avec favoris et historique
- ✅ Gestion des sessions avec express-session
- ✅ Tokens JWT avec expiration

### Frontend
- ✅ Contexte d'authentification React
- ✅ Modales de connexion/inscription
- ✅ Boutons OAuth Google et Facebook
- ✅ Gestion du localStorage pour le token
- ✅ Affichage utilisateur dans la navbar
- ✅ Déconnexion
- ✅ Route callback pour OAuth

### Prochaines étapes suggérées
- [ ] Page de profil utilisateur
- [ ] Gestion des favoris dans l'UI
- [ ] Historique des recettes vues
- [ ] Protection des routes admin
- [ ] Récupération de mot de passe
- [ ] Vérification d'email
- [ ] Upload d'avatar personnalisé
