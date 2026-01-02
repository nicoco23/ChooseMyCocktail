import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const { theme } = useTheme();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, already-verified
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token) {
        setStatus('error');
        setMessage('Lien de vérification invalide.');
        return;
      }

      // Prevent double execution in StrictMode
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      const result = await verifyEmail(token, email);

      if (result.success) {
        // Diffuser l'événement de connexion aux autres onglets
        if (result.token && result.user) {
          const channel = new BroadcastChannel('auth_channel');
          channel.postMessage({
            type: 'LOGIN_SUCCESS',
            token: result.token,
            user: result.user
          });
          channel.close();
        }

        if (result.alreadyVerified) {
          setStatus('already-verified');
          setMessage(result.message);
        } else {
          setStatus('success');
          setMessage(result.message || 'Votre email a été vérifié avec succès !');
          // On ne redirige plus automatiquement pour laisser l'utilisateur fermer l'onglet
          // ou voir le message
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Erreur lors de la vérification.');
      }
    };

    verify();
  }, [searchParams, verifyEmail]); // Removed navigate from dependency to avoid auto redirect logic conflict if we want to keep it open

  const isKitty = theme === 'kitty';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isKitty ? 'bg-hk-pink-pale' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl text-center ${
        isKitty ? 'bg-white border-4 border-hk-pink-light' : 'bg-white border border-gray-200'
      }`}>
        {status === 'verifying' && (
          <>
            <div className={`animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6 ${
              isKitty ? 'border-hk-pink-hot' : 'border-blue-500'
            }`}></div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Vérification en cours...</h2>
            <p className="text-gray-600">Veuillez patienter un instant.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isKitty ? 'bg-hk-pink-light/20' : 'bg-green-100'
            }`}>
              <svg className={`w-10 h-10 ${
                isKitty ? 'text-hk-pink-hot' : 'text-green-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Email Vérifié !</h2>
            <p className="text-gray-600 mb-6">Votre compte est activé. Vous êtes maintenant connecté sur votre onglet principal.</p>
            <p className="text-sm text-gray-500 mb-4">Vous pouvez fermer cette fenêtre.</p>
            <button
              onClick={() => navigate('/')}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                isKitty
                  ? 'bg-hk-pink-hot text-white hover:bg-hk-red-dark'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Aller à l'accueil
            </button>
          </>
        )}

        {status === 'already-verified' && (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isKitty ? 'bg-hk-blue-light/20' : 'bg-blue-100'
            }`}>
              <svg className={`w-10 h-10 ${
                isKitty ? 'text-hk-blue-dark' : 'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Déjà Vérifié</h2>
            <p className="text-gray-600 mb-6">Votre compte est déjà actif. Vous êtes connecté sur votre onglet principal.</p>
            <p className="text-sm text-gray-500 mb-4">Vous pouvez fermer cette fenêtre.</p>
            <button
              onClick={() => navigate('/')}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                isKitty
                  ? 'bg-hk-pink-hot text-white hover:bg-hk-red-dark'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Aller à l'accueil
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Échec de la vérification</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                isKitty
                  ? 'bg-hk-pink-hot text-white hover:bg-hk-red-dark'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
