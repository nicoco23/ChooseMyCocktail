const passport = require('passport');

// Middleware pour protéger les routes avec JWT
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware optionnel - ajoute l'utilisateur si connecté, sinon continue
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Vérifier si l'utilisateur est authentifié
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
};

module.exports = {
  authenticateJWT,
  optionalAuth,
  isAuthenticated
};
