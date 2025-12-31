import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const path = location.pathname;

  const isCocktailContext = path.includes('cocktail') || path.includes('/admin/cocktails');
  const isFoodContext = path.includes('food') || path.includes('/admin/food') || path.includes('/submit-recipe');

  const isHome = path === '/';

  const getNavClasses = () => {
    if (isFoodContext) {
      if (theme === 'kitty') {
        return "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-hk-pink-light/50 shadow-sm shadow-hk-red-light/10";
      }
      return "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-food-orange/20 shadow-sm";
    }
    return "sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-lg";
  };

  const getLogoClasses = () => {
    if (isFoodContext) {
      if (theme === 'kitty') {
        return "text-2xl font-display font-bold bg-gradient-to-r from-hk-red-light to-hk-red-dark bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
      }
      return "text-2xl font-display font-bold bg-gradient-to-r from-food-orange to-food-purple bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
    }
    return "text-2xl font-display font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
  };

  const isActive = (p) => {
    if (isFoodContext) {
      if (theme === 'kitty') {
        return path === p
          ? "text-hk-red-dark font-bold"
          : "text-hk-red-dark/60 hover:text-hk-red-light transition-colors";
      }
      return path === p
        ? "text-food-orange font-bold"
        : "text-food-dark/60 hover:text-food-purple transition-colors";
    }
    return path === p
      ? "text-amber-500 font-bold"
      : "text-gray-300 hover:text-white transition-colors";
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
                  <Link to="/admin/cocktails" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/cocktails')}`}>
                    Ajouter une recette
                  </Link>
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
                  <Link to="/submit-recipe" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/submit-recipe')}`}>
                    Proposer une recette
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className={`ml-4 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 border ${
                      theme === 'kitty'
                        ? 'bg-hk-red-light text-white border-hk-red-light hover:bg-hk-pink-pale hover:text-hk-red-dark'
                        : 'bg-food-yellow text-food-dark border-food-yellow hover:bg-food-orange hover:text-white'
                    }`}
                  >
                    {theme === 'kitty' ? '🎀 Hello Kitty' : '🍮 Mode Crème'}
                  </button>
                </>
              )}
              {isHome && (
                <span className="text-slate-500 text-sm italic">Choisissez votre univers</span>
              )}

            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isFoodContext
                  ? (theme === 'kitty' ? 'text-hk-red-dark hover:text-hk-red-light hover:bg-hk-pink-pale' : 'text-food-dark hover:text-food-orange hover:bg-food-yellow/10')
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            : 'bg-slate-900 border-b border-slate-800'
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
                </>
              )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
