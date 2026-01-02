import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

function Cocktail({ cocktail, onSelect, theme }) {
  const location = useLocation();
  const { favorites, toggleFavorite, ratings } = useUser();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');
  const category = (cocktail.category || '').toLowerCase();
  const isFavorite = favorites.has(cocktail.id);
  const userRating = ratings[cocktail.id];

  const isMissing = (ing) => {
    if (!cocktail.missingIngredients) return false;
    const name = (ing.nom || ing.alcool).toLowerCase();
    return cocktail.missingIngredients.includes(name);
  };

  const handleClick = () => {
    if (onSelect) onSelect(cocktail);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    await toggleFavorite(cocktail);
  };

  const handleKeyDown = (e) => {
    if (!onSelect) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(cocktail);
    }
  };

  const getCardClasses = () => {
    if (theme === 'kitty') {
      return "group bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-lg overflow-hidden hover:shadow-[0_10px_25px_rgba(255,105,180,0.5)] transition-all duration-300 border-4 border-hk-pink-light hover:border-hk-pink-hot h-full flex flex-col relative transform hover:-translate-y-2 font-display";
    }
    if (isFoodContext) {
      return "group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-food-orange/20 transition-all duration-300 border border-food-purple/10 hover:border-food-orange/30 h-full flex flex-col relative";
    }
    return "group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 border border-gray-200 hover:border-amber-500/50 h-full flex flex-col relative";
  };

  const getPlaceholderClasses = () => {
    if (theme === 'kitty') {
      return "absolute inset-0 bg-gradient-to-br from-hk-pink-light to-hk-pink-pale group-hover:scale-105 transition-transform duration-500 flex items-center justify-center";
    }
    if (isFoodContext) {
      return "absolute inset-0 bg-gradient-to-br from-food-yellow/20 to-food-orange/10 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center";
    }
    return "absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center";
  };

  const getSubtextClasses = () => {
    if (theme === 'kitty') return "text-hk-red-dark/60";
    return isFoodContext ? "text-food-dark/60" : "text-gray-500";
  };

  const getSectionTitleClasses = () => {
    if (theme === 'kitty') {
      return "text-xs font-semibold text-hk-red-light uppercase tracking-wider mb-3 mt-auto";
    }
    return isFoodContext
      ? "text-xs font-semibold text-food-orange uppercase tracking-wider mb-3 mt-auto"
      : "text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3 mt-auto";
  };

  const getIngredientTextClasses = (missing) => {
    if (missing) return "text-rose-500 font-medium";
    if (theme === 'kitty') return "text-hk-red-dark/80";
    return isFoodContext ? "text-food-dark/80" : "text-gray-600";
  };

  return (
    <div
      className={`block h-full ${onSelect ? 'cursor-pointer' : ''}`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={getCardClasses()}>

        {/* Category Badge */}
        {category && (
          <div className={`absolute top-3 left-3 z-10 text-xs font-bold px-2 py-1 rounded-full border shadow-sm ${
            category === 'mocktail' ? 'bg-green-900/90 text-green-100 border-green-700' :
            category === 'smoothie' ? 'bg-pink-900/90 text-pink-100 border-pink-700' :
            category === 'entrée' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700' :
            category === 'plat' ? 'bg-orange-900/90 text-orange-100 border-orange-700' :
            category === 'dessert' ? 'bg-purple-900/90 text-purple-100 border-purple-700' :
            category === 'food' ? 'bg-orange-900/90 text-orange-100 border-orange-700' :
            'bg-amber-900/90 text-amber-100 border-amber-700'
          }`}>
            {category === 'food' ? 'Plat' : category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        )}

        {/* Percentage Badge */}
        {cocktail.matchPercentage !== undefined && cocktail.matchPercentage < 100 && (
          <div className={`absolute top-3 right-3 z-10 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border shadow-sm ${
            theme === 'kitty'
              ? "bg-white/90 text-hk-red-dark border-hk-pink-light/20"
              : (isFoodContext
                ? "bg-white/90 text-food-dark border-food-purple/20"
                : "bg-gray-100/90 text-gray-900 border-gray-300")
          }`}>
            {cocktail.matchPercentage}%
          </div>
        )}

        <div className={`h-48 relative overflow-hidden flex-shrink-0 ${theme === 'kitty' ? 'bg-hk-pink-pale' : (isFoodContext ? 'bg-food-yellow/10' : 'bg-gray-200')}`}>
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm group/fav"
          >
            {isFavorite ? (
              <HeartIcon className="w-6 h-6 text-red-500 drop-shadow-sm" />
            ) : (
              <HeartOutline className="w-6 h-6 text-gray-400 group-hover/fav:text-red-400 transition-colors" />
            )}
          </button>

          {/* Placeholder gradient or image if available */}
          {cocktail.image ? (
              <img src={cocktail.image} alt={cocktail.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
              <div className={getPlaceholderClasses()}>
              <span className="text-6xl">
                {category === 'smoothie' ? '🥤' :
                 category === 'mocktail' ? '🍹' :
                 category === 'entrée' ? '🥗' :
                 category === 'plat' ? '🥘' :
                 category === 'dessert' ? '🍰' :
                 (isFoodContext ? '🍽️' : '🍸')}
              </span>
              </div>
          )}
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : (isFoodContext ? 'text-food-dark' : 'text-gray-900')}`}>{cocktail.name || cocktail.nom}</h3>
          </div>

          {/* User Rating */}
          {userRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < userRating ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          )}

          {(cocktail.total || cocktail.duree) && (
            <div className={`flex items-center text-xs mb-3 font-medium ${getSubtextClasses()}`}>
              <span className="mr-1.5">⏱️</span>
              <span>{cocktail.total || cocktail.duree}</span>
            </div>
          )}

          {cocktail.description && (
              <p className={`text-sm mb-4 line-clamp-3 italic ${getSubtextClasses()}`}>
                  {cocktail.description}
              </p>
          )}

          <h4 className={getSectionTitleClasses()}>Ingrédients</h4>
          <div className="space-y-2">
            {cocktail.ingredients.slice(0, 4).map((ingredient, idx) => {
               const missing = isMissing(ingredient);
               return (
                <div key={idx} className={`flex items-center justify-between text-sm ${getIngredientTextClasses(missing)}`}>
                   <div className="flex items-center">
                     {missing && <span className="mr-2 text-xs bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded">Manquant</span>}
                     <span>{ingredient.nom || ingredient.alcool}</span>
                   </div>
                   <span className={`text-xs ${theme === 'kitty' ? 'text-hk-red-dark/50' : (isFoodContext ? 'text-food-dark/50' : 'text-gray-500')}`}>{ingredient.dose}</span>
                </div>
               );
            })}
            {cocktail.ingredients.length > 4 && (
              <p className={`text-xs mt-2 pt-2 border-t ${theme === 'kitty' ? 'text-hk-red-dark/40 border-hk-pink-light/20' : (isFoodContext ? 'text-food-dark/40 border-food-purple/10' : 'text-slate-500 border-slate-700')}`}>
                + {cocktail.ingredients.length - 4} autres ingrédients...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cocktail;
