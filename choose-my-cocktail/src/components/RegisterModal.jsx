import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register, loginWithOAuth, resendVerificationEmail } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.password, formData.name);

    if (result.success) {
      if (result.requireVerification) {
        setSuccessMessage(result.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        onClose();
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    const result = await resendVerificationEmail(formData.email);
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Email renvoyé avec succès !');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error);
    }
  };

  const handleOAuthLogin = (provider) => {
    loginWithOAuth(provider);
  };

  const isKitty = theme === 'kitty';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[80vh] overflow-y-auto ${
          isKitty ? 'border-4 border-hk-pink-light shadow-[0_10px_40px_rgba(255,105,180,0.3)]' : 'border border-gray-200 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Titre */}
        <h2 className={`text-3xl font-bold mb-6 text-center ${
          isKitty ? 'text-hk-red-dark font-fredoka' : 'text-gray-800'
        }`}>
          {isKitty ? '🌸 Inscription 🌸' : 'Inscription'}
        </h2>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Succès */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
            <div className="mt-2">
              <button
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || loading}
                className={`text-xs underline ${
                  resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-800 hover:text-green-900'
                }`}
              >
                {resendCooldown > 0
                  ? `Renvoyer l'email dans ${resendCooldown}s`
                  : "Je n'ai rien reçu, renvoyer l'email"}
              </button>
            </div>
          </div>
        )}

        {/* Formulaire */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pseudo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  isKitty
                    ? 'border-hk-pink-light focus:ring-hk-pink-hot'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Votre pseudo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  isKitty
                    ? 'border-hk-pink-light focus:ring-hk-pink-hot'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  isKitty
                    ? 'border-hk-pink-light focus:ring-hk-pink-hot'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  isKitty
                    ? 'border-hk-pink-light focus:ring-hk-pink-hot'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isKitty
                  ? 'bg-hk-pink-hot text-white hover:bg-hk-red-dark'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
        )}

        {/* Divider */}
        {!successMessage && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        {!successMessage && (
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button
              onClick={() => handleOAuthLogin('facebook')}
              className="w-full py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        )}

        {/* Lien vers connexion */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className={`font-semibold ${
              isKitty ? 'text-hk-pink-hot hover:text-hk-red-dark' : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
};

export default RegisterModal;
