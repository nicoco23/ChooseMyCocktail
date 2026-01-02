import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
import Confetti from '../components/Confetti';
import { cocktailService } from '../services/cocktailService';
import { FunnelIcon, BeakerIcon, TagIcon } from '@heroicons/react/24/outline';

function CocktailsApp() {
  const { theme } = useTheme();
  const [allIngredients, setAllIngredients] = useState([]);
  // Load from localStorage
  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    const saved = localStorage.getItem('myBar');
    return saved ? JSON.parse(saved) : [];
  });

  // Equipment State
  const [userEquipment, setUserEquipment] = useState(() => {
    const saved = localStorage.getItem('myBarEquipment');
    return saved ? JSON.parse(saved) : [];
  });

  // Tags State
  const [selectedTags, setSelectedTags] = useState(() => {
    const saved = localStorage.getItem('myBarTags');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCocktail, setSelectedCocktail] = useState(null);

  // Nouveaux états pour les résultats catégorisés
  const [availableCocktails, setAvailableCocktails] = useState([]);
  const [cocktailsToBuy, setCocktailsToBuy] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const availableEquipment = ['Shaker', 'Blender', 'Cuillère à mélange', 'Pilon', 'Passoire', 'Verre à mélange', 'Presse-agrumes'];
  const availableTags = ['Sans Alcool', 'Fruité', 'Amer', 'Sucré', 'Acide', 'Épicé', 'Crémeux', 'Pétillant', 'Chaud', 'Classique', 'Milk-Shake'];

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
    localStorage.setItem('myBarEquipment', JSON.stringify(userEquipment));
    localStorage.setItem('myBarTags', JSON.stringify(selectedTags));

    const updateCocktails = async () => {
      if (selectedIngredients.length === 0 && userEquipment.length === 0 && selectedTags.length === 0) {
        setAvailableCocktails([]);
        setCocktailsToBuy([]);
        setHasSearched(false);
      } else {
        const { available, needToBuy } = await cocktailService.categorizeCocktails(selectedIngredients, userEquipment, selectedTags);
        setAvailableCocktails(available);
        setCocktailsToBuy(needToBuy);
        setHasSearched(true);

        // Afficher les confettis si on a des recettes 100% compatibles
        if (available.length > 0 && available.some(r => r.matchPercentage === 100)) {
          setShowConfetti(true);
        }
      }
    };
    updateCocktails();
  }, [selectedIngredients, userEquipment, selectedTags]);

  const handleAddIngredient = (ingredient) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const toggleEquipment = (eq) => {
    if (userEquipment.includes(eq)) {
      setUserEquipment(userEquipment.filter(e => e !== eq));
    } else {
      setUserEquipment([...userEquipment, eq]);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resetSelection = () => {
    setSelectedIngredients([]);
    setUserEquipment([]);
    setSelectedTags([]);
  };

  const closeModal = () => setSelectedCocktail(null);

  const getContainerClasses = () => {
    if (theme === 'kitty') {
      return "min-h-screen bg-hk-pink-pale font-sans text-hk-red-dark bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]";
    }
    return "min-h-screen bg-gray-50 text-gray-900";
  };

  const getHeroClasses = () => {
    if (theme === 'kitty') {
      return "relative bg-gradient-to-b from-hk-pink-light/30 to-transparent py-16 sm:py-24 overflow-hidden";
    }
    return "relative bg-white py-16 sm:py-24";
  };

  const getSearchBoxClasses = () => {
    if (theme === 'kitty') {
      return "bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_10px_40px_rgba(255,105,180,0.3)] border-4 border-hk-pink-light p-6 sm:p-10 mb-12 relative z-20 transform hover:scale-[1.02] transition-all duration-500 ring-4 ring-hk-pink-pale ring-offset-4 ring-offset-white";
    }
    return "bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10 mb-12 relative z-20";
  };

  const getTitleClasses = () => {
    if (theme === 'kitty') return "text-5xl font-display font-bold text-hk-red-dark sm:text-6xl drop-shadow-md";
    return "text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl";
  };

  const getSubtitleClasses = () => {
    if (theme === 'kitty') return "mt-4 max-w-2xl mx-auto text-2xl text-hk-red-light font-medium bg-white/90 inline-block px-8 py-3 rounded-full backdrop-blur-md border-2 border-white shadow-lg";
    return "mt-6 max-w-2xl mx-auto text-xl text-gray-600";
  };

  const getSectionTitleClasses = () => {
    if (theme === 'kitty') return "text-3xl font-bold text-hk-red-dark mb-8 flex items-center justify-center gap-3";
    return "text-2xl font-bold text-center mb-6 text-amber-600";
  };

  return (
    <div className={getContainerClasses()}>
      {/* Hero Section */}
      <div className={getHeroClasses()}>
        <div className="absolute inset-0 overflow-hidden">
          {theme !== 'kitty' && (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-gray-50"></div>
            </>
          )}
          {theme === 'kitty' && (
             <>
                <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce" style={{ animationDuration: '3s' }}>🎀</div>
                <div className="absolute top-20 right-20 text-5xl opacity-30 animate-pulse rotate-12" style={{ animationDuration: '2s' }}>🍓</div>
                <div className="absolute bottom-10 left-1/4 text-4xl opacity-20 animate-bounce delay-300">✨</div>
                <div className="absolute bottom-20 right-1/3 text-5xl opacity-20 animate-pulse delay-500">💖</div>
                <div className="absolute top-1/3 left-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🌸</div>
                <div className="absolute top-1/4 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🧁</div>
             </>
          )}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {theme === 'kitty' && <div className="mb-4 text-5xl md:text-7xl animate-gentle-bounce">🍹</div>}

          {theme === 'kitty' ? (
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-hk-red-dark drop-shadow-sm animate-gentle-bounce relative px-8 py-4 bg-white/80 backdrop-blur-md rounded-full border-4 border-hk-pink-light shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                <div className="absolute -top-3 -right-3 md:-top-6 md:-right-6 text-2xl md:text-4xl animate-float">💖</div>
                <div className="absolute -top-3 -left-3 md:-top-6 md:-left-6 text-2xl md:text-4xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
                🎀 Mon Bar Magique 🎀
              </h1>
            </div>
          ) : (
            <h1 className={getTitleClasses()}>
              Votre Bar Personnel
            </h1>
          )}

          <p className={getSubtitleClasses()}>
            {theme === 'kitty' ? 'Dis-moi ce que tu as, je te dirai ce que tu peux boire ! ✨' : 'Dites-nous ce que vous avez, nous vous dirons ce que vous pouvons boire.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className={getSearchBoxClasses()}>
          {theme === 'kitty' && (
            <>
              <div className="absolute top-0 right-0 -mt-6 -mr-6 md:-mt-8 md:-mr-8 text-5xl md:text-8xl opacity-20 rotate-12 select-none animate-sparkle">🍋</div>
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 md:-mb-8 md:-ml-8 text-5xl md:text-8xl opacity-20 -rotate-12 select-none animate-sparkle" style={{ animationDelay: '0.5s' }}>🍊</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl md:text-9xl opacity-5 pointer-events-none">🧚</div>
              <div className="hidden md:block absolute top-10 right-20 text-5xl opacity-30 animate-float">🎀</div>
              <div className="hidden md:block absolute bottom-10 left-20 text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>💕</div>
            </>
          )}
          <h2 className={getSectionTitleClasses()}>
            {theme === 'kitty' && <span className="text-4xl">🔮</span>}
            {theme === 'kitty' ? 'Mes Ingrédients Magiques' : 'Ajoutez vos ingrédients'}
          </h2>
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

        {/* Equipment & Tags Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Equipment */}
          <div className={theme === 'kitty' ? "bg-white/90 backdrop-blur-md rounded-[2rem] p-8 border-4 border-hk-pink-light shadow-[0_10px_30px_rgba(255,105,180,0.2)]" : "bg-white rounded-2xl p-6 shadow-lg border border-gray-200"}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${theme === 'kitty' ? 'text-hk-red-dark font-display text-2xl' : 'text-gray-800'}`}>
              <FunnelIcon className={`w-6 h-6 ${theme === 'kitty' ? 'text-hk-pink-hot' : ''}`} />
              {theme === 'kitty' ? 'Mes Outils Magiques' : 'Mon Matériel'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableEquipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                    userEquipment.includes(eq)
                      ? (theme === 'kitty' ? 'bg-hk-pink-hot text-white border-white shadow-md transform scale-105' : 'bg-amber-500 text-white border-amber-500')
                      : (theme === 'kitty' ? 'bg-white text-hk-red-dark border-hk-pink-light hover:bg-hk-pink-pale hover:border-hk-pink-hot' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100')
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className={theme === 'kitty' ? "bg-white/90 backdrop-blur-md rounded-[2rem] p-8 border-4 border-hk-pink-light shadow-[0_10px_30px_rgba(255,105,180,0.2)]" : "bg-white rounded-2xl p-6 shadow-lg border border-gray-200"}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${theme === 'kitty' ? 'text-hk-red-dark font-display text-2xl' : 'text-gray-800'}`}>
              <TagIcon className={`w-6 h-6 ${theme === 'kitty' ? 'text-hk-pink-hot' : ''}`} />
              {theme === 'kitty' ? 'Mes Envies' : 'Mes Préférences'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                    selectedTags.includes(tag)
                      ? (theme === 'kitty' ? 'bg-hk-pink-hot text-white border-white shadow-md transform scale-105' : 'bg-amber-500 text-white border-amber-500')
                      : (theme === 'kitty' ? 'bg-white text-hk-red-dark border-hk-pink-light hover:bg-hk-pink-pale hover:border-hk-pink-hot' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100')
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="pb-20">
          {/* Confetti */}
          {showConfetti && <Confetti />}

          {!hasSearched ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme === 'kitty' ? 'text-hk-red-dark/60' : 'text-slate-400'}`}>
                Commencez par ajouter des ingrédients pour voir les résultats.
              </p>
            </div>
          ) : (
            <>
              {/* Section: Cocktails Faisables (100%) */}
              {availableCocktails.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <span className="text-3xl mr-3">🎉</span>
                    <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>
                      À déguster maintenant <span className={`${theme === 'kitty' ? 'text-hk-pink-hot' : 'text-green-400'} text-lg font-normal`}>({availableCocktails.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availableCocktails.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Cocktails nécessitant des achats */}
              {cocktailsToBuy.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">🛒</span>
                        <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>
                        À compléter avec quelques achats <span className={`${theme === 'kitty' ? 'text-hk-blue-light' : 'text-amber-400'} text-lg font-normal`}>({cocktailsToBuy.length})</span>
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
                    {cocktailsToBuy.map((cocktail, index) => (
                      <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
                    ))}
                  </div>
                </div>
              )}

              {availableCocktails.length === 0 && cocktailsToBuy.length === 0 && (
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
            cocktails={cocktailsToBuy}
            onClose={() => setShowShoppingList(false)}
            theme={theme}
        />
      )}
    </div>
  );
}

export default CocktailsApp;
