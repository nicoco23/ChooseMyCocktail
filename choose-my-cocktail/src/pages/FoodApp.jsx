import React, { useState, useEffect } from 'react';
import IngredientSearch from '../components/IngredientSearch';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import ShoppingListModal from '../components/ShoppingListModal';
import { foodService } from '../services/foodService';

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

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Nouveaux états pour les résultats catégorisés
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [recipesToBuy, setRecipesToBuy] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [showShoppingList, setShowShoppingList] = useState(false);

  const availableEquipment = ['Four', 'Plaques', 'Poêle', 'Casserole', 'Micro-ondes', 'Air Fryer', 'Robot Cuiseur', 'Barbecue', 'Friteuse', 'Mixeur'];

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

    if (selectedIngredients.length === 0) {
      setAvailableRecipes([]);
      setRecipesToBuy([]);
      setHasSearched(false);
    } else {
      foodService.categorizeRecipes(selectedIngredients, userEquipment).then(({ available, needToBuy }) => {
        setAvailableRecipes(available);
        setRecipesToBuy(needToBuy);
        setHasSearched(true);
      });
    }
  }, [selectedIngredients, userEquipment]);

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

  const resetSelection = () => {
    setSelectedIngredients([]);
  };

  const closeModal = () => setSelectedRecipe(null);

  // Filter Logic
  const filteredAvailable = availableRecipes;
  const filteredToBuy = recipesToBuy;

  return (
    <div className="min-h-screen bg-food-yellow/10 text-food-dark">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-food-yellow/20 to-food-orange/10 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-5"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-food-orange sm:text-5xl lg:text-6xl drop-shadow-sm">
            Votre Frigo Personnel
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-food-purple font-medium">
            Dites-nous ce que vous avez, nous vous dirons ce que vous pouvez cuisiner.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-food-purple/10 border border-food-orange/20 p-6 sm:p-10 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-food-orange">Ajoutez vos ingrédients</h2>
          <IngredientSearch
            allIngredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
          />

          {/* Equipment Selection */}
          <div className="mt-8 border-t border-food-yellow/30 pt-6">
            <h3 className="text-lg font-medium text-food-dark/70 mb-4 text-center">Mon Équipement</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {availableEquipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    userEquipment.includes(eq)
                      ? 'bg-food-orange text-white shadow-lg shadow-food-orange/20 transform scale-105'
                      : 'bg-food-yellow/20 text-food-dark/70 hover:bg-food-yellow/40 hover:text-food-dark'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {selectedIngredients.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={resetSelection}
                className="text-sm text-food-purple hover:text-food-orange transition-colors border-b border-transparent hover:border-food-orange"
              >
                Vider le frigo
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="pb-20">
          {!hasSearched ? (
            <div className="text-center py-12">
              <p className="text-food-dark/50 text-lg">Commencez par ajouter des ingrédients pour voir les résultats.</p>
            </div>
          ) : (
            <>
              {/* Section: Recettes Faisables (100%) */}
              {filteredAvailable.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <span className="text-3xl mr-3">👨‍🍳</span>
                    <h2 className="text-2xl font-bold text-food-dark">
                      À cuisiner maintenant <span className="text-food-orange text-lg font-normal">({filteredAvailable.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAvailable.map((recipe, index) => (
                      <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} />
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
                        <h2 className="text-2xl font-bold text-food-dark">
                        À compléter avec quelques achats <span className="text-food-orange text-lg font-normal">({filteredToBuy.length})</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowShoppingList(true)}
                        className="bg-food-orange hover:bg-food-orange/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-food-orange/20 flex items-center"
                    >
                        Voir ma liste de courses
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                    {filteredToBuy.map((recipe, index) => (
                      <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} />
                    ))}
                  </div>
                </div>
              )}

              {filteredAvailable.length === 0 && filteredToBuy.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">😕</div>
                  <h3 className="text-xl font-medium text-food-dark">Aucune recette trouvée</h3>
                  <p className="text-food-dark/50 mt-2">Essayez d'ajouter plus d'ingrédients !</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <CocktailModal cocktail={selectedRecipe} onClose={closeModal} />
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

export default FoodApp;
