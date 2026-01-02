import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token invalide
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Écouter les événements de connexion depuis d'autres onglets (ex: validation email)
    const channel = new BroadcastChannel('auth_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_SUCCESS' && event.data.token && event.data.user) {
        console.log('Authentification reçue depuis un autre onglet');
        localStorage.setItem('token', event.data.token);
        setToken(event.data.token);
        setUser(event.data.user);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Connexion locale
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si l'erreur nécessite une vérification, on renvoie l'info
        if (data.requireVerification) {
          return { success: false, error: data.error, requireVerification: true };
        }
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Inscription locale
  const register = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      if (data.requireVerification) {
        return { success: true, requireVerification: true, message: data.message };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Renvoyer l'email de vérification
  const resendVerificationEmail = async (email) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Vérification email
  const verifyEmail = async (token, email) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification');
      }

      if (data.alreadyVerified) {
        // Même si déjà vérifié, on connecte l'utilisateur si le token est présent
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user);
          return { success: true, alreadyVerified: true, message: data.message, token: data.token, user: data.user };
        }
        return { success: true, alreadyVerified: true, message: data.message };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, message: data.message, token: data.token, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Connexion OAuth (Google/Facebook)
  const loginWithOAuth = (provider) => {
    window.location.href = `http://localhost:3001/api/auth/${provider}`;
  };

  // Déconnexion
  const logout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Ajouter aux favoris
  const addFavorite = async (itemId, itemType) => {
    if (!token) return { success: false, error: 'Non authentifié' };

    try {
      const response = await fetch('http://localhost:3001/api/auth/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, itemType })
      });

      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Retirer des favoris
  const removeFavorite = async (itemId, itemType) => {
    if (!token) return { success: false, error: 'Non authentifié' };

    try {
      const response = await fetch(`http://localhost:3001/api/auth/favorites/${itemType}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Obtenir les favoris
  const getFavorites = async (itemType = null) => {
    if (!token) return { success: false, error: 'Non authentifié' };

    try {
      const url = itemType
        ? `http://localhost:3001/api/auth/favorites/${itemType}`
        : 'http://localhost:3001/api/auth/favorites';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { success: response.ok, favorites: data.favorites || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Vérifier si un item est favori
  const isFavorite = async (itemId, itemType) => {
    if (!token) return false;

    try {
      const response = await fetch(`http://localhost:3001/api/auth/favorites/${itemType}/${itemId}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.isFavorite || false;
    } catch (error) {
      return false;
    }
  };

  // Ajouter à l'historique
  const addToHistory = async (itemId, itemType) => {
    if (!token) return;

    try {
      await fetch('http://localhost:3001/api/auth/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, itemType })
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
    }
  };

  const value = {
    user,
    loading,
    token,
    isAuthenticated: !!user,
    login,
    register,
    loginWithOAuth,
    logout,
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
    addToHistory,
    verifyEmail,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
