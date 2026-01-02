import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cocktailService } from '../services/cocktailService';
import Ingredient from '../components/Ingredients';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useTheme } from '../context/ThemeContext';

function CocktailDetailsPage() {
  const { name } = useParams();
  const [cocktail, setCocktail] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const allCocktails = cocktailService.getAllCocktails();
    const foundCocktail = allCocktails.find(c => c.nom === name);
    setCocktail(foundCocktail);
  }, [name]);

  if (!cocktail) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'kitty' ? 'bg-hk-pink-pale text-hk-red-dark' : 'bg-gray-50 text-gray-900'}`}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${theme === 'kitty' ? "bg-hk-pink-pale font-display bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/all-cocktails" className={`inline-flex items-center mb-8 transition-colors ${theme === 'kitty' ? 'text-hk-red-light hover:text-hk-red-dark' : 'text-amber-600 hover:text-amber-700'}`}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux cocktails
        </Link>

        <div className={`rounded-2xl shadow-2xl overflow-hidden ${theme === 'kitty' ? 'bg-white/90 backdrop-blur-sm border-2 border-hk-pink-hot shadow-[0_0_15px_rgba(255,105,180,0.3)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
          <div className="relative h-96">
             {cocktail.image ? (
                <img
                  src={cocktail.image}
                  alt={cocktail.nom}
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className={`w-full h-full flex items-center justify-center ${theme === 'kitty' ? 'bg-gradient-to-br from-hk-pink-light to-hk-pink-pale' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                    <span className="text-9xl">🍸</span>
                </div>
             )}
            <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'kitty' ? 'from-hk-red-dark/90 via-hk-pink-hot/20 to-transparent' : 'from-gray-900 via-transparent to-transparent'}`}></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{cocktail.nom}</h1>
              {(cocktail.total || cocktail.duree) && (
                  <div className="flex items-center text-white/95 text-lg mt-2 font-medium drop-shadow-md">
                    <span className="mr-2">⏱️</span>
                    <span>{cocktail.total || cocktail.duree}</span>
                  </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Time Breakdown for Details Page */}
            {(cocktail.preparation || cocktail.cuisson) && (
              <div className={`flex flex-wrap gap-8 mb-8 p-4 rounded-xl border ${theme === 'kitty' ? 'bg-hk-pink-pale/50 border-hk-pink-light/50' : 'bg-gray-100 border-gray-200'}`}>
                {cocktail.preparation && (
                  <div>
                    <span className={`block text-xs uppercase tracking-wider mb-1 ${theme === 'kitty' ? 'text-hk-red-dark/80' : 'text-gray-500'}`}>Préparation</span>
                    <span className={`text-xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-gray-900'}`}>{cocktail.preparation}</span>
                  </div>
                )}
                {cocktail.cuisson && (
                  <div className={`border-l pl-8 ${theme === 'kitty' ? 'border-hk-pink-light/50' : 'border-gray-300'}`}>
                    <span className={`block text-xs uppercase tracking-wider mb-1 ${theme === 'kitty' ? 'text-hk-red-dark/80' : 'text-gray-500'}`}>Cuisson</span>
                    <span className={`text-xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-gray-900'}`}>{cocktail.cuisson}</span>
                  </div>
                )}
                {cocktail.total && (
                  <div className={`border-l pl-8 ${theme === 'kitty' ? 'border-hk-pink-light/50' : 'border-gray-300'}`}>
                    <span className={`block text-xs uppercase tracking-wider mb-1 ${theme === 'kitty' ? 'text-hk-red-dark/80' : 'text-gray-500'}`}>Total</span>
                    <span className={`text-xl font-bold ${theme === 'kitty' ? 'text-hk-pink-hot' : 'text-amber-600'}`}>{cocktail.total}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className={`text-2xl font-bold mb-6 border-b pb-2 ${theme === 'kitty' ? 'text-hk-red-dark border-hk-pink-light' : 'text-amber-600 border-gray-200'}`}>Ingrédients</h2>
                <div className="space-y-3">
                  {cocktail.ingredients.map((ingredient, idx) => (
                    <Ingredient
                      key={idx}
                      name={ingredient.nom}
                      alcohol={ingredient.alcool}
                      dose={ingredient.dose}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className={`text-2xl font-bold mb-6 border-b pb-2 ${theme === 'kitty' ? 'text-hk-red-dark border-hk-pink-light' : 'text-amber-500 border-slate-700'}`}>Préparation</h2>
                <div className={`prose prose-invert ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-slate-300'}`}>
                  {cocktail.etapes ? (
                    <div className="space-y-6">
                      {cocktail.etapes.map((step, idx) => (
                        <div key={idx} className={`relative pl-8 border-l-2 ${theme === 'kitty' ? 'border-hk-pink-light' : 'border-amber-500/30'}`}>
                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${theme === 'kitty' ? 'bg-white border-hk-pink-hot' : 'bg-slate-800 border-amber-500'}`}></div>
                          <h3 className={`text-lg font-bold mb-2 mt-0 ${theme === 'kitty' ? 'text-hk-pink-hot' : 'text-amber-400'}`}>
                            {step.titre || `Étape ${idx + 1}`}
                          </h3>
                          <p className={`leading-relaxed ${theme === 'kitty' ? 'text-hk-red-dark/90' : 'text-slate-300'}`}>
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                      {cocktail.recette || cocktail.description}
                    </p>
                  )}

                  <div className={`mt-8 p-4 rounded-lg border ${theme === 'kitty' ? 'bg-hk-pink-pale/30 border-hk-pink-light/50' : 'bg-slate-900/50 border-slate-700'}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-slate-400'}`}>Conseil</h3>
                    <p className={`text-sm italic ${theme === 'kitty' ? 'text-hk-red-dark/80' : 'text-slate-400'}`}>
                      N'hésitez pas à ajuster les doses selon vos goûts !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CocktailDetailsPage;
