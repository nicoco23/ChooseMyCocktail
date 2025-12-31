import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Ingredient from './Ingredients';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

function CocktailModal({ cocktail, onClose, theme, userIngredients = [] }) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [copiedMissing, setCopiedMissing] = useState(false);
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');
  const category = (cocktail.category || '').toLowerCase();

  if (!cocktail) return null;

  const handleCopyIngredients = () => {
    const ingredientsText = cocktail.ingredients
      .map(i => `${i.dose ? i.dose + ' ' : ''}${i.nom || i.alcool}`)
      .join('\n');
    const serviceName = isFoodContext ? "ChooseMyFood" : "ChooseMyCocktail";
    const text = `Ingrédients pour ${cocktail.nom} :\n${ingredientsText}\n\nTrouvé sur ${serviceName} 🍽️🍹`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMissingIngredients = () => {
    const missing = cocktail.ingredients.filter(ing => {
      const name = ing.nom || ing.alcool;
      return !userIngredients.some(userIng => userIng.toLowerCase() === name.toLowerCase());
    });

    const ingredientsText = missing
      .map(i => `${i.dose ? i.dose + ' ' : ''}${i.nom || i.alcool}`)
      .join('\n');

    const serviceName = isFoodContext ? "ChooseMyFood" : "ChooseMyCocktail";
    const text = `Liste de courses pour ${cocktail.nom} :\n${ingredientsText}\n\nTrouvé sur ${serviceName} 🍽️🍹`;
    navigator.clipboard.writeText(text);
    setCopiedMissing(true);
    setTimeout(() => setCopiedMissing(false), 2000);
  };

  const getModalClasses = () => {
    if (theme === 'kitty') {
      return "relative w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-hk-pink-hot shadow-[0_0_15px_rgba(255,105,180,0.3)] overflow-hidden font-display";
    }
    if (isFoodContext) {
      return "relative w-full max-w-3xl bg-white rounded-2xl border border-food-purple/10 shadow-2xl overflow-hidden";
    }
    return "relative w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden";
  };

  const getButtonClasses = () => {
    if (theme === 'kitty') {
      return "absolute top-4 right-4 z-10 text-hk-red-dark hover:text-hk-pink-hot transition-colors bg-white/80 border-2 border-hk-pink-light rounded-full p-2 shadow-md";
    }
    if (isFoodContext) {
      return "absolute top-4 right-4 z-10 text-food-dark/60 hover:text-food-dark transition-colors bg-white/60 border border-food-purple/10 rounded-full p-2";
    }
    return "absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-700 rounded-full p-2";
  };

  const getPlaceholderClasses = () => {
    if (theme === 'kitty') {
      return "w-full h-full bg-gradient-to-br from-hk-pink-light to-hk-pink-pale flex items-center justify-center";
    }
    if (isFoodContext) {
      return "w-full h-full bg-gradient-to-br from-food-yellow/20 to-food-orange/10 flex items-center justify-center";
    }
    return "w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center";
  };

  const getOverlayClasses = () => {
    if (theme === 'kitty') {
      return "absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent";
    }
    if (isFoodContext) {
      return "absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent";
    }
    return "absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent";
  };

  const getTitleClasses = () => {
    if (theme === 'kitty') return "text-4xl font-extrabold text-hk-red-dark drop-shadow-md";
    return isFoodContext ? "text-3xl font-extrabold text-food-dark drop-shadow-sm" : "text-3xl font-extrabold text-white drop-shadow";
  };

  const getSubtextClasses = () => {
    if (theme === 'kitty') return "flex items-center gap-4 mt-2 text-sm text-hk-red-dark/80";
    return isFoodContext ? "flex items-center gap-4 mt-2 text-sm text-food-dark/80" : "flex items-center gap-4 mt-2 text-sm text-slate-300";
  };

  const getBadgeClasses = () => {
    if (theme === 'kitty') {
      return "bg-white/50 px-2 py-1 rounded backdrop-blur-sm border border-hk-pink-light/20 text-hk-red-dark";
    }
    if (isFoodContext) {
      return "bg-white/50 px-2 py-1 rounded backdrop-blur-sm border border-food-purple/20 text-food-dark";
    }
    return "bg-slate-800/50 px-2 py-1 rounded backdrop-blur-sm border border-slate-600";
  };

  const getSectionTitleClasses = () => {
    if (theme === 'kitty') return "text-xl font-bold text-hk-red-light mb-3";
    return isFoodContext ? "text-xl font-bold text-food-orange mb-3" : "text-xl font-bold text-amber-500 mb-3";
  };

  const getStepBoxClasses = () => {
    if (theme === 'kitty') {
      return "bg-hk-pink-pale/30 p-3 rounded-lg border border-hk-pink-light/20";
    }
    if (isFoodContext) {
      return "bg-food-yellow/10 p-3 rounded-lg border border-food-purple/10";
    }
    return "bg-slate-700/30 p-3 rounded-lg border border-slate-700/50";
  };

  const getStepTitleClasses = () => {
    if (theme === 'kitty') return "text-sm font-bold text-hk-red-light uppercase tracking-wide mb-1";
    return isFoodContext ? "text-sm font-bold text-food-orange uppercase tracking-wide mb-1" : "text-sm font-bold text-amber-400 uppercase tracking-wide mb-1";
  };

  const getBodyTextClasses = () => {
    if (theme === 'kitty') return "text-hk-red-dark/90 leading-relaxed text-sm";
    return isFoodContext ? "text-food-dark/90 leading-relaxed text-sm" : "text-slate-200 leading-relaxed text-sm";
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full justify-center p-4 text-center items-start pt-4 md:items-center">
        <div
          className={`fixed inset-0 backdrop-blur-sm ${theme === 'kitty' ? 'bg-hk-pink-pale/60' : (isFoodContext ? 'bg-white/60' : 'bg-slate-900/80')}`}
          onClick={onClose}
        />

        <div
          className={`${getModalClasses()} transform transition-all text-left`}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className={getButtonClasses()}
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

        <div className="p-6 pb-0">
            <h1 className={getTitleClasses()}>{cocktail.nom}</h1>
            {cocktail.description && (
              <p className={`mt-2 text-lg italic ${isFoodContext ? 'text-food-dark/70' : 'text-slate-400'}`}>
                {cocktail.description}
              </p>
            )}
        </div>

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
                <span className="text-7xl">
                {category === 'smoothie' ? '🥤' :
                 category === 'mocktail' ? '🍹' :
                 category === 'entrée' ? '🥗' :
                 category === 'plat' ? '🥘' :
                 category === 'dessert' ? '🍰' :
                 (isFoodContext ? '🍽️' : '🍸')}
                </span>
              </div>
            )}
            <div className={getOverlayClasses()}></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className={getSubtextClasses()}>
                {/* Category Badge */}
                {category && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border shadow-sm mr-2 ${
                    category === 'mocktail' ? 'bg-green-900/90 text-green-100 border-green-700' :
                    category === 'smoothie' ? 'bg-pink-900/90 text-pink-100 border-pink-700' :
                    category === 'entrée' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700' :
                    category === 'plat' ? 'bg-orange-900/90 text-orange-100 border-orange-700' :
                    category === 'dessert' ? 'bg-purple-900/90 text-purple-100 border-purple-700' :
                    category === 'food' ? 'bg-orange-900/90 text-orange-100 border-orange-700' :
                    'bg-amber-900/90 text-amber-100 border-amber-700'
                  }`}>
                    {category === 'food' ? 'Plat' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                )}
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
                      theme === 'kitty'
                        ? "bg-hk-pink-pale text-hk-red-dark border-hk-pink-light/30"
                        : (isFoodContext
                          ? "bg-food-yellow/20 text-food-dark border-food-purple/20"
                          : "bg-blue-900/50 text-blue-100 border-blue-700")
                    }`}>
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {cocktail.tags && cocktail.tags.length > 0 && (
              <div>
                <h2 className={getSectionTitleClasses()}>Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {cocktail.tags.map((tag, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                      theme === 'kitty'
                        ? "bg-hk-pink-pale text-hk-red-dark border-hk-pink-light/30"
                        : (isFoodContext
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-slate-700 text-slate-300 border-slate-600")
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={getSectionTitleClasses().replace('mb-3', '')}>Ingrédients</h2>
                <div className="flex gap-2">
                  {userIngredients.length > 0 && (
                    <button
                      onClick={handleCopyMissingIngredients}
                      className={`p-1.5 rounded-full transition-colors ${
                        theme === 'kitty'
                          ? 'text-hk-blue-light hover:bg-hk-pink-pale hover:text-hk-blue-dark'
                          : (isFoodContext
                            ? 'text-food-purple hover:bg-food-yellow/20 hover:text-food-orange'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-white')
                      }`}
                      title="Copier la liste de courses (sans ce que j'ai déjà)"
                    >
                      {copiedMissing ? <CheckIcon className="h-5 w-5" /> : <ShoppingCartIcon className="h-5 w-5" />}
                    </button>
                  )}
                  <button
                    onClick={handleCopyIngredients}
                    className={`p-1.5 rounded-full transition-colors ${
                      theme === 'kitty'
                        ? 'text-hk-blue-light hover:bg-hk-pink-pale hover:text-hk-blue-dark'
                        : (isFoodContext
                          ? 'text-food-purple hover:bg-food-yellow/20 hover:text-food-orange'
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white')
                    }`}
                    title="Copier tous les ingrédients"
                  >
                    {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
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

            {(() => {
              let steps = cocktail.etapes || cocktail.steps;
              if (typeof steps === 'string') {
                try { steps = JSON.parse(steps); } catch (e) {}
              }

              const hasSteps = Array.isArray(steps) && steps.length > 0;
              const hasText = cocktail.recette || cocktail.description;

              if (!hasSteps && !hasText) return null;

              return (
                <div>
                  <h2 className={getSectionTitleClasses()}>Préparation</h2>
                  {hasSteps ? (
                    <div className="space-y-4">
                      {steps.map((step, idx) => (
                        <div key={idx} className={getStepBoxClasses()}>
                          <h3 className={getStepTitleClasses()}>
                            {step.titre || `Étape ${idx + 1}`}
                          </h3>
                          <p className={getBodyTextClasses()}>
                            {step.description || (typeof step === 'string' ? step : '')}
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
              );
            })()}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default CocktailModal;
