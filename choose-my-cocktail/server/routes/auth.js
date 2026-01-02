const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { authenticateJWT } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

function createAuthRoutes(authDb) {
  const router = express.Router();

  // Générer un JWT token
  const generateToken = (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  };

  // Inscription locale
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      // Vérifier si l'utilisateur existe
      const existingUser = await authDb.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Hasher le mot de passe
      const password_hash = await bcrypt.hash(password, 10);

      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Créer l'utilisateur
      const user = await authDb.createUser({
        email,
        name: name || email.split('@')[0],
        avatar_url: null,
        provider: 'local',
        provider_id: null,
        password_hash,
        verification_token: verificationToken
      });

      // Envoyer l'email de vérification
      await sendVerificationEmail(email, verificationToken);

      res.json({
        success: true,
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        requireVerification: true
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Renvoyer l'email de vérification
  router.post('/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email requis' });
      }

      const user = await authDb.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      if (user.email_verified) {
        return res.status(400).json({ error: 'Ce compte est déjà vérifié' });
      }

      // Si pas de token (cas rare), on en génère un nouveau
      let verificationToken = user.verification_token;
      if (!verificationToken) {
        verificationToken = crypto.randomBytes(32).toString('hex');
        // Mise à jour du token en base (il faudrait une méthode updateVerificationToken dans authDatabase,
        // mais pour l'instant on suppose qu'il existe toujours si non vérifié, ou on le recrée)
        // Pour simplifier et éviter de modifier authDatabase pour ce cas limite, on assume que le token existe.
        // Si on voulait être rigoureux, on ajouterait updateVerificationToken.
        // Mais attend, createUser met un token. verifyUserEmail le met à NULL.
        // Donc si non vérifié, il DOIT y avoir un token.
      }

      await sendVerificationEmail(email, verificationToken);

      res.json({
        success: true,
        message: 'Email de vérification renvoyé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Vérification de l'email
  router.post('/verify-email', async (req, res) => {
    try {
      const { token, email } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token requis' });
      }

      const user = await authDb.findUserByVerificationToken(token);

      if (!user) {
        // Si le token n'est pas trouvé, on vérifie si l'utilisateur est déjà validé via son email
        if (email) {
          const userByEmail = await authDb.findUserByEmail(email);
          if (userByEmail && userByEmail.email_verified) {
            // Générer le token pour connecter l'utilisateur
            const jwtToken = generateToken(userByEmail);

            return res.json({
              success: true,
              message: 'Votre compte est déjà vérifié. Vous pouvez vous connecter.',
              alreadyVerified: true,
              token: jwtToken,
              user: {
                id: userByEmail.id,
                email: userByEmail.email,
                name: userByEmail.name,
                avatar_url: userByEmail.avatar_url,
                provider: userByEmail.provider
              }
            });
          }
        }
        return res.status(400).json({ error: 'Lien de vérification invalide ou expiré.' });
      }

      await authDb.verifyUserEmail(user.id);

      // Générer le token JWT pour connecter l'utilisateur directement
      const jwtToken = generateToken(user);

      res.json({
        success: true,
        message: 'Email vérifié avec succès',
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          provider: user.provider
        }
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Connexion locale
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ error: info.message || 'Authentification échouée' });
      }

      // Vérifier si l'email est validé (pour les comptes locaux)
      if (user.provider === 'local' && !user.email_verified) {
        return res.status(403).json({
          error: 'Veuillez vérifier votre adresse email avant de vous connecter.',
          requireVerification: true
        });
      }

      try {
        // Mettre à jour le dernier login
        await authDb.updateLastLogin(user.id);

        // Générer le token
        const token = generateToken(user);

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            provider: user.provider
          }
        });
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    })(req, res, next);
  });

  // Connexion Google
  router.get('/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false
    })
  );

  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google Auth Error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=Erreur serveur lors de l'authentification Google`);
      }
      if (!user) {
        const message = info && info.message ? encodeURIComponent(info.message) : 'Échec de l\'authentification Google';
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${message}`);
      }

      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    })(req, res, next);
  });

  // Connexion Facebook
  router.get('/facebook',
    passport.authenticate('facebook', {
      scope: ['email'],
      session: false
    })
  );

  router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Facebook Auth Error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=Erreur serveur lors de l'authentification Facebook`);
      }
      if (!user) {
        const message = info && info.message ? encodeURIComponent(info.message) : 'Échec de l\'authentification Facebook';
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${message}`);
      }

      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    })(req, res, next);
  });

  // Obtenir l'utilisateur actuel
  router.get('/me', authenticateJWT, (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar_url: req.user.avatar_url,
        provider: req.user.provider
      }
    });
  });

  // Déconnexion
  router.post('/logout', (req, res) => {
    // Avec JWT, la déconnexion se fait côté client en supprimant le token
    res.json({ success: true, message: 'Déconnexion réussie' });
  });

  // Favoris - Ajouter
  router.post('/favorites', authenticateJWT, async (req, res) => {
    try {
      const { itemId, itemType } = req.body;

      if (!itemId || !itemType) {
        return res.status(400).json({ error: 'itemId et itemType requis' });
      }

      await authDb.addFavorite(req.user.id, itemId, itemType);
      res.json({ success: true, message: 'Ajouté aux favoris' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Favoris - Supprimer
  router.delete('/favorites/:itemType/:itemId', authenticateJWT, async (req, res) => {
    try {
      const { itemId, itemType } = req.params;

      await authDb.removeFavorite(req.user.id, parseInt(itemId), itemType);
      res.json({ success: true, message: 'Retiré des favoris' });
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Favoris - Liste
  router.get('/favorites/:itemType?', authenticateJWT, async (req, res) => {
    try {
      const { itemType } = req.params;
      const favorites = await authDb.getUserFavorites(req.user.id, itemType);
      res.json({ favorites });
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Vérifier si un item est favori
  router.get('/favorites/:itemType/:itemId/check', authenticateJWT, async (req, res) => {
    try {
      const { itemId, itemType } = req.params;
      const isFavorite = await authDb.isFavorite(req.user.id, parseInt(itemId), itemType);
      res.json({ isFavorite });
    } catch (error) {
      console.error('Erreur lors de la vérification du favori:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Historique - Ajouter
  router.post('/history', authenticateJWT, async (req, res) => {
    try {
      const { itemId, itemType } = req.body;

      if (!itemId || !itemType) {
        return res.status(400).json({ error: 'itemId et itemType requis' });
      }

      await authDb.addToHistory(req.user.id, itemId, itemType);
      res.json({ success: true });
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Historique - Liste
  router.get('/history/:itemType?', authenticateJWT, async (req, res) => {
    try {
      const { itemType } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const history = await authDb.getUserHistory(req.user.id, itemType, limit);
      res.json({ history });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  return router;
}

module.exports = createAuthRoutes;
