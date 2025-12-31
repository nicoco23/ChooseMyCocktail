import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
import { cocktailService } from '../services/cocktailService';

function CocktailsApp() {
  const { theme } = useTheme();
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
  const [selectedEquipment, setSelectedEquipment] = useState(null);
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

  const uniqueEquipment = Array.from(new Set(
    allDisplayedCocktails.flatMap(c => c.equipment || [])
  )).sort();

  const filteredAvailable = availableCocktails.filter(c => {
    const matchAlcohol = selectedAlcohol ? c.ingredients.some(i => i.alcool === selectedAlcohol) : true;
    const matchEquipment = selectedEquipment ? (c.equipment && c.equipment.includes(selectedEquipment)) : true;
    return matchAlcohol && matchEquipment;
  });

  const filteredToBuy = cocktailsToBuy.filter(c => {
    const matchAlcohol = selectedAlcohol ? c.ingredients.some(i => i.alcool === selectedAlcohol) : true;
    const matchEquipment = selectedEquipment ? (c.equipment && c.equipment.includes(selectedEquipment)) : true;
    return matchAlcohol && matchEquipment;
  });

  const getContainerClasses = () => {
    if (theme === 'kitty') {
      return "min-h-screen bg-hk-pink-pale font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-hk-red-dark";
    }
    return "min-h-screen bg-slate-900 text-slate-100";
  };

  const getHeroClasses = () => {
    if (theme === 'kitty') {
      return "relative bg-hk-pink-pale/50 py-16 sm:py-24 border-b-4 border-hk-pink-light";
    }
    return "relative bg-slate-800 py-16 sm:py-24";
  };

  const getSearchBoxClasses = () => {
    if (theme === 'kitty') {
      return "bg-white/90 backdrop-blur-md rounded-[3rem] shadow-[0_20px_50px_rgba(255,105,180,0.3)] border-8 border-hk-pink-light p-6 sm:p-10 mb-12 relative overflow-hidden";
    }
    return "bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-10 mb-12";
  };

  const getTitleClasses = () => {
    if (theme === 'kitty') return "text-4xl font-display font-bold text-hk-red-dark sm:text-5xl lg:text-6xl drop-shadow-sm";
    return "text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl";
  };

  const getSubtitleClasses = () => {
    if (theme === 'kitty') return "mt-6 max-w-2xl mx-auto text-xl text-hk-red-dark/80 font-medium";
    return "mt-6 max-w-2xl mx-auto text-xl text-slate-300";
  };

  const getSectionTitleClasses = () => {
    if (theme === 'kitty') return "text-2xl font-bold text-center mb-6 text-hk-red-light";
    return "text-2xl font-bold text-center mb-6 text-amber-500";
  };

  return (
    <div className={getContainerClasses()}>
      {/* Hero Section */}
      <div className={getHeroClasses()}>
        <div className="absolute inset-0 overflow-hidden">
          {theme !== 'kitty' && (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
            </>
          )}
          {theme === 'kitty' && (
             <>
                <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🎀</div>
                <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse">🧁</div>
             </>
          )}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={getTitleClasses()}>
            {theme === 'kitty' ? '🎀 Mon Bar Magique 🎀' : 'Votre Bar Personnel'}
          </h1>
          <p className={getSubtitleClasses()}>
            {theme === 'kitty' ? 'Dis-moi ce que tu as, je te dirai ce que tu peux boire ! ✨' : 'Dites-nous ce que vous avez, nous vous dirons ce que vous pouvez boire.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className={getSearchBoxClasses()}>
          <h2 className={getSectionTitleClasses()}>Ajoutez vos ingrédients</h2>
          <IngredientSearch
            allIngredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            theme={theme}
          />

          {selectedIngredients.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={resetSelection}
                className={`text-sm transition-colors border-b border-transparent ${
                  theme === 'kitty'
                    ? 'text-hk-red-light hover:text-hk-red-dark hover:border-hk-red-dark'
                    : 'text-slate-400 hover:text-rose-500 hover:border-rose-500'
                }`}
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
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setSelectedAlcohol(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedAlcohol === null
                      ? (theme === 'kitty' ? 'bg-hk-pink-hot text-white shadow-lg shadow-hk-red-light/25' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/25')
                      : (theme === 'kitty' ? 'bg-white text-hk-red-dark hover:bg-hk-pink-pale border border-hk-pink-light' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700')
                  }`}
                >
                  Tous les alcools
                </button>
                {uniqueAlcohols.map(alcohol => (
                  <button
                    key={alcohol}
                    onClick={() => setSelectedAlcohol(alcohol === selectedAlcohol ? null : alcohol)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedAlcohol === alcohol
                        ? (theme === 'kitty' ? 'bg-hk-pink-hot text-white shadow-lg shadow-hk-red-light/25' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/25')
                        : (theme === 'kitty' ? 'bg-white text-hk-red-dark hover:bg-hk-pink-pale border border-hk-pink-light' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700')
                    }`}
                  >
                    {alcohol}
                  </button>
                ))}
              </div>

              {/* Equipment Filter */}
              {uniqueEquipment.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedEquipment === null
                        ? (theme === 'kitty' ? 'bg-hk-blue-light text-white shadow-lg shadow-hk-blue-light/25' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25')
                        : (theme === 'kitty' ? 'bg-white text-hk-blue-dark hover:bg-hk-pink-pale border border-hk-blue-light/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700')
                    }`}
                  >
                    Tout le matériel
                  </button>
                  {uniqueEquipment.map(eq => (
                    <button
                      key={eq}
                      onClick={() => setSelectedEquipment(eq === selectedEquipment ? null : eq)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedEquipment === eq
                          ? (theme === 'kitty' ? 'bg-hk-blue-light text-white shadow-lg shadow-hk-blue-light/25' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25')
                          : (theme === 'kitty' ? 'bg-white text-hk-blue-dark hover:bg-hk-pink-pale border border-hk-blue-light/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700')
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasSearched ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme === 'kitty' ? 'text-hk-red-dark/60' : 'text-slate-400'}`}>
                Commencez par ajouter des ingrédients pour voir les résultats.
              </p>
            </div>
          ) : (
            <>
              {/* Section: Cocktails Faisables (100%) */}
              {filteredAvailable.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <span className="text-3xl mr-3">🎉</span>
                    <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>
                      À déguster maintenant <span className={`${theme === 'kitty' ? 'text-hk-pink-hot' : 'text-green-400'} text-lg font-normal`}>({filteredAvailable.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAvailable.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
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
                        <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>
                        À compléter avec quelques achats <span className={`${theme === 'kitty' ? 'text-hk-blue-light' : 'text-amber-400'} text-lg font-normal`}>({filteredToBuy.length})</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowShoppingList(true)}
                        className={`${theme === 'kitty' ? 'bg-hk-blue-light hover:bg-hk-blue-dark' : 'bg-amber-600 hover:bg-amber-700'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center`}
                    >
                        Voir ma liste de courses
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                    {filteredToBuy.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
                    ))}
                  </div>
                </div>
              )}

              {filteredAvailable.length === 0 && filteredToBuy.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">😕</div>
                  <h3 className={`text-xl font-medium ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>Aucun cocktail trouvé</h3>
                  <p className={`${theme === 'kitty' ? 'text-hk-red-dark/60' : 'text-slate-400'} mt-2`}>Essayez d'ajouter plus d'ingrédients (alcools, jus, fruits...) !</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCocktail && (
        <CocktailModal
          cocktail={selectedCocktail}
          onClose={closeModal}
          theme={theme}
          userIngredients={selectedIngredients}
        />
      )}

      {showShoppingList && (
        <ShoppingListModal
            cocktails={filteredToBuy}
            onClose={() => setShowShoppingList(false)}
            theme={theme}
        />
      )}
    </div>
  );
}

export default CocktailsApp;
