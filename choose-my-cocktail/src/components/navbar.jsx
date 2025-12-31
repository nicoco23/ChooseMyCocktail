import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isCocktailContext = path.includes('cocktail') || path.includes('/admin/cocktails');
  const isFoodContext = path.includes('food') || path.includes('/admin/food');

  const isHome = path === '/';

  const getNavClasses = () => {
    if (isFoodContext) {
      return "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-food-orange/20 shadow-sm";
    }
    return "sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-lg";
  };

  const getLogoClasses = () => {
    if (isFoodContext) {
      return "text-2xl font-display font-bold bg-gradient-to-r from-food-orange to-food-purple bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
    }
    return "text-2xl font-display font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity";
  };

  const isActive = (p) => {
    if (isFoodContext) {
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
            <div className="ml-10 flex items-baseline space-x-8">

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
                  <Link to="/admin/food" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/food')}`}>
                    Ajouter une recette
                  </Link>
                </>
              )}
              {isHome && (
                <span className="text-slate-500 text-sm italic">Choisissez votre univers</span>
              )}

            </div>
          </div>
          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
