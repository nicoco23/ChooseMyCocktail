import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const path = location.pathname;

  const isCocktailContext = path.includes('cocktail') || path.includes('/admin/cocktails') || path === '/admin/users';
  const isFoodContext = path.includes('food') || path.includes('/admin/food') || path.includes('/submit-recipe') || path.includes('/pairings');
  const isAdminPage = path.includes('/admin');

  const isHome = path === '/';

  const getNavClasses = () => {
    if (theme === 'kitty') {
      return "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-hk-pink-light/50 shadow-sm shadow-hk-red-light/10 font-display";
    }
    if (isFoodContext) {
      return "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-food-orange/20 shadow-sm";
    }
    return "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg";
  };

  const getLogoClasses = () => {
    if (theme === 'kitty') {
      return "text-2xl font-display font-bold bg-gradient-to-r from-hk-red-light to-hk-red-dark bg-clip-text text-transparent group-hover:opacity-80 transition-opacity drop-shadow-sm";
    }
    if (isFoodContext) {
      return "text-2xl font-display font-bold bg-gradient-to-r from-food-orange to-food-purple bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
    }
    return "text-2xl font-display font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
  };

  const isActive = (p) => {
    if (theme === 'kitty') {
      return path === p
        ? "text-hk-red-dark font-bold"
        : "text-hk-red-dark/60 hover:text-hk-red-light transition-colors";
    }
    if (isFoodContext) {
      return path === p
        ? "text-food-orange font-bold"
        : "text-food-dark/60 hover:text-food-purple transition-colors";
    }
    return path === p
      ? "text-amber-500 font-bold"
      : "text-gray-600 hover:text-amber-600 transition-colors";
  };

  return (
    <nav className={getNavClasses()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <span className={getLogoClasses()}>
                ChooseMy...
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">

              {/* Liens Cocktails */}
              {(isCocktailContext && !isHome) && (
                <>
                  <Link to="/cocktails" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/cocktails')}`}>
                    Mon Bar
                  </Link>
                  <Link to="/all-cocktails" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/all-cocktails')}`}>
                    Tous les Cocktails
                  </Link>
                  <Link to="/submit-cocktail" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/submit-cocktail')}`}>
                    Proposer un cocktail
                  </Link>
                  <Link to="/admin/cocktails" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/cocktails')}`}>
                    Admin
                  </Link>
                  {isAdminPage && (
                    <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/users')}`}>
                      Utilisateurs
                    </Link>
                  )}
                </>
              )}

              {/* Liens Cuisine */}
              {(isFoodContext && !isHome) && (
                <>
                  <Link to="/food" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/food')}`}>
                    Mon Frigo
                  </Link>
                  <Link to="/all-food" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/all-food')}`}>
                    Toutes les Recettes
                  </Link>
                  <Link to="/pairings" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/pairings')}`}>
                    🍷 Accords
                  </Link>
                  <Link to="/submit-recipe" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/submit-recipe')}`}>
                    Proposer une recette
                  </Link>
                  <Link to="/admin/food" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/food')}`}>
                    Admin
                  </Link>
                  {isAdminPage && (
                    <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/users')}`}>
                      Utilisateurs
                    </Link>
                  )}
                </>
              )}
              {isHome && (
                <span className="text-slate-500 text-sm italic">Choisissez votre univers</span>
              )}

              {/* Auth Section */}
              <div className="ml-4 flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 border ${
                      theme === 'kitty'
                        ? 'bg-hk-red-light text-white border-hk-red-light hover:bg-hk-pink-pale hover:text-hk-red-dark'
                        : 'bg-food-yellow text-food-dark border-food-yellow hover:bg-food-orange hover:text-white'
                    }`}
                  >
                    {theme === 'kitty' ? '🎀 Hello Kitty' : '🍮 Mode Crème'}
                  </button>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-8 h-8" />
                      )}
                      <span className={`text-sm font-medium ${
                        theme === 'kitty' ? 'text-hk-red-dark' : isFoodContext ? 'text-food-dark' : 'text-gray-700'
                      }`}>
                        {user?.name || 'Utilisateur'}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mon Profil
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme === 'kitty'
                          ? 'text-hk-red-dark hover:bg-hk-pink-pale'
                          : isFoodContext
                          ? 'text-food-dark hover:bg-food-yellow/20'
                          : 'text-gray-600 hover:text-amber-600 hover:bg-gray-100'
                      }`}
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                        theme === 'kitty'
                          ? 'bg-hk-pink-hot hover:bg-hk-red-dark'
                          : isFoodContext
                          ? 'bg-food-orange hover:bg-food-purple'
                          : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      Inscription
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isFoodContext
                  ? (theme === 'kitty' ? 'text-hk-red-dark hover:text-hk-red-light hover:bg-hk-pink-pale' : 'text-food-dark hover:text-food-orange hover:bg-food-yellow/10')
                  : 'text-gray-500 hover:text-amber-600 hover:bg-gray-100'
              } focus:outline-none`}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden ${
          isFoodContext
            ? (theme === 'kitty' ? 'bg-white border-b border-hk-pink-light/50' : 'bg-white border-b border-food-purple/10')
            : 'bg-white border-b border-gray-200'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* Liens Cocktails */}
             {(isCocktailContext && !isHome) && (
                <>
                  <Link
                    to="/cocktails"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/cocktails')}`}
                  >
                    Mon Bar
                  </Link>
                  <Link
                    to="/all-cocktails"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/all-cocktails')}`}
                  >
                    Tous les Cocktails
                  </Link>
                  <Link
                    to="/admin/cocktails"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/cocktails')}`}
                  >
                    Ajouter une recette
                  </Link>
                </>
              )}

              {/* Liens Cuisine */}
              {(isFoodContext && !isHome) && (
                <>
                  <Link
                    to="/food"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/food')}`}
                  >
                    Mon Frigo
                  </Link>
                  <Link
                    to="/all-food"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/all-food')}`}
                  >
                    Toutes les Recettes
                  </Link>
                  <Link
                    to="/submit-recipe"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/submit-recipe')}`}
                  >
                    Proposer une recette
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className={`w-full text-left mt-2 px-3 py-2 rounded-md text-base font-bold border ${
                  theme === 'kitty'
                    ? 'bg-hk-pink-light text-white border-hk-pink-light'
                    : 'bg-food-yellow text-food-dark border-food-yellow'
                }`}
              >
                {theme === 'kitty' ? '🎀 Hello Kitty' : '🍮 Mode Crème'}
              </button>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </nav>
  );
}

export default Navbar;
