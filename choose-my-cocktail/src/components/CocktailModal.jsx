import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Ingredient from './Ingredients';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

function CocktailModal({ cocktail, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');

  if (!cocktail) return null;

  const handleEdit = () => {
    navigate('/admin/food', { state: { recipeToEdit: cocktail } });
  };

  const getModalClasses = () => {
    if (isFoodContext) {
      return "relative w-full max-w-3xl bg-white rounded-2xl border border-food-purple/10 shadow-2xl overflow-hidden";
    }
    return "relative w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden";
  };

  const getButtonClasses = () => {
    if (isFoodContext) {
      return "absolute top-4 right-4 z-10 text-food-dark/60 hover:text-food-dark transition-colors bg-white/60 border border-food-purple/10 rounded-full p-2";
    }
    return "absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-700 rounded-full p-2";
  };

  const getEditButtonClasses = () => {
    if (isFoodContext) {
      return "absolute top-4 right-16 z-10 text-food-orange hover:text-food-orange/80 transition-colors bg-white/60 border border-food-purple/10 rounded-full p-2";
    }
    return "absolute top-4 right-16 z-10 text-amber-500 hover:text-amber-400 transition-colors bg-slate-900/60 border border-slate-700 rounded-full p-2";
  };

  const getPlaceholderClasses = () => {
    if (isFoodContext) {
      return "w-full h-full bg-gradient-to-br from-food-yellow/20 to-food-orange/10 flex items-center justify-center";
    }
    return "w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center";
  };

  const getOverlayClasses = () => {
    if (isFoodContext) {
      return "absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent";
    }
    return "absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent";
  };

  const getTitleClasses = () => {
    return isFoodContext ? "text-3xl font-extrabold text-food-dark drop-shadow-sm" : "text-3xl font-extrabold text-white drop-shadow";
  };

  const getSubtextClasses = () => {
    return isFoodContext ? "flex items-center gap-4 mt-2 text-sm text-food-dark/80" : "flex items-center gap-4 mt-2 text-sm text-slate-300";
  };

  const getBadgeClasses = () => {
    if (isFoodContext) {
      return "bg-white/50 px-2 py-1 rounded backdrop-blur-sm border border-food-purple/20 text-food-dark";
    }
    return "bg-slate-800/50 px-2 py-1 rounded backdrop-blur-sm border border-slate-600";
  };

  const getSectionTitleClasses = () => {
    return isFoodContext ? "text-xl font-bold text-food-orange mb-3" : "text-xl font-bold text-amber-500 mb-3";
  };

  const getStepBoxClasses = () => {
    if (isFoodContext) {
      return "bg-food-yellow/10 p-3 rounded-lg border border-food-purple/10";
    }
    return "bg-slate-700/30 p-3 rounded-lg border border-slate-700/50";
  };

  const getStepTitleClasses = () => {
    return isFoodContext ? "text-sm font-bold text-food-orange uppercase tracking-wide mb-1" : "text-sm font-bold text-amber-400 uppercase tracking-wide mb-1";
  };

  const getBodyTextClasses = () => {
    return isFoodContext ? "text-food-dark/90 leading-relaxed text-sm" : "text-slate-200 leading-relaxed text-sm";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${isFoodContext ? 'bg-white/60' : 'bg-slate-900/80'}`}
        onClick={onClose}
      />

      <div
        className={getModalClasses()}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={getButtonClasses()}
          aria-label="Fermer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Edit Button (only for DB recipes) */}
        {cocktail.id && (
          <button
            onClick={handleEdit}
            className={getEditButtonClasses()}
            aria-label="Modifier"
            title="Modifier la recette"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        )}

        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-full">
            {cocktail.image ? (
              <img
                src={cocktail.image}
                alt={cocktail.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={getPlaceholderClasses()}>
                <span className="text-7xl">🍸</span>
              </div>
            )}
            <div className={getOverlayClasses()}></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className={getTitleClasses()}>{cocktail.nom}</h1>
              <div className={getSubtextClasses()}>
                {cocktail.matchPercentage !== undefined && (
                  <span className={getBadgeClasses()}>
                    Compatibilité : {cocktail.matchPercentage}%
                  </span>
                )}
                {(cocktail.total || cocktail.duree) && (
                  <span className="flex items-center">
                    <span className="mr-1">⏱️</span> {cocktail.total || cocktail.duree}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Time Breakdown */}
            {(cocktail.preparation || cocktail.cuisson) && (
              <div className={`flex gap-4 text-sm ${isFoodContext ? 'bg-food-yellow/10 border-food-purple/10' : 'bg-slate-700/30 border-slate-700/50'} p-3 rounded-lg border`}>
                {cocktail.preparation && (
                  <div className="flex flex-col">
                    <span className={`${isFoodContext ? 'text-food-dark/60' : 'text-slate-400'} text-xs uppercase`}>Préparation</span>
                    <span className={`font-medium ${isFoodContext ? 'text-food-dark/90' : 'text-slate-200'}`}>{cocktail.preparation}</span>
                  </div>
                )}
                {cocktail.cuisson && (
                  <div className={`flex flex-col border-l ${isFoodContext ? 'border-food-purple/10' : 'border-slate-600'} pl-4`}>
                    <span className={`${isFoodContext ? 'text-food-dark/60' : 'text-slate-400'} text-xs uppercase`}>Cuisson</span>
                    <span className={`font-medium ${isFoodContext ? 'text-food-dark/90' : 'text-slate-200'}`}>{cocktail.cuisson}</span>
                  </div>
                )}
                {cocktail.total && (
                  <div className={`flex flex-col border-l ${isFoodContext ? 'border-food-purple/10' : 'border-slate-600'} pl-4`}>
                    <span className={`${isFoodContext ? 'text-food-dark/60' : 'text-slate-400'} text-xs uppercase`}>Total</span>
                    <span className={`font-medium ${isFoodContext ? 'text-food-orange' : 'text-amber-400'}`}>{cocktail.total}</span>
                  </div>
                )}
              </div>
            )}

            {/* Equipment Section */}
            {cocktail.equipment && cocktail.equipment.length > 0 && (
              <div>
                <h2 className={getSectionTitleClasses()}>Matériel</h2>
                <div className="flex flex-wrap gap-2">
                  {cocktail.equipment.map((eq, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                      isFoodContext
                        ? "bg-food-yellow/20 text-food-dark border-food-purple/20"
                        : "bg-blue-900/50 text-blue-100 border-blue-700"
                    }`}>
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className={getSectionTitleClasses()}>Ingrédients</h2>
              <div className="space-y-2">
                {cocktail.ingredients.map((ingredient, idx) => (
                  <Ingredient
                    key={idx}
                    name={ingredient.nom}
                    alcohol={ingredient.alcool}
                    dose={ingredient.dose}
                  />
                ))}
              </div>
              {cocktail.missingIngredients && cocktail.missingIngredients.length > 0 && (
                <p className={`text-sm ${isFoodContext ? 'text-food-yellow' : 'text-amber-300'} mt-3 italic`}>
                  À acheter : {cocktail.missingIngredients.join(', ')}.
                </p>
              )}
            </div>

            {(cocktail.etapes || cocktail.recette || cocktail.description) && (
              <div>
                <h2 className={getSectionTitleClasses()}>Préparation</h2>
                {cocktail.etapes ? (
                  <div className="space-y-4">
                    {cocktail.etapes.map((step, idx) => (
                      <div key={idx} className={getStepBoxClasses()}>
                        <h3 className={getStepTitleClasses()}>
                          {step.titre || `Étape ${idx + 1}`}
                        </h3>
                        <p className={getBodyTextClasses()}>
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${getBodyTextClasses()} whitespace-pre-line`}>
                    {cocktail.recette || cocktail.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CocktailModal;
