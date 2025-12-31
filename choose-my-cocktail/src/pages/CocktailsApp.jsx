import React, { useState, useEffect } from 'react';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
import { cocktailService } from '../services/cocktailService';

function CocktailsApp() {
  const [allIngredients, setAllIngredients] = useState([]);
  // Load from localStorage
  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    const saved = localStorage.getItem('myBar');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  // Nouveaux états pour les résultats catégorisés
  const [availableCocktails, setAvailableCocktails] = useState([]);
  const [cocktailsToBuy, setCocktailsToBuy] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [selectedAlcohol, setSelectedAlcohol] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      const ingredients = await cocktailService.getAllIngredients();
      setAllIngredients(ingredients);
    };
    fetchIngredients();
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('myBar', JSON.stringify(selectedIngredients));

    const updateCocktails = async () => {
      if (selectedIngredients.length === 0) {
        setAvailableCocktails([]);
        setCocktailsToBuy([]);
        setHasSearched(false);
      } else {
        const { available, needToBuy } = await cocktailService.categorizeCocktails(selectedIngredients);
        setAvailableCocktails(available);
        setCocktailsToBuy(needToBuy);
        setHasSearched(true);
      }
    };
    updateCocktails();
  }, [selectedIngredients]);

  const handleAddIngredient = (ingredient) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const resetSelection = () => {
    setSelectedIngredients([]);
  };

  const closeModal = () => setSelectedCocktail(null);

  // Filter Logic
  const allDisplayedCocktails = [...availableCocktails, ...cocktailsToBuy];
  const uniqueAlcohols = Array.from(new Set(
    allDisplayedCocktails.flatMap(c => c.ingredients.filter(i => i.alcool).map(i => i.alcool))
  )).sort();

  const filteredAvailable = selectedAlcohol
    ? availableCocktails.filter(c => c.ingredients.some(i => i.alcool === selectedAlcohol))
    : availableCocktails;

  const filteredToBuy = selectedAlcohol
    ? cocktailsToBuy.filter(c => c.ingredients.some(i => i.alcool === selectedAlcohol))
    : cocktailsToBuy;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <div className="relative bg-slate-800 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Votre Bar Personnel
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-300">
            Dites-nous ce que vous avez, nous vous dirons ce que vous pouvez boire.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-10 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-amber-500">Ajoutez vos ingrédients</h2>
          <IngredientSearch
            allIngredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
          />

          {selectedIngredients.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={resetSelection}
                className="text-sm text-slate-400 hover:text-rose-500 transition-colors border-b border-transparent hover:border-rose-500"
              >
                Réinitialiser le bar
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="pb-20">
          {/* Alcohol Filter */}
          {hasSearched && uniqueAlcohols.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => setSelectedAlcohol(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedAlcohol === null
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                Tous
              </button>
              {uniqueAlcohols.map(alcohol => (
                <button
                  key={alcohol}
                  onClick={() => setSelectedAlcohol(alcohol === selectedAlcohol ? null : alcohol)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedAlcohol === alcohol
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {alcohol}
                </button>
              ))}
            </div>
          )}

          {!hasSearched ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Commencez par ajouter des ingrédients pour voir les résultats.</p>
            </div>
          ) : (
            <>
              {/* Section: Cocktails Faisables (100%) */}
              {filteredAvailable.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <span className="text-3xl mr-3">🎉</span>
                    <h2 className="text-2xl font-bold text-white">
                      À déguster maintenant <span className="text-green-400 text-lg font-normal">({filteredAvailable.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAvailable.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Cocktails nécessitant des achats */}
              {filteredToBuy.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">🛒</span>
                        <h2 className="text-2xl font-bold text-white">
                        À compléter avec quelques achats <span className="text-amber-400 text-lg font-normal">({filteredToBuy.length})</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowShoppingList(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-600/20 flex items-center"
                    >
                        Voir ma liste de courses
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                    {filteredToBuy.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} />
                    ))}
                  </div>
                </div>
              )}

              {filteredAvailable.length === 0 && filteredToBuy.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">😕</div>
                  <h3 className="text-xl font-medium text-white">Aucun cocktail trouvé</h3>
                  <p className="text-slate-400 mt-2">Essayez d'ajouter plus d'ingrédients (alcools, jus, fruits...) !</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCocktail && (
        <CocktailModal cocktail={selectedCocktail} onClose={closeModal} />
      )}

      {showShoppingList && (
        <ShoppingListModal
            cocktails={filteredToBuy}
            onClose={() => setShowShoppingList(false)}
        />
      )}
    </div>
  );
}

export default CocktailsApp;
