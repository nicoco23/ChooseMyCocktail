import React, { useState, useEffect } from 'react';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import { foodService } from '../services/foodService';
import { useTheme } from '../context/ThemeContext';

function AllFoodPage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    // Utiliser le service pour récupérer toutes les recettes de cuisine
    foodService.getAllRecipes().then(data => {
      setRecipes(data);
    });
  }, []);

  // Extract unique values
  const categories = ['all', ...new Set(recipes.map(r => r.category).filter(Boolean))];
  const allEquipment = [...new Set(recipes.flatMap(r => r.equipment || []))].sort();

  // Filter Logic
  const filteredRecipes = recipes.filter(recipe => {
    const matchCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    // Show recipe if it uses AT LEAST ONE of the selected equipment (OR logic)
    // If no equipment selected, show all (subject to category)
    const matchEquipment = selectedEquipment.length === 0 || (recipe.equipment && recipe.equipment.some(eq => selectedEquipment.includes(eq)));
    return matchCategory && matchEquipment;
  });

  const toggleEquipment = (eq) => {
    if (selectedEquipment.includes(eq)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== eq));
    } else {
      setSelectedEquipment([...selectedEquipment, eq]);
    }
  };

  // Theme Classes Helpers
  const getBgClass = () => theme === 'kitty' ? "bg-hk-pink-pale text-hk-red-dark font-display bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : 'bg-food-yellow/10 text-food-dark';
  const getPrimaryText = () => theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-orange';
  const getSecondaryText = () => theme === 'kitty' ? 'text-hk-blue-dark' : 'text-food-purple';

  const getFilterButtonClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-red-light text-white shadow-md shadow-hk-red-light/20'
        : 'bg-white text-hk-red-dark border border-hk-pink-light/50 hover:bg-hk-pink-pale';
    }
    return isActive
      ? 'bg-food-orange text-white shadow-md shadow-food-orange/20'
      : 'bg-white text-food-dark border border-food-purple/20 hover:bg-food-yellow/10';
  };

  const getChipClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-blue-light text-white border-hk-blue-dark'
        : 'bg-white text-hk-blue-dark border border-hk-blue-light/30 hover:border-hk-blue-light';
    }
    return isActive
      ? 'bg-food-purple text-white border-food-purple'
      : 'bg-white text-food-purple border border-food-purple/30 hover:border-food-purple';
  };

  return (
    <div className={`min-h-screen ${getBgClass()} py-12 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-extrabold ${getPrimaryText()} sm:text-5xl transition-colors duration-300`}>
            Toutes nos Recettes
          </h1>
          <p className={`mt-4 text-xl ${getSecondaryText()} transition-colors duration-300`}>
            Explorez notre collection complète de plats, entrées et desserts.
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-12 space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300 ${getFilterButtonClass(selectedCategory === cat)}`}
              >
                {cat === 'all' ? 'Tout' : cat}
              </button>
            ))}
          </div>

          {/* Equipment */}
          {allEquipment.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {allEquipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${getChipClass(selectedEquipment.includes(eq))}`}
                >
                  {eq}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} theme={theme} />
          ))}
        </div>

        {selectedRecipe && (
          <CocktailModal cocktail={selectedRecipe} onClose={() => setSelectedRecipe(null)} theme={theme} />
        )}
      </div>
    </div>
  );
}

export default AllFoodPage;
