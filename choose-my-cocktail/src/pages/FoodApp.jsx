import React, { useState, useEffect } from 'react';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
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

  const closeModal = () => setSelectedRecipe(null);

  // Filter Logic
  const filteredAvailable = availableRecipes;
  const filteredToBuy = recipesToBuy;

  // Theme Classes Helpers
  const getBgClass = () => theme === 'kitty' ? 'bg-hk-pink-pale text-hk-red-dark' : 'bg-food-yellow/10 text-food-dark';
  const getHeroGradient = () => theme === 'kitty' ? 'from-hk-pink-light/30 to-hk-yellow/20' : 'from-food-yellow/20 to-food-orange/10';
  const getPrimaryText = () => theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-orange';
  const getSecondaryText = () => theme === 'kitty' ? 'text-hk-blue-dark' : 'text-food-purple';
  const getContainerBorder = () => theme === 'kitty' ? 'border-hk-pink-light/50 shadow-hk-red-dark/10' : 'border-food-orange/20 shadow-food-purple/10';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className={`bg-white rounded-2xl shadow-xl ${getContainerBorder()} border p-6 sm:p-10 mb-12 transition-all duration-300`}>
          <h2 className={`text-2xl font-bold text-center mb-6 ${getPrimaryText()} transition-colors duration-300`}>Ajoutez vos ingrédients</h2>
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
            <div className="text-center mt-6">
              <button
                onClick={resetSelection}
                className={`text-sm ${theme === 'kitty' ? 'text-hk-blue-dark hover:text-hk-red-dark hover:border-hk-red-dark' : 'text-food-purple hover:text-food-orange hover:border-food-orange'} transition-colors border-b border-transparent`}
              >
                Réinitialiser les filtres
              </button>
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
    </div>
  );
}

export default FoodApp;
