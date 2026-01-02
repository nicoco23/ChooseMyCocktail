import React, { useState, useEffect } from 'react';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
import Confetti from '../components/Confetti';
import { foodService } from '../services/foodService';
import { useTheme } from '../context/ThemeContext';

function FoodApp() {
  const [allIngredients, setAllIngredients] = useState([]);
  // Load from localStorage
  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    const saved = localStorage.getItem('myFridge');
    return saved ? JSON.parse(saved) : [];
  });

  // Equipment State
  const [userEquipment, setUserEquipment] = useState(() => {
    const saved = localStorage.getItem('myKitchen');
    return saved ? JSON.parse(saved) : [];
  });

  // Tags State
  const [selectedTags, setSelectedTags] = useState(() => {
    const saved = localStorage.getItem('myTags');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Nouveaux états pour les résultats catégorisés
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [recipesToBuy, setRecipesToBuy] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme } = useTheme();

  const availableEquipment = ['Four', 'Plaques', 'Poêle', 'Casserole', 'Micro-ondes', 'Air Fryer', 'Robot Cuiseur', 'Barbecue', 'Friteuse', 'Mixeur'];
  const availableTags = ['Viande', 'Poisson', 'Végétarien', 'Vegan', 'Sans Gluten', 'Soupe', 'Salade', 'Pâtes', 'Riz', 'Fruits de mer', 'Chocolat', 'Fruits', 'Fromage', 'Épicé', 'Rapide', 'Traditionnel', 'Sain', 'Gourmand'];

  useEffect(() => {
    const loadIngredients = async () => {
      const ingredients = await foodService.getAllIngredients();
      setAllIngredients(ingredients);
    };
    loadIngredients();
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('myFridge', JSON.stringify(selectedIngredients));
    localStorage.setItem('myKitchen', JSON.stringify(userEquipment));
    localStorage.setItem('myTags', JSON.stringify(selectedTags));

    if (selectedIngredients.length === 0 && selectedTags.length === 0 && userEquipment.length === 0) {
      setAvailableRecipes([]);
      setRecipesToBuy([]);
      setHasSearched(false);
    } else {
      foodService.categorizeRecipes(selectedIngredients, userEquipment, selectedTags).then(({ available, needToBuy }) => {
        setAvailableRecipes(available);
        setRecipesToBuy(needToBuy);
        setHasSearched(true);

        // Afficher les confettis si on a des recettes 100% compatibles
        if (available.length > 0 && available.some(r => r.matchPercentage === 100)) {
          setShowConfetti(true);
        }
      });
    }
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
    setSelectedTags([]);
    setUserEquipment([]);
  };

  const handleSurpriseMe = async () => {
    const allRecipes = await foodService.getAllRecipes();
    if (allRecipes.length > 0) {
      const randomRecipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
      setSelectedRecipe(randomRecipe);
    }
  };

  const closeModal = () => setSelectedRecipe(null);

  // Filter Logic
  const filteredAvailable = availableRecipes;
  const filteredToBuy = recipesToBuy;

  // Theme Classes Helpers
  const getBgClass = () => theme === 'kitty' ? "bg-hk-pink-pale text-hk-red-dark font-display bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]" : 'bg-food-yellow/10 text-food-dark';
  const getHeroGradient = () => theme === 'kitty' ? 'from-hk-pink-light/30 to-hk-yellow/20' : 'from-food-yellow/20 to-food-orange/10';
  const getPrimaryText = () => theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-orange';
  const getSecondaryText = () => theme === 'kitty' ? 'text-hk-blue-dark' : 'text-food-purple';
  const getContainerBorder = () => theme === 'kitty' ? 'border-hk-pink-light/50 shadow-hk-red-dark/10 backdrop-blur-sm bg-white/90' : 'border-food-orange/20 shadow-food-purple/10';
  const getButtonClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-red-light text-white shadow-lg shadow-hk-red-light/20 transform scale-105'
        : 'bg-hk-yellow/20 text-hk-red-dark/70 hover:bg-hk-yellow/40 hover:text-hk-red-dark';
    }
    return isActive
      ? 'bg-food-orange text-white shadow-lg shadow-food-orange/20 transform scale-105'
      : 'bg-food-yellow/20 text-food-dark/70 hover:bg-food-yellow/40 hover:text-food-dark';
  };
  const getActionBtnClass = () => theme === 'kitty' ? 'bg-hk-red-light hover:bg-hk-red-light/90 shadow-hk-red-light/20' : 'bg-food-orange hover:bg-food-orange/90 shadow-food-orange/20';

  return (
    <div className={`min-h-screen ${getBgClass()} transition-colors duration-500`}>
      {/* Hero Section */}
      {theme === 'kitty' ? (
        <div className="relative bg-hk-pink-pale/50 py-12 sm:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-5 left-5 text-7xl opacity-20 animate-pulse">🍓</div>
            <div className="absolute top-5 right-5 text-7xl opacity-20 animate-pulse rotate-12 delay-300">🥕</div>
            <div className="absolute bottom-5 left-1/4 text-6xl opacity-10 animate-pulse delay-500">🍅</div>
            <div className="absolute bottom-5 right-1/4 text-6xl opacity-10 animate-pulse delay-700">🧀</div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 text-5xl md:text-7xl animate-gentle-bounce">🍽️</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-hk-red-dark drop-shadow-md animate-gentle-bounce relative px-2">
              🎀 Mon Frigo Magique 🎀
              <div className="absolute -top-3 -right-3 md:-top-6 md:-right-6 text-2xl md:text-4xl animate-float">💖</div>
              <div className="absolute -top-3 -left-3 md:-top-6 md:-left-6 text-2xl md:text-4xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-hk-red-light font-medium bg-gradient-to-r from-white/60 via-hk-pink-pale/40 to-white/60 inline-block px-6 md:px-8 py-2 md:py-3 rounded-full backdrop-blur-sm border-2 md:border-4 border-white shadow-lg">
              Dis-moi ce que tu as, je te dirai ce que tu peux cuisiner ! ✨
            </p>
          </div>
        </div>
      ) : (
        <div className={`relative bg-gradient-to-b ${getHeroGradient()} py-16 sm:py-24 transition-colors duration-500`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-5"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className={`text-4xl font-extrabold tracking-tight ${getPrimaryText()} sm:text-5xl lg:text-6xl drop-shadow-sm transition-colors duration-300`}>
              Votre Frigo Personnel
            </h1>
            <p className={`mt-6 max-w-2xl mx-auto text-xl ${getSecondaryText()} font-medium transition-colors duration-300`}>
              Dites-nous ce que vous avez, nous vous dirons ce que vous pouvez cuisiner.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className={`${theme === 'kitty' ? 'bg-gradient-to-br from-white/95 via-hk-pink-pale/20 to-white/95 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(255,105,180,0.4)] border-4 md:border-[10px] border-hk-pink-light transform hover:scale-[1.01] transition-transform duration-300' : 'bg-white rounded-2xl shadow-xl border'} ${getContainerBorder()} p-4 sm:p-6 md:p-10 mb-12 relative overflow-hidden`}>
          {theme === 'kitty' && (
            <>
              <div className="absolute top-0 right-0 -mt-6 -mr-6 md:-mt-8 md:-mr-8 text-5xl md:text-8xl opacity-20 rotate-12 select-none animate-sparkle">🥗</div>
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 md:-mb-8 md:-ml-8 text-5xl md:text-8xl opacity-20 -rotate-12 select-none animate-sparkle" style={{ animationDelay: '0.5s' }}>🍳</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl md:text-9xl opacity-5 pointer-events-none">💕</div>
              <div className="hidden md:block absolute top-10 right-20 text-5xl opacity-30 animate-float">🎀</div>
              <div className="hidden md:block absolute bottom-10 left-20 text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>💞</div>
            </>
          )}
          <h2 className={`${theme === 'kitty' ? 'text-3xl font-bold text-hk-red-dark mb-8 flex items-center justify-center gap-3' : 'text-2xl font-bold text-center mb-6'} ${getPrimaryText()} transition-colors duration-300`}>
            {theme === 'kitty' && <span className="text-4xl">🥘</span>}
            {theme === 'kitty' ? 'Mes Ingrédients Magiques' : 'Ajoutez vos ingrédients'}
          </h2>
          <IngredientSearch
            theme={theme}
            allIngredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
          />

          {/* Equipment Selection */}
          <div className={`mt-8 border-t ${theme === 'kitty' ? 'border-hk-yellow/30' : 'border-food-yellow/30'} pt-6 transition-colors duration-300`}>
            <h3 className={`text-lg font-medium ${theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-food-dark/70'} mb-4 text-center transition-colors duration-300`}>Mon Équipement</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {availableEquipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${getButtonClass(userEquipment.includes(eq))}`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Selection */}
          <div className={`mt-8 border-t ${theme === 'kitty' ? 'border-hk-yellow/30' : 'border-food-yellow/30'} pt-6 transition-colors duration-300`}>
            <h3 className={`text-lg font-medium ${theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-food-dark/70'} mb-4 text-center transition-colors duration-300`}>Filtres & Régimes</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${getButtonClass(selectedTags.includes(tag))}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {(selectedIngredients.length > 0 || selectedTags.length > 0 || userEquipment.length > 0) && (
            <div className="text-center mt-6 space-y-3">
              <button
                onClick={resetSelection}
                className={`text-sm ${theme === 'kitty' ? 'text-hk-blue-dark hover:text-hk-red-dark hover:border-hk-red-dark' : 'text-food-purple hover:text-food-orange hover:border-food-orange'} transition-colors border-b border-transparent`}
              >
                Réinitialiser les filtres
              </button>
              <div>
                <button
                  onClick={handleSurpriseMe}
                  className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    theme === 'kitty'
                      ? 'bg-gradient-to-r from-hk-pink-hot to-hk-red-light text-white border-4 border-white'
                      : 'bg-gradient-to-r from-food-orange to-food-purple text-white'
                  }`}
                >
                  🎲 Surprise-moi !
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="pb-20">
          {!hasSearched ? (
            <div className="text-center py-12">
              <p className={`${theme === 'kitty' ? 'text-hk-red-dark/50' : 'text-food-dark/50'} text-lg transition-colors duration-300`}>Commencez par ajouter des ingrédients ou sélectionner des filtres pour voir les résultats.</p>
            </div>
          ) : (
            <>
              {/* Section: Recettes Faisables (100%) */}
              {filteredAvailable.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <span className="text-3xl mr-3">👨‍🍳</span>
                    <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-dark'} transition-colors duration-300`}>
                      À cuisiner maintenant <span className={`${getPrimaryText()} text-lg font-normal transition-colors duration-300`}>({filteredAvailable.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAvailable.map((recipe, index) => (
                      <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} theme={theme} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Recettes nécessitant des achats */}
              {filteredToBuy.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">🛒</span>
                        <h2 className={`text-2xl font-bold ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-dark'} transition-colors duration-300`}>
                        À compléter avec quelques achats <span className={`${getPrimaryText()} text-lg font-normal transition-colors duration-300`}>({filteredToBuy.length})</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowShoppingList(true)}
                        className={`${getActionBtnClass()} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center`}
                    >
                        Voir ma liste de courses
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                    {filteredToBuy.map((recipe, index) => (
                      <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} theme={theme} />
                    ))}
                  </div>
                </div>
              )}

              {filteredAvailable.length === 0 && filteredToBuy.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">😕</div>
                  <h3 className={`text-xl font-medium ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-dark'} transition-colors duration-300`}>Aucune recette trouvée</h3>
                  <p className={`${theme === 'kitty' ? 'text-hk-red-dark/50' : 'text-food-dark/50'} mt-2 transition-colors duration-300`}>Essayez d'ajouter plus d'ingrédients !</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <CocktailModal
          cocktail={selectedRecipe}
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

      {showConfetti && (
        <Confetti theme={theme} onComplete={() => setShowConfetti(false)} />
      )}
    </div>
  );
}

export default FoodApp;
