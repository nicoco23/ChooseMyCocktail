import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cocktailService } from '../services/cocktailService';
import Ingredient from '../components/Ingredients';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

function CocktailDetailsPage() {
  const { name } = useParams();
  const [cocktail, setCocktail] = useState(null);

  useEffect(() => {
    const allCocktails = cocktailService.getAllCocktails();
    const foundCocktail = allCocktails.find(c => c.nom === name);
    setCocktail(foundCocktail);
  }, [name]);

  if (!cocktail) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/all-cocktails" className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-8 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux cocktails
        </Link>

        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="relative h-96">
             {cocktail.image ? (
                <img
                  src={cocktail.image}
                  alt={cocktail.nom}
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                    <span className="text-9xl">🍸</span>
                </div>
             )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{cocktail.nom}</h1>
              {(cocktail.total || cocktail.duree) && (
                  <div className="flex items-center text-slate-300 text-lg mt-2">
                    <span className="mr-2">⏱️</span>
                    <span>{cocktail.total || cocktail.duree}</span>
                  </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Time Breakdown for Details Page */}
            {(cocktail.preparation || cocktail.cuisson) && (
              <div className="flex flex-wrap gap-8 mb-8 p-4 bg-slate-700/30 rounded-xl border border-slate-700/50">
                {cocktail.preparation && (
                  <div>
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Préparation</span>
                    <span className="text-xl font-bold text-white">{cocktail.preparation}</span>
                  </div>
                )}
                {cocktail.cuisson && (
                  <div className="border-l border-slate-600 pl-8">
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Cuisson</span>
                    <span className="text-xl font-bold text-white">{cocktail.cuisson}</span>
                  </div>
                )}
                {cocktail.total && (
                  <div className="border-l border-slate-600 pl-8">
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Total</span>
                    <span className="text-xl font-bold text-amber-400">{cocktail.total}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-slate-700 pb-2">Ingrédients</h2>
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
                <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-slate-700 pb-2">Préparation</h2>
                <div className="prose prose-invert text-slate-300">
                  {cocktail.etapes ? (
                    <div className="space-y-6">
                      {cocktail.etapes.map((step, idx) => (
                        <div key={idx} className="relative pl-8 border-l-2 border-amber-500/30">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-500"></div>
                          <h3 className="text-lg font-bold text-amber-400 mb-2 mt-0">
                            {step.titre || `Étape ${idx + 1}`}
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
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

                  <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Conseil</h3>
                    <p className="text-sm text-slate-400 italic">
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
