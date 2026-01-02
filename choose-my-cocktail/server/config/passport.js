const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

module.exports = function(authDb) {

  // Stratégie Locale (email/password)
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await authDb.findUserByEmail(email);

      if (!user) {
        return done(null, false, { message: 'Email ou mot de passe incorrect' });
      }

      if (!user.password_hash) {
        return done(null, false, { message: 'Utilisez la connexion sociale (Google/Facebook)' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return done(null, false, { message: 'Email ou mot de passe incorrect' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Stratégie Google OAuth
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Chercher l'utilisateur existant
      let user = await authDb.findUserByProvider('google', profile.id);

      if (!user) {
        // Vérifier si l'email est déjà utilisé par un autre compte
        const email = profile.emails[0].value;
        const existingUser = await authDb.findUserByEmail(email);

        if (existingUser) {
          return done(null, false, { message: 'Un compte existe déjà avec cet email. Veuillez vous connecter avec votre méthode habituelle.' });
        }

        // Créer un nouvel utilisateur
        user = await authDb.createUser({
          email: email,
          name: profile.displayName,
          avatar_url: profile.photos[0]?.value,
          provider: 'google',
          provider_id: profile.id,
          password_hash: null
        });
      }

      // Mettre à jour le dernier login
      await authDb.updateLastLogin(user.id);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Stratégie Facebook OAuth
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Chercher l'utilisateur existant
      let user = await authDb.findUserByProvider('facebook', profile.id);

      if (!user) {
        // Vérifier si l'email est déjà utilisé par un autre compte
        const email = profile.emails?.[0]?.value;

        if (email) {
          const existingUser = await authDb.findUserByEmail(email);
          if (existingUser) {
            return done(null, false, { message: 'Un compte existe déjà avec cet email. Veuillez vous connecter avec votre méthode habituelle.' });
          }
        }

        // Créer un nouvel utilisateur
        user = await authDb.createUser({
          email: email || `${profile.id}@facebook.com`,
          name: profile.displayName,
          avatar_url: profile.photos?.[0]?.value,
          provider: 'facebook',
          provider_id: profile.id,
          password_hash: null
        });
      }

      // Mettre à jour le dernier login
      await authDb.updateLastLogin(user.id);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Stratégie JWT
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await authDb.findUserById(jwt_payload.id);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }));

  // Sérialisation pour les sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await authDb.findUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
